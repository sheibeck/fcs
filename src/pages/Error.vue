<template>
<div class="container mt-2">
    <div class="error">
        <div class="dice">----</div>
        <h2>There was an error. Would you like to <a href="/">succeed at a cost?</a></h2>
    </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Error',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Error',      
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
