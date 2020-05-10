<template>
  <div class="">
     <component v-bind:is="currentCharacterSheet" :character="character"></component>
     
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CommonService from "./../assets/js/commonService"
import SheetFateCore from "./sheet-fate-core"
import SheetMiddleEarth from "./sheet-middle-earth"
import SheetDresdenFilesAccelerated from "./sheet-dresden-files-accelerated"

let commonSvc = null;

export default {
  name: 'CharacterSheet',
  mounted() {       
    if (!commonSvc) { 
      commonSvc = new CommonService(this.$root);
    }
  },
  components: {
    "sheet-fate-core": SheetFateCore,
    "sheet-middle-earth": SheetMiddleEarth,
    "sheet-dresden-files-accelerated": SheetDresdenFilesAccelerated,
  },
  props: {
    sheetid: String,
    character: Object,
  },
  computed: {
    currentCharacterSheet() {      
      if (!commonSvc) { 
        commonSvc = new CommonService(this.$root);
      }
      return `sheet-${commonSvc.GetId(this.sheetid)}`;
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

      return eval(`obj.${graphPath}`);
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
      return `/static/sheets/${commonSvc.GetId(this.sheetid)}/logo.png`;
    }
  }

}
</script>

<style lang="scss" scoped>

</style>
