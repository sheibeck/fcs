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
import SheetFateCore from "./../sheets/fate-core"
import SheetFateCoreCustom from "./../sheets/fate-core-custom"
import SheetMiddleEarth from "./../sheets/middle-earth"
import SheetDresdenFilesAccelerated from "./../sheets/dresden-files-accelerated"

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
    "fate-core": SheetFateCore,
    "fate-core-custom": SheetFateCoreCustom,
    "middle-earth": SheetMiddleEarth,
    "dresden-files-accelerated": SheetDresdenFilesAccelerated,
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
    skillHasValue(skillList, value) { 
      try {
      // this will only find one instance of the skill, not all.
      // we expect that each skill only shows up once.
      let skillArray = skillList.split("|");

        function getPath(obj, value) {
          if(obj.constructor !== Object) {
              throw new TypeError('getPath() can only operate on object with Object as constructor');
          }
          var path = [];
          var found = false;

          function search(haystack) {
            for (var key in haystack) {
              path.push(key);
              if(haystack[key] === value) {
                  found = true;
                  break;
              }
              if(haystack[key].constructor === Object) {
                  search(haystack[key]);
                  if(found) break;
              }
              path.pop();
            }
          }

          search(obj);
          return path;         
        }

        let average = 1;
        let fair = 2;
        let good = 3;
        let great = 4;
        let superb = 5;        

        let skills = [];
        skillArray.forEach( (skillName) => {
            let found = getPath(this.character.skills, skillName);
            if (found.length > 0)
                skills.push(eval(found[0])); //grab the skill leve
        });

        return Math.max.apply(Math, skills) >= value;  
      }
      catch(e) {
        return false;
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
