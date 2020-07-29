<template>
  <div class="card card m-2">
    <div class="card-body">
      <h5 class="card-title">Become a Subscriber</h5>
      <p class="card-text">Subscribe to get access to enhanced features like Scene builder, our Fate virtual table top, and Roll20 integration.</p>
      <a v-if="!isAuthenticated" href="register" class="btn btn-primary"><span class='dice'>C</span> Create a Free Account</a>
      <a v-if="isAuthenticated" href="account" type="button" class="btn btn-primary">
          <span class='dice'>C</span> Become a Subscriber
      </a>
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
