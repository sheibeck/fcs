<template>
  <div class="">
     <component v-bind:is="currentCharacterSheet" :character="character"></component>
     
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CommonService from "./../assets/js/commonService"

//sheets
import SheetFateAccelerated from "./../sheets/fate-accelerated"
import SheetFateAcceleratedCustom from "./../sheets/fate-accelerated-custom"
import SheetFateCore from "./../sheets/fate-core"
import SheetFateCoreCustom from "./../sheets/fate-core-custom"
import SheetMiddleEarth from "./../sheets/middle-earth"
import SheetDresdenFilesAccelerated from "./../sheets/dresden-files-accelerated"
import SheetFateCondensed from "./../sheets/fate-condensed"
import SheetFateFreeport from "./../sheets/fate-freeport"
import SheetFateOfCthulhu from "./../sheets/fate-of-cthulhu"
import SheetMouseGuard from "./../sheets/mouse-guard"
import SheetStarTrek from "./../sheets/star-trek"

let commonSvc = null;

export default {
  name: 'CharacterSheet',
  mounted() {       
    if (!commonSvc) { 
      commonSvc = new CommonService(this.$root);
    }
  },
  components: {
    "fate-accelerated": SheetFateAccelerated,
    "fate-accelerated-custom": SheetFateAcceleratedCustom,    
    "fate-core": SheetFateCore,
    "fate-core-custom": SheetFateCoreCustom,
    "middle-earth": SheetMiddleEarth,
    "dresden-files-accelerated": SheetDresdenFilesAccelerated,
    "fate-condensed": SheetFateCondensed,
    "fate-freeport": SheetFateFreeport,
    "fate-of-cthulhu": SheetFateOfCthulhu,
    "mouse-guard": SheetMouseGuard,
    "star-trek": SheetStarTrek,
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
      return `${commonSvc.GetId(this.sheetid)}`;
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
        //account for false values in checkboxes
        if ((root[part] || root[part] == false) && root.hasOwnProperty(part))
          root = root[part];
        else
          return (defaultValue || "");
      }

      return eval(`obj.${graphPath}`);
    },
    setVal(obj, arr, val) {
      arr = arr.split(".");
      
      if (arr.length == 1)
      {
        Vue.set(obj, arr[0], val);       
      }
      if (arr.length == 2)
      {        
        if (!obj[arr[0]]) Vue.set(obj, arr[0], {});
        Vue.set(obj[arr[0]], arr[1], val);  
      }
      if (arr.length == 3)
      {
        if (!obj[arr[0]]) Vue.set(obj, arr[0], {});
        if (!obj[arr[0]][arr[1]]) Vue.set(obj[arr[0]], arr[1], {});
        Vue.set(obj[arr[0]][arr[1]], arr[2], val);             
      }
      if (arr.length == 4)
      {
        if (!obj[arr[0]]) Vue.set(obj, arr[0], {});
        if (!obj[arr[0]][arr[1]]) Vue.set(obj[arr[0]], arr[1], {});
        if (!obj[arr[0]][arr[1]]) Vue.set(obj[arr[0]][arr[1]], arr[2], {});
        Vue.set(obj[arr[0]][arr[1]][arr[2]], arr[3], val);        
      }
      if (arr.length == 5)
      {
        if (!obj[arr[0]]) Vue.set(obj, arr[0], {});
        if (!obj[arr[0]][arr[1]]) Vue.set(obj[arr[0]], arr[1], {});
        if (!obj[arr[0]][arr[1]]) Vue.set(obj[arr[0]][arr[1]], arr[2], {});
        if (!obj[arr[0]][arr[1]][arr[2]])Vue.set(obj[arr[0]][arr[1]][arr[2]], arr[3], {});
        Vue.set(obj[arr[0]][arr[1]][arr[2]][arr[3]], arr[4], val);
      }
    },
    GetSheetImage(){
      return `/static/sheets/${commonSvc.GetId(this.sheetid)}/logo.png`;
    }
  }

}
</script>

<style lang="scss" scoped>

</style>
