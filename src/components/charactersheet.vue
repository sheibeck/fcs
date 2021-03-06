<template>
  <div class="">
     <component v-bind:is="currentCharacterSheet" :character="character" ref="charactersheet" v-on="$listeners" :isOwner="isOwner"></component>     
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CommonService from "./../assets/js/commonService";
import FateOf20 from '../assets/js/fateof20';
import FCSVTT from '../assets/js/fcsVTT';
import Models from '../assets/js/models';


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
import SheetFateAnything from "./../sheets/fate-anything"

let commonSvc = null;
let fateOf20 = null;
let fcsVtt = null;
let models = null;

export default {
  name: 'CharacterSheet',
  created() {    
    commonSvc = new CommonService(this.$root);    
    fateOf20 = new FateOf20(); 
    fcsVtt = new FCSVTT();
    models = new Models();
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
    "fate-anything": SheetFateAnything,
  },
  props: {
    sheetid: String,
    character: Object,
    isOwner: Boolean,
  },
  computed: {
     ...mapGetters([
      'isAuthenticated',
      'vttEnabled'
    ]), 
    currentCharacterSheet() {      
      if (!commonSvc) { 
        commonSvc = new CommonService(this.$root);
      }
      let id = `${commonSvc.GetId(this.sheetid)}`;

      let validSheets = ["fate-accelerated",
        "fate-accelerated-custom",    
        "fate-core",
        "fate-core-custom",
        "middle-earth",
        "dresden-files-accelerated",
        "fate-condensed",
        "fate-freeport",
        "fate-of-cthulhu",
        "mouse-guard",
        "star-trek",
        "fate-anything"];

      //validate the sheet
      if (validSheets.includes(id)) {
        return id;
      }
      else {
        document.location = "/404";
      }
    }
  },
  data () {
    return {
    }
  },
  methods: {
    formatVTTMessage(type, character, description, data, skillType)
    {
      let msg;
      switch(type) {
        case "diceroll":          
          msg = models.MsgDiceRoll(character, skillType, description, data);
          break;
        case "invoke":
          msg = models.MsgInvoke(character, description, data);
          break;
        case "stuntextra":
          msg = models.MsgStuntExtra(character, data);
          break;
        case "fatepoint":          
          msg = models.MsgFatePoint(character, description, data);
          break;
        case "stress":
        case "condition":
          msg = models.MsgStress(character, description, data);
          break;
        case "consequence":
          msg = models.MsgConsequence(character, description, data);
          break;      
      }

      return msg;
    },
    parseVTTMessage(type, label, obj, item, skillType) {      
      let characterName = this.character.name;
      switch(type)
      {
        case "fatepoint":
          this.sendToVTT(type, characterName, null, item);
          break;
        case "stress":
        case "consequence":
        case "stuntextra":
        case "condition":
          this.sendToVTT(type, characterName, label, item);
          break;
        case "diceroll":
          let diceVal = this.getVal(this.character, item) ?? "0";
          this.sendToVTT(type, characterName, label, diceVal, skillType);
          break;          
        default:
          let val = this.getVal(this.character, item);
          if (type == "skill" && this.sheetid.indexOf('fate-core') > -1) {
            this.sendToVTT("diceroll", characterName, label, item, skillType);
          } else if (val) {
            this.sendToVTT(type, characterName, label, val, skillType);
          }
          break;
      }
    },
    sendToVTT(type, character, description, data, skillType) {            
      let msg = this.formatVTTMessage(type, character, description, data, skillType);
      
      switch (this.vttEnabled) {
        case "fcsVtt":          
          fcsVtt.SendMessage(msg);
          break;
        case "roll20":         
          fateOf20.SendMessage(msg);
          break;      
      }
    },
    getVal(obj, graphPath, defaultValue){
      return commonSvc.getVal(obj, graphPath, defaultValue);
    },
    setVal(obj, arr, val) {      
      commonSvc.setVal(obj, arr, val, Vue);
    },
    GetSheetImage(){
      return `/static/sheets/${commonSvc.GetId(this.sheetid)}/logo.png`;
    }
  }

}
</script>

<style lang="scss">

	.sheet {
    margin-top: 30px;    
	}


	.fo20 {
    cursor: pointer;
    color: #007bff;
	}

  @media print {
    .fo20 {
      display: none;
    }

    .sheet {			
			margin-top: 30px;			
		}
  }

</style>
