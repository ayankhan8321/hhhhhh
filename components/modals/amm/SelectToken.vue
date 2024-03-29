<template lang="pug">
.select-token-modal.d-flex.align-items-center.gap-8
  .select-token-button(
    @click='locked ? "" : (visible = true)',
    :class='{ locked, w100, notSelected: !token }'
  )
    .d-flex.align-items-center(v-if='token')
      TokenImage.mr-2(
        :src='$tokenLogo(token.currency || token.symbol, token.contract)',
        height='25'
      )
      .ft-14 {{ token.currency || token.symbol }}
    .d-flex.align-items-center.select-token-text(v-else) Select token
    i.el-icon-arrow-down.ml-auto(v-if='!locked')

  //append-to-body
  el-dialog(
    title='Select Token',
    :visible='visible',
    @close='visible = false',
    custom-class='select-token-modal',
    :before-close='beforeDialogClose',
    @mousedown.native='dialogMousedown',
    @mouseup.native='dialogMouseup'
  )
    #assets-modal-component
      compact-tabs(:tabs='tabs', :active.sync='tab')
        template(#tab='{ tab: { label, value } }')
          .d-flex.align-items-center.gap-8(v-if='value === "owned"')
            i.el-icon-wallet
            .fs-14 {{ label }}
          .fs-14(v-else) {{ label }}

      .body.mt-2.p-3
        el-input(
          prefix-icon='el-icon-search',
          v-model='search',
          size='small',
          placeholder='Search'
        )
        hr
        .d-flex.flex-column
          .d-flex.align-items-center.gap-8.pointer.p-2.br-8.hover-bg-lighter(
            v-for='({ currency, symbol, contract }, index) in tokens',
            @click='selectAsset(tokens[index])'
          )
            TokenImage(
              :src='$tokenLogo(currency || symbol, contract)',
              height='20'
            )

            .d-flex.gap-4.align-items-center
              .fs-14.contrast {{ currency || symbol }}
              .fs-10.disable ({{ contract }})

        hr.separator
        .text-center.color-green.pointer Request new token
</template>

<script>
import AlcorModal from '~/components/AlcorModal.vue'
import CompactTabs from '~/components/CompactTabs.vue'
import TokenImage from '~/components/elements/TokenImage'

export default {
  components: { AlcorModal, CompactTabs, TokenImage },

  props: {
    tokens: {},
    token: {},
    locked: { type: Boolean, default: false },
    w100: { type: Boolean, default: false },
  },

  data: () => ({
    visible: false,

    search: '',
    tab: 'all',
    selected: null,

    tabs: [
      { label: 'Owned', value: 'owned' },
      { label: 'All', value: 'all' },
    ],
  }),
  computed: {
    filteredAssets() {
      return this.assets.filter((asset) =>
        Object.values(asset).join().includes(this.search)
      )
    },
  },
  methods: {
    selectAsset(v) {
      this.$emit('selected', v)
      this.visible = false
    },
  },
}
</script>

<style lang="scss">
.select-token-modal {
  .el-dialog {
    width: 90%;
    max-width: 400px;
  }
  .el-dialog__body {
    padding: 0px;
  }
  .body .el-input .el-input__inner {
    background: var(--select-color);
    border-radius: 4px;
  }

  hr {
    background: var(--border-color);
  }

  .select-token-button {
    display: flex;
    align-items: center;
    padding: 5px 9px;
    border-radius: 8px;
    gap: 8px;
    cursor: pointer;
    background: var(--btn-default);
    transition: all 0.4s;
    color: var(--text-default);
    font-weight: 500;
    img, svg {
      width: 16px;
      height: 16px;
    }
    .select-token-text {
      color: var(--border-active-color);
    }
    &:hover {
      border-color: white;
      background: var(--hover);
    }

    &.locked {
      cursor: not-allowed;
      pointer-events: none;
      &.notSelected{
        opacity: 0.6;
      }
    }
    &.w100 {
      width: 100%;
    }
  }
}
</style>
