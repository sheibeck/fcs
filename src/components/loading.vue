<template>
    <div class="d-flex justify-content-center" v-if="loading">
    <div class="p-5 h2">Loading ... <i class="fas fa-cog fa-spin"></i></div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    loading: Boolean,    
  },
  mounted() {  
  }, 
  data () {
    return {
    }
  }, 
}
</script>
