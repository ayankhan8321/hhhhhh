<template lang="pug">
div(v-if='user')
  slot
div.confirm-button(v-else)
  el-button.w-100(@click='login', type='primary') {{ $t('Connect Wallet') }}
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['user'])
  },

  methods: {
    login() {
      this.$store.dispatch('chain/mainLogin')
    }
  }
}
</script>
