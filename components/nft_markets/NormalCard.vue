<template lang="pug">
.normalcard.radius10.normal-card-shadow(v-if="mode === 'preview'" :class="[{ small }]" @click="$emit('click')")
  header.d-flex.justify-content-end
    .card_number.d-flex.align-items-center.color-green {{ "#" + mintCount }}
  video.main-img(v-if='videoBackground', autoplay='true', loop='true')
    source(
      :src='"https://resizer.atomichub.io/videos/v1/preview?ipfs=" + videoBackground.video + "&size=370&output=mp4"',
      type='video/mp4'
    )
  .main-img(v-else-if='imageBackground', :style='imageBackground')
  .main-img(v-else, :style='defaultBackground')

  .d-flex.flex-column.justify-content-between.align-items-center.p-3.card-title
    p.card-name {{ cardName }}
    p.disable {{ collectionName }}
      img.success-icon.ml-1(src='~/assets/images/check_circle.svg', alt='')

.normalcard.radius10.p-3(v-else-if="mode === 'accounts'")
  .d-flex.justify-content-center
    profile-image.account-image(:src="data.imgSrc" :size="128")
  .account-name {{ data.name }}
  .info-row.mb-1
    span.d-flex.align-items-center
      img.icon(:src="require('~/assets/icons/wax.svg')")
      p.ml-1.disable Value
    span.d-flex.align-items-center
      img.icon(:src="require('~/assets/icons/club.svg')")
      p.ml-1.disable Owned NFTs
  .info-row
    vue-skeleton-loader.mb-1(
      v-if="!suggestedAverageLoaded"
      :width='75',
      :height='17',
      animation='wave',
      wave-color='rgba(150, 150, 150, 0.1)',
      :rounded='true',
    )
    .account-value(v-else) {{ data.suggested_average ? data.suggested_average.toFixed(2) : 0 }} {{ this.$store.state.network.name.toUpperCase() }}
    vue-skeleton-loader.mb-1(
      v-if="!assetsCountLoaded"
      :width='25',
      :height='17',
      animation='wave',
      wave-color='rgba(150, 150, 150, 0.1)',
      :rounded='true',
    )
    .asset-counter(v-else) {{ data.assetsCount }}
  .info-row
    vue-skeleton-loader.mb-1(
      v-if="!suggestedAverageLoaded"
      :width='75',
      :height='17',
      animation='wave',
      wave-color='rgba(150, 150, 150, 0.1)',
      :rounded='true',
    )
    .account-value-usd(v-else) (${{ data.suggested_average ? $systemToUSD(data.suggested_average) : '0.00' }})
  .info-row.mt-3.flex.gap-6
    alcor-button.w-50(outline) Profile
    el-dropdown.w-50(trigger='click')
      alcor-button.w-100(access)
        span More
        i.el-icon-arrow-down
      el-dropdown-menu.dropdown
        el-dropdown-item.dropdown__item
          .dropdown__inner
            img(src='~/assets/icons/Handshake.svg')
            span Send Trade Offer
        el-dropdown-item.dropdown__item
          .dropdown__inner(@click="openTransferModal")
            img(src='~/assets/icons/ArrowsLeftRight.svg')
            span() Transfer
        el-dropdown-item.dropdown__item
          .dropdown__inner
            img(src='~/assets/icons/Storefront.svg')
            span Seller Page
        el-dropdown-item.dropdown__item
          .dropdown__inner(@click="removeFriendModal")
            img(src='~/assets/icons/UserMinus.svg')
            span Remove Friend
        el-dropdown-item.dropdown__item
          .dropdown__inner(@click="blockUserModal")
            img(src='~/assets/icons/SmileyXEyes.svg')
            span.red Block

nuxt-link.normalcard.radius10(
  v-else-if='mode === "sets"',
  :to='"#sets-" + data.collection_name'
)
  video.main-img(v-if='videoBackground', autoplay='true', loop='true')
    source(
      :src='"https://resizer.atomichub.io/videos/v1/preview?ipfs=" + videoBackground.video + "&size=370&output=mp4"',
      type='video/mp4'
    )
  .main-img(v-else-if='imageBackground', :style='imageBackground')
  .main-img(v-else, :style='defaultBackground')
  .offer-information(v-if='mode === "sets"')
    p.wax-name.text-center.mt-3.text-white {{ cardName }}
.normalcard.radius10(v-else)
  header.d-flex.justify-content-between.mb-1.align-items-center(
    v-if='mode != "templates" && mode != "sets" && mode != "setsList"'
  )
    div.header-title
      img.owner-image(src='~/assets/images/small_shape.svg')
      span {{ cardTitle }}
    .d-flex.align-items-center.info(v-if='mode != "schemas"')
      img(src='~/assets/images/double_arrow.svg', alt='')
      img(src='~/assets/images/fire.svg', alt='')
      .card_number.d-flex.align-items-center.ml-1 {{ "#" + mintCount }}
  video.main-img(v-if='videoBackground', autoplay='true', loop='true')
    source(
      :src='"https://resizer.atomichub.io/videos/v1/preview?ipfs=" + (videoBackground.video || videoBackground) + "&size=370&output=mp4"',
      type='video/mp4'
    )
  .main-img(v-else-if='imageBackground', :style='imageBackground')
  .main-img(v-else, :style='defaultBackground')
  .offer-information
    .d-flex.justify-content-between(
      v-if='mode != "sold" && mode != "bought" && mode != "setsList"'
    )
      p.disable(v-if='mode != "schemas"')
        | Alcorex
        img.success-icon.ml-1(src='~/assets/images/check_circle.svg', alt='')
      p.disable(v-if='mode === "auctions"') Last Offer
      p.disable(
        v-else-if='kindBut === "sales" || kindBut === "auctions" || kindBut === "all"'
      ) Price
      p.disable(v-else-if='mode === "inventory"') Purchase price
      p.disable(v-else-if='mode === "listings"') Listed Price
    .d-flex.justify-content-between(
      v-if='mode === "sold" || mode === "bought" || mode === "setsList"'
    )
      p.default-price {{ cardName }}
      p {{ collectionName }}
    .d-flex.justify-content-between(v-if='mode != "sold" && mode != "bought" && mode != "setsList"')
      p.wax-name {{ cardName }}
      p.color-wax.fs-14(v-if="mode === 'inventory'") {{ new Intl.NumberFormat().format(waxPrice) }} WAX
      p.wax-price(
        v-if='kindBut === "sales" || kindBut === "auctions" || kindBut === "all"'
      )
        | {{ new Intl.NumberFormat().format(waxPrice) }} WAX
    .d-flex.justify-content-between(
      v-if='mode != "sold" && mode != "bought" && mode != "setsList"'
    )
      p.default-price(v-if='mode != "schemas"') Default
      p.green.fs-12(v-if="mode === 'inventory'") (${{ $systemToUSD(waxPrice) }})
      p.default-price(
        v-if='kindBut === "sales" || kindBut === "auctions" || kindBut === "all"'
      )
        | (${{ $systemToUSD(waxPrice) }})
    .mt-2(v-if='mode === "auctions"')
      .d-flex.justify-content-between
        p {{ endsIn }}
        p {{ bidCount }} Bids
    .mt-3(v-if='mode === "listings"')
      .d-flex.justify-content-between.fs-12
        p.disable Best offer by
        p.disable Last offer
      .d-flex.justify-content-between.fs-12
        .best-offer.d-flex
          img.success-icon.mr-2(
            v-if='bestOffer',
            src='~/assets/images/MatrixCheems.svg',
            alt=''
          )
          p.green {{ bestOffer }}
        p.wax-price.fs-14 {{ new Intl.NumberFormat().format(bestPrice) }}WAX
      .d-flex.justify-content-end.fs-12.green (${{ $systemToUSD(bestPrice) }})
    .mt-2.sets-list-info(v-if='mode === "setsList"')
      .d-flex.justify-content-between
        p Owns:
          span.ml-1 0
        div(v-if='data.is_transferable')
          img(src='~/assets/images/double_arrow.svg')
          span.ml-2.fs-18 Transferable
      .d-flex.justify-content-between
        p Unboxed:
          span.ml-1 420
        div(v-if='data.is_burnable')
          img(src='~/assets/images/fire.svg')
          span.ml-2.fs-18 Burnable
      p Supply:
        span.ml-1 {{ maxSupply + " (" + supply }}
          img.ml-1(src='~/assets/images/fire.svg', alt='')
          span )
  .btn-group.actions.justify-content-between.flex-wrap.w-100(v-if='mode != "sets"')
    alcor-button.w-49(v-if='mode == "inventory" && !data.sales.length' @click="openListingModal")
      i.el-icon-news
      span Sell NFT
    alcor-button.w-49(v-else-if='mode == "inventory" && data.sales.length' @click="openEditModal")
      i.el-icon-edit
      span Edit
    el-dropdown.w-49(trigger='click' v-if='mode == "inventory"')
      alcor-button.w-100(access)
        span More
        i.el-icon-arrow-down
      el-dropdown-menu.dropdown
        el-dropdown-item.dropdown__item
          .dropdown__inner
            img(src='~/assets/icons/Handshake.svg')
            span Craft
        el-dropdown-item.dropdown__item
          .dropdown__inner
            img(src='~/assets/icons/Handshake.svg')
            span Transfer
        el-dropdown-item.dropdown__item
          .dropdown__inner
            img(src='~/assets/icons/Handshake.svg')
            span New Trade
        el-dropdown-item.dropdown__item
          .dropdown__inner
            img(src='~/assets/icons/Handshake.svg')
            span Create Gift Link
        el-dropdown-item.dropdown__item
          .dropdown__inner
            img(src='~/assets/icons/Handshake.svg')
            span Burn

    el-dropdown.btn-fill--green.dropdown-more.radius6.p-0.d-flex.justify-content-center.align-items-center(
      trigger='click'
      v-if='mode == "friends"'
    )
      span.el-dropdown-link
        span More
        i.el-icon-arrow-down.el-icon--right
      span
      el-dropdown-menu(slot='dropdown')
        nuxt-link.dropdown-item.d-flex.align-items-center(
          to='/wallet-inventory/trade-offer'
        )
          img.mr-1(src='~/assets/icons/Handshake.svg')
          p Send Trade Offer
        nuxt-link.dropdown-item.d-flex.align-items-center(to='#')
          img.mr-1(src='~/assets/icons/ArrowsLeftRight.svg')
          p Transfer
        nuxt-link.dropdown-item.d-flex.align-items-center(to='#')
          img.mr-1(src='~/assets/icons/Storefront.svg')
          p Seller Page
        nuxt-link.dropdown-item.d-flex.align-items-center(to='#')
          img.mr-1(src='~/assets/icons/UserMinus.svg')
          p Remove Friend
        nuxt-link.dropdown-item.d-flex.align-items-center.block-item(to='#')
          img.mr-1(src='~/assets/icons/SmileyXEyes.svg')
          p Block
    alcor-button.w-100.mt-2(v-if="mode === 'inventory'" outline @click="$router.push('/nfts/' + data.asset_id)") Details

    button.btn-border--green.mr10.radius6.smaller-btn(
      v-if='mode != "inventory" && mode != "bought" && mode != "setsList"'
    ) Details
    button.btn-fill--green.bigger-btn.radius6(v-if='kindBut == "sales"' @click="openBuyModal") Buy
    button.btn-fill--green.bigger-btn.radius6(v-if='kindBut == "auctions"' @click="openOfferModal") Make Offer
    button.btn-border--green.w-100.radius6.mb-2(
      v-if='mode == "bought" || mode === "setsList"'
    ) Detail
    button.btn-fill--green.bigger-btn.radius6(
      v-if='kindBut != "sales" && kindBut != "auctions" && mode != "inventory" && mode != "listings" && mode != "auctions" && mode != "sold" && mode != "bought" && mode != "setsList"'
    ) Send Offer
    button.btn-border--green.bigger-btn.radius6(v-if='mode === "setsList"') Inventory
    button.btn-fill--green.radius6(v-if='mode == "setsList"') Market
    button.btn-fill--green.bigger-btn.radius6(v-if='mode === "sold"') Market
    button.btn-fill--green.bigger-btn.radius6(v-if='mode === "listings" && !kindBut') Buy
    button.btn-fill--green.bigger-btn.radius6(v-if='mode === "auctions" && !kindBut') Make Offer
    button.btn-fill--green.bigger-btn.radius6(v-if='mode === "listings" && kindBut == "all"' @click="openEditModal") Edit
    button.btn-fill--green.bigger-btn.radius6(v-if='mode === "auctions" && kindBut == "all"' @click="openEditModal") Manage
</template>

<script>
import { mapActions } from 'vuex'
import VueSkeletonLoader from 'skeleton-loader-vue'
import AlcorButton from '@/components/AlcorButton'
import ProfileImage from '~/components/ProfileImage.vue'
import defaultImg from '~/assets/images/default.png'

export default {
  name: 'NormalCard',
  components: { VueSkeletonLoader, ProfileImage, AlcorButton },
  props: ['data', 'price', 'kindBut', 'mode', 'suggestedAverageLoaded', 'assetsCountLoaded', 'small', 'disable'],

  data() {
    return {
      search: '',
      showBuyModal: false,
      defaultBackground: {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: 'url(' + defaultImg + ')',
      },
      defaultPrice: 0,
      sellOrders: [],
    }
  },
  computed: {
    videoBackground() {
      if (this.mode === 'market') {
        if (this.data.assets[0].data.video) {
          return this.data.assets[0].data
        } else return false
      } else if (this.mode === 'templates' || this.mode === 'setsList') {
        if (this.data.immutable_data.video) {
          return this.data.immutable_data
        } else return false
      } else if (this.mode === 'inventory' || this.mode === 'sets' || this.mode === 'preview') {
        if (this.data.data.video) {
          return this.data.data
        } else return false
      } else if (
        this.mode === 'listings' ||
        this.mode === 'auctions' ||
        this.mode === 'sold' ||
        this.mode === 'bought'
      ) {
        if (this.data.assets && this.data.assets[0].data.video) {
          return this.data.assets[0].data.video
        } else return false
      } else return false
    },
    imageBackground() {
      if (this.mode === 'market') {
        if (this.data.assets[0].data.img) {
          return {
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: this.data.assets[0].data.img.includes('https://')
              ? this.data.assets[0].data.img
              : 'url(https://resizer.atomichub.io/images/v1/preview?ipfs=' +
              this.data.assets[0].data.img +
              '&size=370)'
          }
        } else return false
      } else if (this.mode === 'inventory' || this.mode === 'sets' || this.mode === 'preview') {
        if (this.data.data.img) {
          return {
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: this.data.data.img.includes('https://')
              ? this.data.data.img
              : 'url(https://resizer.atomichub.io/images/v1/preview?ipfs=' +
              this.data.data.img +
              '&size=370)',
          }
        } else return false
      } else if (
        this.mode === 'listings' ||
        this.mode === 'auctions' ||
        this.mode === 'sold' ||
        this.mode === 'bought'
      ) {
        if (this.data.assets && this.data.assets[0].data.img) {
          return {
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: this.data.assets[0].data.img.includes('https://')
              ? this.data.assets[0].data.img
              : 'url(https://resizer.atomichub.io/images/v1/preview?ipfs=' +
              this.data.assets[0].data.img +
              '&size=370)',
          }
        } else return false
      } else if (this.mode === 'assets') {
        if (this.data.data.img) {
          return {
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: this.data.data.img.includes('https://')
              ? this.data.data.img
              : 'url(https://resizer.atomichub.io/images/v1/preview?ipfs=' +
              this.data.data.img +
              '&size=370)',
          }
        } else return false
      } else if (this.mode === 'templates' || this.mode === 'setsList') {
        if (this.data.immutable_data.img) {
          return {
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: this.data.immutable_data.img.includes('https://')
              ? this.data.immutable_data.img
              : 'url(https://resizer.atomichub.io/images/v1/preview?ipfs=' +
              this.data.immutable_data.img +
              '&size=370)',
          }
        } else return false
      } else if (this.mode === 'schemas') {
        if (this.data.collection.img) {
          return {
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: this.data.collection.img.includes('https://')
              ? this.data.collection.img
              : 'url(https://resizer.atomichub.io/images/v1/preview?ipfs=' +
              this.data.collection.img +
              '&size=370)',
          }
        } else return false
      } else if (this.data.sell && this.data.sell[0].mdata) {
        return {
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'url(' + this.data.sell[0].mdata.img + ')',
        }
      } else return false
    },
    mintCount() {
      let string = ''
      if (this.mode === 'market') {
        string = this.data.assets[0].template_mint
      } else if (this.mode === 'assets' || this.mode === 'inventory' || this.mode === 'preview') {
        string = this.data.template_mint
      } else if (
        this.mode === 'listings' ||
        this.mode === 'auctions' ||
        this.mode === 'sold' ||
        this.mode === 'bought'
      ) {
        string = this.data.assets[0]?.template_mint
      } else string = this.data.id || 0
      if (string.length > 4) {
        return string.substr(0, 1) + '...' + string.substr(-3)
      } else {
        return string
      }
    },
    cardTitle() {
      if (this.mode === 'market') {
        return this.data.seller
      } else if (this.mode === 'assets') {
        return this.data.owner
      } else if (this.mode === 'schemas') {
        return this.data.collection.author
      } else if (this.mode === 'inventory') {
        return this.data.owner
      } else if (
        this.mode === 'listings' ||
        this.mode === 'auctions' ||
        this.mode === 'sold' ||
        this.mode === 'bought'
      ) {
        return this.data.assets[0].owner
      } else return this.data.maker
    },
    bestPrice() {
      if (this.mode === 'listings' || this.mode === 'auctions') {
        if (this.data.price) {
          return (
            this.data.price.amount /
            Math.pow(10, this.data.price.token_precision)
          )
        } else return 0
      }
      return 0
    },
    waxPrice() {
      if (this.mode === 'inventory') {
        return this.data.purchasePrice.price / Math.pow(10, this.data.purchasePrice.token_precision)
      }
      if (this.mode === 'market') {
        return (
          this.data.price.amount / Math.pow(10, this.data.price.token_precision)
        )
      } else if (this.mode === 'assets') {
        return 0
      } else if (this.mode === 'inventory') {
        if (this.data.prices && this.data.prices[0]) {
          return (
            this.data.prices[0].average /
            Math.pow(10, this.data.prices[0].token.token_precision)
          )
        } else return 0
      } else if (this.mode === 'listings') {
        if (this.data.listing_price) {
          return (
            this.data.listing_price /
            Math.pow(10, this.data.price.token_precision)
          )
        } else return 0
      } else if (this.mode === 'auctions') {
        return 0
      } else return this.data.buy.quantity.replaceAll('WAX') * 1
    },
    cardName() {
      if (
        this.mode === 'market' ||
        this.mode === 'listings' ||
        this.mode === 'auctions' ||
        this.mode === 'sold' ||
        this.mode === 'bought'
      ) {
        return this.data.assets[0].name
      } else if (
        this.mode === 'assets' ||
        this.mode === 'templates' ||
        this.mode === 'inventory' ||
        this.mode === 'sets' ||
        this.mode === 'preview' ||
        this.mode === 'setsList'
      ) {
        return this.data.name
      } else if (this.mode === 'schemas') {
        return this.data.collection.name
      }
      return this.data.sell[0].owner
    },
    bestOffer() {
      if (this.mode === 'listings' || this.mode === 'auctions') {
        return this.data.buyer
      }
      return ''
    },
    endsIn() {
      if (this.mode === 'auctions') {
        let timeDiff
        if (new Date(+this.data.end_time) - new Date() > 0) {
          timeDiff =
            Math.floor(
              (new Date(+this.data.end_time) - new Date()) / 86400000
            ) +
            'd ' +
            Math.floor(
              ((new Date(+this.data.end_time) - new Date()) % 86400000) /
              3600000
            ) +
            'h'
        } else timeDiff = '0s'
        return timeDiff
      }
      return ''
    },
    bidCount() {
      if (this.mode === 'auctions') {
        return this.data.bids.length
      }
      return 0
    },
    collectionName() {
      if (this.mode === 'setsList' || this.mode === 'review') {
        return this.data.collection.name
      } else return 'Alcorex'
    },
    maxSupply() {
      if (this.mode === 'setsList') {
        return this.data.max_supply
      }
      return 0
    },
    supply() {
      if (this.mode === 'setsList') {
        return this.data.issued_supply
      }
      return 0
    }
  },
  methods: {
    ...mapActions('modal', ['buy', 'transfer', 'removeFriend', 'blockUser', 'listing', 'makeOffer']),
    openBuyModal() {
      this.buy(this.data)
    },
    openOfferModal() {
      this.makeOffer(this.data)
    },
    openListingModal() {
      this.listing(this.data)
    },
    openEditModal() {
      const mode = this.mode === 'auctions' ? 'auctions' : 'sales'
      this.listing({ ...this.data, mode })
    },
    openTransferModal() {
      this.transfer(this.data)
    },
    removeFriendModal() {
      this.removeFriend(this.data)
    },
    blockUserModal() {
      this.blockUser(this.data)
    }
  }
}
</script>

<style lang="scss">
.normalcard {
  width: 220px;
  height: fit-content;
  background-color: var(--background-color-third);
  border-radius: 10px;

  .icon {
    width: 14px;
    height: 14px;
  }

  .account-image {
    width: 128px;
    height: 128px;
  }

  .card-name {
    font-size: 18px;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
  }

  &.small {
    width: 170px;

    .main-img {
      height: 140px;
    }

    .card-name {
      font-size: 14px;
    }
  }

  .actions {
    padding: 6px;
  }

  .el-dropdown-link {
    color: var(--text-theme);
    font-size: 14px;

    x &:hover {
      * {
        color: #000 !important;
      }
    }
  }

  p {
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    &.disable {
      color: var(--text-disable);
      font-size: 12px;
      line-height: 14px;
    }
  }

  .sets-list-info {
    p {
      color: #9f979a;
      font-size: 10px;
    }

    span {
      font-size: 10px;
      color: white;
    }
  }

  header {
    white-space: nowrap;
    padding: 6px;
    color: var(--main-action-green);
    font-size: 12px;
    font-weight: 500;
    line-height: 14px;

    .header-title,
    .info {
      display: flex;
      gap: 8px;
    }

    img {
      height: 16px;
    }

  }

  .offer-information {
    padding: 6px;
  }

  .card_number {
    padding: 0 3px;
    border-radius: 3px;
    height: 22px;
    background-color: var(--card-number);
  }

  .offer-information .success-icon {
    width: 10px;
    height: 10px;
  }

  .radius10 {
    border-radius: 10px !important;
  }

  .radius6 {
    border-radius: 6px !important;
  }

  .mr10 {
    margin-right: 10px !important;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
  }

  .account-name {
    font-size: 24px;
    line-height: 20px;
    text-align: center;
    padding: 16px 0;
  }

  .account-value {
    color: var(--main-wax);
    font-size: 14px;
  }

  .account-value-usd {
    font-size: 14px;
    color: var(--main-green)
  }

  .asset-counter {
    font-size: 14px;
  }

  .wax-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    color: var(--color-text-primary)
  }

  .btn-border--green {
    height: 33px;
    color: var(--text-default);
    background-color: var(--btn-active);
    border: 1px solid var(--main-action-green);
    font-size: 14px;
    padding: 5px 10px;
    font-weight: 400;
  }

  .btn-border--green:hover {
    background-color: transparent;
    color: var(--main-action-green);
  }

  .full-btn {
    width: 100%;
  }

  .btn-fill--green {
    color: #000;
    width: 82px;
    height: 33px;
    background-color: var(--main-action-green);
    border: 1px solid var(--main-action-green);
    font-size: 14px;
    font-weight: 400;
    padding: 5px 10px;

    &:hover {
      background-color: transparent;
      color: var(--main-action-green);
    }
  }

  .dropdown-more {
    .dropdown-toggle {
      display: flex;
      align-items: center;
      background-color: transparent !important;
      border: 0;
      box-shadow: none !important;
      color: #000 !important;

      &::after {
        margin-left: 10px;
        margin-top: 2px;
      }
    }

    &:hover {
      background-color: var(--main-action-green);
      border: 1px solid var(--main-action-green);
    }

    .dropdown-menu {
      width: 130px;
      background-color: var(--btn-default);
      padding: 0;

      .dropdown-item {
        padding: 5px 7px;
        color: #fff !important;
        font-size: 12px;

        p {
          color: #fff;
        }

        &:hover {
          background-color: #3c3c43;
        }

        &:not(.dropdown-item:last-child) {
          border-bottom: 1px solid #3c3c43;
        }

        &.block-item {
          color: #ff7262 !important;

          p {
            color: #ff7262;
          }
        }
      }
    }
  }

  .btn-fill--grey {
    color: #fff;
    height: 33px;
    background-color: var(--btn-default);
    border: 1px solid transparent;
    font-size: 14px;
    font-weight: 400;
    padding: 5px 10px;

    &:hover {
      background-color: transparent;
      border-color: var(--btn-default);
    }
  }

  .smaller-btn {
    width: 83px;
  }

  .bigger-btn {
    width: 115px;
  }

  .main-img {
    width: 100%;
    height: 229.9px;
    object-fit: contain;
    background-position: center;
  }

  .wax-price {
    color: #f89022;
    font-size: 14px;
  }

  .default-price,
  .best-offer {
    color: var(--main-action-green);
    font-size: 14px;
    font-weight: 500;
  }

  @media only screen and (max-width: 600px) {
    .market-cards .item {
      width: 100%;
    }
  }
}

</style>
