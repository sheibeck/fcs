<template>
  <div v-if="show" class="pager py-2 w-100 text-center">
    <button class="btn btn-secondary btn-sm" @click="getPage('first')">First Page </button>
    <button class="btn btn-secondary btn-sm pager-prev" @click="getPage('prev')">&lt;&lt; Prev Page </button>
    <button class="btn btn-secondary btn-sm" @click="getPage('next')">Next Page >></button>      
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Pager',  
  computed: {
    ...mapGetters([
      'searchText'
    ]),
  },
  props: {
    show: Boolean,
    method: { type: Function },
  },
  data () {
    return {
    }
  },
  methods: {
    getPage(page) {
      this.$emit('get-page', page);
    }    
  }

}
</script>

<style lang="scss" scoped>
</style>
