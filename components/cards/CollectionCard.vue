<template lang="pug">
collection-hover(:data="data")
  card
    asset-card-image.main-img(:template="data")
    .d-flex.justify-content-center.gap-8.p-2
      .fs-24.color-action {{ data.collection_name }}
      img.success-icon(src='~/assets/images/check_circle.svg', alt='')

    .w-100(slot="footer")
      alcor-button.w-100(outline @click="") {{ $t('View Collection') }}

</template>

<script>
import Card from '~/components/cards/Card.vue'
import AssetCardImage from '~/components/cards/components/AssetCardImage.vue'
import AlcorButton from '~/components/AlcorButton'
import CollectionHover from '~/components/alcor-element/CollectionHover.vue'

export default {
  components: { Card, AssetCardImage, AlcorButton, CollectionHover },
  props: ['data']
}
</script>

<style lang="scss" scoped>
.success-icon {
  width: 20px;
}
</style>
