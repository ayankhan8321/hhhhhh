import { Router } from 'express'
import { cacheSeconds } from 'route-cache'
import { write_decimal } from 'eos-common'

import { SwapPool, Bar, Match, Market } from '../../models'
import { getTokens } from '../../utils'

const depthHandler = (req, res, next) => {
  if (req.query.depth && isNaN(parseInt(req.query.depth))) return res.status(403).send('Invalid depth')
  req.query.depth = parseInt(req.query.depth) || 300
  next()
}

function tickerHandler(req, res, next) {
  const ticker_id = req.query.ticker_id || req.params.ticker_id

  if (!ticker_id || ticker_id.match(/.*-.*_.*-[A-Za-z0-9.]+$/) == null)
    // TODO Fixme не понятная ошибка
    return res.status(403).send('Invalid ticker_id')

  req.query.ticker_id = ticker_id.toLowerCase()
  req.params.ticker_id = ticker_id.toLowerCase()
  next()
}

export const spot = Router()

function formatToken(token) {
  return {
    id: token.id,
    contract: token.contract,
    symbol: token.symbol.name,
    precision: token.symbol.precision
  }
}

function formatTicker(m, tokens = []) {
  const [base, target] = m.ticker_id.split('_')

  m.market_id = m.id
  m.target_currency = target.toLowerCase()
  m.base_currency = base.toLowerCase()

  const target_token = tokens.find(t => t.id == m.target_currency)
  const base_token = tokens.find(t => t.id == m.base_currency)

  m.target_cmc_ucid = target_token?.cmc_id || null
  m.base_cmc_ucid = base_token?.cmc_id || null

  delete m.id
}

spot.get('/pairs', cacheSeconds(60, (req, res) => {
  return req.originalUrl + '|' + req.app.get('network').name
}), async (req, res) => {
  // TODO Filter by base/quote
  const network = req.app.get('network')
  const { base, target } = req.query

  const q = { chain: network.name }

  if (base) q['quote_token.id'] = base.toLowerCase()
  if (target) q['base_token.id'] = target.toLowerCase()

  const markets = await Market.find(q).select('base_token quote_token ticker_id').lean()

  const pairs = []
  markets.map(m => {
    const base = formatToken(m.quote_token)
    const target = formatToken(m.base_token)

    pairs.push({ base, target, ticker_id: m.ticker_id })
  })

  res.json(pairs)
})

// Tickers with merged volumes from pools
spot.get('/tickers', cacheSeconds(60, (req, res) => {
  return req.originalUrl + '|' + req.app.get('network').name
}), async (req, res) => {
  const network = req.app.get('network')
  const { merge_volume } = req.query

  console.log({ merge_volume })

  const tokens = await getTokens(network.name)

  const pools = await SwapPool.find({ chain: network.name }).select('-_id -__v').lean()

  const markets = await Market.find({ chain: network.name })
    .select('-_id -__v -chain -quote_token -base_token -changeWeek -volume24 -volumeMonth -volumeWeek').lean()

  markets.forEach(m => {
    formatTicker(m, tokens)

    const market_pools = pools.filter(p => {
      return (
        (p.tokenA.id == m.target_currency) && (p.tokenB.id == m.base_currency)
      ) || (
        (p.tokenA.id == m.base_currency) && (p.tokenB.id == m.target_currency)
      )
    })

    market_pools.forEach(p => {
      if (p.tokenA.id == m.target_currency && p.tokenB.id == m.base_currency) {
        m.target_volume += p.volumeA24
        m.base_volume += p.volumeB24
      }

      if (p.tokenA.id == m.base_currency && p.tokenB.id == m.target_currency) {
        m.base_volume += p.volumeA24
        m.target_volume += p.volumeB24
      }
    })
  })

  res.json(markets)
})


spot.get('/tickers/:ticker_id', tickerHandler, cacheSeconds(1, (req, res) => {
  return req.originalUrl + '|' + req.app.get('network').name
}), async (req, res) => {
  const network = req.app.get('network')

  const { ticker_id } = req.params
  const tokens = await getTokens(network.name)
  const m = await Market.findOne({ ticker_id, chain: network.name })
    .select('-_id -__v -chain -quote_token -base_token -changeWeek -volume24 -volumeMonth -volumeWeek').lean()

  formatTicker(m, tokens)

  res.json(m)
})

spot.get('/tickers/:ticker_id/orderbook', tickerHandler, depthHandler, async (req, res) => {
  const network = req.app.get('network')
  const redisClient = req.app.get('redisClient')

  const { depth, ticker_id } = req.query

  const market = await Market.findOne({ ticker_id, chain: network.name })
  if (!market) return res.status(404).send(`Ticker ${ticker_id} not found or closed :(`)

  const bids = (JSON.parse(await redisClient.get(`orderbook_${network.name}_buy_${market.id}`)) || []).slice(0, depth)
  const asks = (JSON.parse(await redisClient.get(`orderbook_${network.name}_sell_${market.id}`)) || []).slice(0, depth)

  return res.json({
    ticker_id,
    bids: bids.map(b => [write_decimal(b[0], 8, false), write_decimal(b[1][1], market.base_token.symbol.precision, false)]),
    asks: asks.map(a => [write_decimal(a[0], 8, false), write_decimal(a[1][1], market.quote_token.symbol.precision, false)])
  })
})

spot.get('/tickers/:ticker_id/latest_trades', tickerHandler, cacheSeconds(1, (req, res) => {
  return req.originalUrl + '|' + req.app.get('network').name + '|' + req.params.market_id + '|' + req.query.limit
}), async (req, res) => {
  const network = req.app.get('network')
  const limit = parseInt(req.query.limit) || 300

  const { ticker_id } = req.params
  const market = await Market.findOne({ ticker_id, chain: network.name })
  if (!market) return res.status(404).send(`Market with id ${ticker_id} not found or closed :(`)

  const matches = await Match.find({ chain: network.name, market: market.id })
    .select('_id time bid ask unit_price type trx_id')
    .sort({ time: -1 })
    .limit(limit)
    .lean()

  matches.map(m => {
    m.trade_id = m._id
    m.price = m.unit_price

    m.base_volume = m.type == 'buymatch' ? m.ask : m.bid
    m.target_volume = m.type == 'buymatch' ? m.bid : m.ask

    m.time = m.time.getTime()
    m.type = m.type == 'buymatch' ? 'buy' : 'sell'

    delete m._id
    delete m.ask
    delete m.bid
    delete m.unit_price
  })

  res.json(matches)
})

spot.get('/tickers/:ticker_id/historical_trades', tickerHandler, cacheSeconds(1, (req, res) => {
  return req.originalUrl + '|' + req.app.get('network').name + '|' + req.params.market_id + '|' + req.query.limit
}), async (req, res) => {
  const network = req.app.get('network')

  const { ticker_id } = req.params
  const { type, from, to } = req.query

  const market = await Market.findOne({ ticker_id, chain: network.name })
  if (!market) return res.status(404).send(`Market with id ${ticker_id} not found or closed :(`)

  const limit = parseInt(req.query.limit) || 200
  const skip = parseInt(req.query.skip) || 0

  const q = { chain: network.name, market: market.id }
  if (type) q.type = type == 'buy' ? 'buymatch' : 'sellmatch'
  if (from || to) {
    q.time = {}

    if (from) q.time.$gte = new Date(parseInt(from))
    if (to) q.time.$lte = new Date(parseInt(to))
  }

  const matches = await Match.find(q)
    .select('_id price time bid ask unit_price type trx_id')
    .sort({ time: 1 })
    .skip(skip)
    .limit(limit)
    .lean()

  matches.map(m => {
    m.trade_id = m._id
    m.price = m.unit_price
    m.base_volume = m.type == 'buymatch' ? m.ask : m.bid
    m.target_volume = m.type == 'buymatch' ? m.bid : m.ask
    m.time = m.time.getTime()
    m.type = m.type == 'buymatch' ? 'buy' : 'sell'

    delete m._id
    delete m.ask
    delete m.bid
    delete m.unit_price
  })

  res.json(matches)
})

spot.get('/tickers/:ticker_id/charts', tickerHandler, async (req, res) => {
  const { ticker_id } = req.params
  const network = req.app.get('network')

  const market = await Market.findOne({ ticker_id, chain: network.name })
  if (!market) return res.status(404).send(`Ticker ${ticker_id} not found or closed :(`)

  const { from, to, resolution, limit } = req.query
  if (!resolution) return res.status(404).send('Incorrect resolution..')

  const where = { chain: network.name, timeframe: resolution.toString(), market: parseInt(market.id) }

  if (from && to) {
    where.time = {
      $gte: new Date(parseInt(from)),
      $lte: new Date(parseInt(to))
    }
  }

  const q = [
    { $match: where },
    { $sort: { time: 1 } },
    {
      $project: {
        time: { $toLong: '$time' },
        open: 1,
        high: 1,
        low: 1,
        close: 1,
        volume: 1
      }
    }
  ]

  if (limit) q.push({ $limit: parseInt(limit) })

  const charts = await Bar.aggregate(q)
  charts.map(c => { delete c._id })

  res.json(charts)
})
