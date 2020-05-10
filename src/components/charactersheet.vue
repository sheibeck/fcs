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
    exists(parent, index, defaultValue, secondary) {
      if (!secondary) {
        return parent && parent[index] ? parent[index] : (defaultValue || "");
      }
      else {
        return parent && parent[index] && parent[index][secondary] ? parent[index][secondary] : (defaultValue || "");
      }
    },
    set(parent, index, value, secondary) {
      debugger;
      if(!this.character[parent]) {
        this.character[parent] = {};
      }      
      
      if (!secondary) {
        this.character[index] = value;
      }
      else {       
       if (!this.character[parent][index]) {
        this.character[parent][index] = {};
        }
        this.character[parent][index][secondary] = value;
      }
    },
    GetSheetImage(){
      return `/static/sheets/${this.sheetid}/logo.png`;
    }
  }

}
</script>

<style lang="scss" scoped>

</style>
