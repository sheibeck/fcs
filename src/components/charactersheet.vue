<template>
  <div class="">
     <component v-bind:is="currentCharacterSheet" :character="character"></component>
     
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SheetFateCore from "./sheet-fate-core";
import SheetMiddleEarth from "./sheet-middle-earth";

export default {
  name: 'CharacterSheet',
  mounted() {
    this.init();
  },
  components: {
    "sheet-fate-core": SheetFateCore,
    "sheet-middle-earth": SheetMiddleEarth,
  },
  props: {
    sheetid: String,
    character: Object,
  },
  computed: {
    currentCharacterSheet() {
      return `sheet-${this.sheetid}`;
    }
  },
  data () {
    return {
    }
  },
  methods: {
   
  }

}
</script>

<style lang="scss" scoped>

</style>
