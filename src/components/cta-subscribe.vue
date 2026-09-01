<template>
  <div class="card card m-2">
    <div class="card-body">
      <h5 class="card-title">Subscriber Feature</h5>
      <p class="card-text">This is a subscriber-only feature. New subscriptions are no longer available.</p>
      <a v-if="!isAuthenticated" href="register" class="btn btn-primary"><span class='dice'>C</span> Create a Free Account</a>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'CTASubscriber',
  props: {
    loading: Boolean,    
  },
  computed: {
    ...mapGetters([
      'isAuthenticated', 
      'isSubscriber'
    ]),   
  },
  mounted() {  
  }, 
  data () {
    return {
    }
  }, 
}
</script>
