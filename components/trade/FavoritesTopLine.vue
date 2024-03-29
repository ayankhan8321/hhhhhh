<template lang="pug">
.top-favorite-markets.start(ref="panel")
  .market.pointer(
    v-for="market in favorites",
    @click="() => setMarket(market)",
    :class='activeFavClassName(market.id)',
    )
    .d-flex
      .icon.d-flex.align-items-center
        TokenImage(
          :src='$tokenLogo(market.quote_token.symbol.name, market.quote_token.contract)',
          height='20'
        )
      .name {{ market.symbol }}
    .change
      .red(v-if="market.change24 < 0") {{ market.last_price | commaFloat(5) }} ({{ market.change24 | commaFloat(2) }}%)
      .green(v-else) {{ market.last_price | commaFloat(5) }} ({{ market.change24 | commaFloat(2) }}%)
</template>

<script>
import { mapState } from 'vuex'

import TokenImage from '~/components/elements/TokenImage'

export default {
  components: {
    TokenImage
  },

  computed: {
    ...mapState(['markets', 'network']),
    ...mapState('market', ['id', 'quote_token']),
    ...mapState('settings', ['favMarkets']),

    favorites() {
      return this.markets.filter((i) => this.favMarkets.includes(i.id))
    }
  },

  watch: {
    'favorites.length'() {
      this.assignClass()
    }
  },

  mounted() {
    this.assignClass()
    this.$refs.panel.onwheel = e => {
      if (this.getInnerWidth() - this.$refs.panel.clientWidth < this.$refs.panel.scrollLeft) {
        this.$refs.panel.classList.add('end')
      } else {
        this.$refs.panel.classList.remove('end')
      }

      if (this.$refs.panel.scrollLeft == 0) {
        this.$refs.panel.classList.add('start')
      } else this.$refs.panel.classList.remove('start')

      this.$refs.panel.scrollLeft += e.deltaY
      e.preventDefault()
    }
  },

  methods: {
    getInnerWidth() {
      return Array.from(this.$refs.panel.children).reduce((sumW, child) => sumW + child.clientWidth, 0)
    },
    assignClass() {
      setTimeout(() => {
        if (this.getInnerWidth() > this.$refs.panel.clientWidth) {
          this.$refs.panel.classList.add('shadow')
        } else {
          this.$refs.panel.classList.remove('shadow')
          this.$refs.panel.classList.add('start')
        }
      })
    },
    setMarket(market) {
      if (this.id == market.id) return

      if (!isNaN(this.id)) {
        this.$store.dispatch('market/unsubscribe', this.id)
      }

      this.$router.push(
        { name: `trade-index-id___${this.$i18n.locale}`, params: { id: market.slug } },
        () => this.loading = false,
        () => this.loading = false
      )
    },

    activeFavClassName(id) {
      return this.id === id ? 'active' : ''
    }
  }
}
</script>

<style lang="scss">
.top-favorite-markets {
  border: 1px solid #212124;
  box-sizing: border-box;
  border-radius: 2px;

  background-color: var(--background-color-base);

  width: 100%;
  display: flex;
  flex-flow: row;
  flex-wrap: nowrap;
  overflow: scroll;

  // TODO
  //position: relative;
  &.shadow::after {
    pointer-events: none;
    /* ignore clicks */
    content: "";
    position: absolute;
    z-index: 10;
    height: 100%;
    left: 0;
    bottom: 0;
    width: 100%;
  }

  &.end::after {
    pointer-events: none;
    /* ignore clicks */
    content: "";
    position: absolute;
    z-index: 10;
    height: 50px;
    left: 0;
    top: 0;
    width: 100%;

    background: none;
  }


  &:not(.start)::before {
    pointer-events: none;
    /* ignore clicks */
    content: "";
    position: absolute;
    z-index: 10;
    height: 100%;
    left: 0;
    bottom: 0;
    width: 100%;

  }

  .name {
    margin-left: 6px;
    font-size: 14px;
    align-self: center;
  }

  .change {
    font-size: 12px;
  }

  .market {
    padding: 3px 16px 5px 8px;
    border-right: 1px solid var(--border-color);
    min-width: max-content;

    &.active {
      background-color: var(--btn-default);
    }
  }

  .right-shadow {
    // TODO
    //height: 60px;
    //width: 30px;

    //position: absolute;
    //right: 0;
    //top: 0;

    //background: linear-gradient(270deg, #212124 0%, rgba(18, 18, 18, 0) 100%);
  }
}

.top-favorite-markets {
  background-color: var(--trade-bg) !important;
  border: none !important;
}

.top-favorite-markets::-webkit-scrollbar {
  display: none;
}

.change {
  .green {
    color: var(--color-primary);
  }

  .red {
    color: var(--color-secondary);
  }
}
</style>
