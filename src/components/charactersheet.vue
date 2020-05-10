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
    getVal(obj, graphPath, defaultValue){
      var parts = graphPath.split(".");
      var root = obj;

      for (var i = 0; i < parts.length; i++)
      {
        var part = parts[i];
        if (root[part] && root.hasOwnProperty(part))
          root = root[part];
        else
          return (defaultValue || "");
      }

      return eval(`${obj}${graphPath}`);
    },
    setVal(obj, arr, val) {

      function addProp(obj,arr,val) {
        if (typeof arr == 'string')
          arr = arr.split(".");

        obj[arr[0]] = obj[arr[0]] || {};

        var tmpObj = obj[arr[0]];

        if (arr.length > 1) {
            arr.shift();
            addProp(tmpObj, arr, val);
        }
        else
            obj[arr[0]] = val;

        return obj;
      }

      let result = addProp(obj,arr,val);
      return result;
    },
    GetSheetImage(){
      return `/static/sheets/${this.sheetid}/logo.png`;
    }
  }

}
</script>

<style lang="scss" scoped>

</style>
