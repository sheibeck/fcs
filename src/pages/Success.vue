<template>
<div class="container mt-2">
    <div class="error">
        <div class="dice">++++</div>
        <h2>You've succeeded with style!</h2>
    </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Success',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Thank You',      
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
