<template lang="pug">
.Wrapper(count='showResetButton ? 3 : 2')
  //template(v-if='showResetButton')
  // BETTER ALWAYS TRUE FOR NOW
  template(v-if='true')
    AlcorButton(@click="$emit('reset')", iconOnly flat)
      i.el-icon-refresh-left

  AlcorButton(@click="$emit('zoomIn')", iconOnly flat)
    i.el-icon-zoom-in

  AlcorButton(@click="$emit('zoomOut')", iconOnly flat)
    i.el-icon-zoom-out
</template>

<script>
import AlcorButton from '@/components/AlcorButton'

export default {
  props: ['showResetButton'],

  components: {
    AlcorButton,
  }
}
</script>

<style lang="scss">
.Wrapper {
  display: flex;
  //grid-template-columns: repeat(${({ count }) => count.toString()}, 1fr); // TODO
  .alcor-button {
    padding: 0;
    width: 28px;
    height: 28px;
    border-radius: 50% !important;
  }
}

.ZoomOverlay {
  fill: transparent;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}
</style>
