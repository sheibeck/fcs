<template>
<div class="container mt-2">
    <div class="error">
        <div class="dice">0000</div>
        <h2>We're sorry to see you go.</h2>
    </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Cancel',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Cancel',      
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
}
</script>
