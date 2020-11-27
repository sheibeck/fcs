<template>
<div class="sheet">
    <div class="row">
        <div class="col-sm-6 col-md-4 order-md-2">
            <div class="row">
                <div class="col text-center">
                    <img alt="LOGO" class="img-fluid fate-logo" :src="$parent.GetSheetImage()" />
                </div>
            </div>

            <div class="row">
                <div class="col-6 text-center"> 
                    <div for="refresh" class="fate-header">Refresh</div>
                    <input type="number" class="form-control text-center" id="refresh" name="refresh" @change="setVal('refresh', $event.target.value)" :value="getVal('refresh')" placeholder="Refresh" />
                </div>
                <div class="col-6 text-center ">
                    <div for="fatepoints" class="fate-header">FP <span v-if="vttEnabled" class='dice fo20 font-weight-normal small'>A</span></div>
                    <inputfatepoints />
                </div>
            </div>
        </div>

        <div class="col-sm-6 col-md-8 order-md-1">
            <div class="form-group">
                <div for="name" class="fate-header">Name</div>
                <input type="text" class="form-control" id="name" name="name" @change="setVal('name', $event.target.value)" :value="getVal('name')" placeholder="Name" />
            </div>

            <div class="form-group">
                <textarea class="form-control" id="description" name="description" rows="3" placeholder="Description" @change="setVal('description', $event.target.value)" :value="getVal('description')"></textarea>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- aspects -->
        <div class="col-sm-6 col-md-8 fate-aspects">
            <div class="form-group">
                <div for="" class="fate-header">Aspects</div>
            </div>
           <div v-for="aspect in aspects" :key="aspect.obj" class="p-0 m-0">
				<inputaspect :aspect="aspect" />
			</div>
        </div>

        <!-- aspects -->
        <div class="col-sm-6 col-md-4 fate-skills">
            <div class="form-group">
                <div class="fate-header col-12">Skills</div>
            </div>

           <div v-for="approach in approaches" :key="approach.obj">
				<inputapproach :item="approach" />
			</div>
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-6">
            <inputstuntextra item="stunts" :rows="17" :border="true" header="Stunts" v-on="$listeners" />
        </div>
        <div class="col-sm-12 col-md-6">
           <inputstuntextra item="gear" :rows="17" :border="true" header="Gear" v-on="$listeners" />
        </div>
    </div>

    <div class="row fate-conditions">
        <div class="col-12 form-group">
            <div for="" class="fate-header">Conditions <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>
        </div>

        <div class="col-sm-12 col-md-6">            
			<inputcondition :condition="stress.conditions" />
        </div>

        <div class="col-sm-12 col-md-6">
            <inputcondition :condition="stress.consequences" showvalue="true" />	
        </div>

    </div>

</div>

</template>

<script>
import InputSkillColumn from '../components/input-skill-column'
import InputAspect from '../components/input-aspect'
import InputConsequence from '../components/input-consequence'
import InputStress from '../components/input-stress'
import InputStuntExtra from '../components/input-stuntextra'
import InputFatePoints from '../components/input-fatepoints'
import InputConditionExtended from '../components/input-condition-extended'
import { mapGetters } from 'vuex'

export default {
  name: 'SheetMiddleEarth',
  components: {
	"inputapproach": InputSkillColumn,    
	"inputaspect": InputAspect,
	"inputconsequence": InputConsequence,
	"inputstress": InputStress,
	"inputstuntextra": InputStuntExtra,
    "inputfatepoints": InputFatePoints,	
    "inputcondition": InputConditionExtended,
  },
  props: {    
    character: Object,
  },
  computed: {
 	...mapGetters([      
      'vttEnabled'
    ]),
  },
  mounted() {
   this.$store.commit("updatePageTitle", 'Middle Earth (Character Sheet)');
  },
  data () {
    return {
        approaches:  [
			{placeholder:"Personality", obj:"approaches.personality", description:"AWE, INSPIRE, PERSUADE"},
			{placeholder:"Movement", obj:"approaches.movement", description:"ATHLETICS, TRAVEL, STEALTH"},
			{placeholder:"Perception", obj:"approaches.perception", description:"AWARENESS, INSIGHT, SEARCH"},
			{placeholder:"Survival", obj:"approaches.survival", description:"EXPLORE, HEALING, HUNTING"},
			{placeholder:"Custom", obj:"approaches.custom", description:"SONG, COURTESY, RIDDLE"},
			{placeholder:"Vocation", obj:"approaches.vocation", description:"CRAFT, BATTLE, LORE"},
		],
		aspects: [
			{label:"High Concept", obj:"aspects.highconcept"},
			{label:"Trouble", obj:"aspects.trouble"},
			{label:"Aspect", obj:"aspects.other1"},
			{label:"Aspect", obj:"aspects.other2"},
			{label:"Aspect", obj:"aspects.other3"},
		],
        
        stress: {
            conditions:{                         
                items: [
                    {label:"Hopeful", obj:"conditions.hopeful", description:"Effect: While this box is checked you have a +2 on rolls against despair and fear. You may uncheck this box in combat to soak 1 stress. Recover: Spend at least one full day in a warm, safe place with acceptable food and be in the company of close friends.", defaultValue:"true"},
                    {label:"Weary", obj:"conditions.weary", description:"Effect: You may check this box in combat to soak 1 stress. Recover: You must have a few hours of rest."},
                    {label:"Miserable", obj:"conditions.miserable", description:"Effect: You may check this box in combat to soak 1 stress. Recover: You must have a warm dry place to rest and a meal."},
                    {label:"Frightened", obj:"conditions.frightened", description:"Effect: While checked, you must attempt to get away from the source of your fear. Recover: At the beginning of any scene where you are no longer in the presence of the source of your fear."},
                    {label:"Poisoned", obj:"conditions.poisoned", description:"Effect: checked you have the 'Poisoned' aspect. Recover: Receive medical care and have ample time to rest and eat."},
                ],            
            },

            consequences:{
                items: [
                    {label:"Injured", obj:"consequences.injured", value: "2", description:"Effect: A minor injury. Recover: Uncheck this box after the end of the next scene."},
                    {label:"Wounded", obj:"consequences.wounded", value: "4", description:"Effect: A lasting wound that affects your abilities. Recover: requires medical attention. Uncheck this box at the beginning of the next game session."},
                    {label:"Dying", obj:"consequences.dying", value: "6", description:"Effect:A dire wound that will dramatically altar your life — if you survive. Recover: Requires medical attention as well as a long recovery in a safe place with ample food and rest."},
                ],
            }
        }
    }
  },
  methods: {  
    getVal(graphPath, defaultValue) {
      return this.$parent.getVal(this.character, graphPath, defaultValue);
    },
    setVal(arr, val) {
       this.$parent.setVal(this.character, arr, val);       
    },
    sendToVTT(type, label, obj, item, skillType) {		
		this.$parent.parseVTTMessage(type, label, obj, item, skillType);
	},	
  }
}
</script>

<style lang="scss" scoped>
  @import url('https://fonts.googleapis.com/css?family=Quintessential');

    .fate-logo {
        margin-top: -27px;
        max-height: 130px;
    }

    /deep/ .fate-header {
        font-family: 'Quintessential', sans-serif;
        text-transform: uppercase;
        background-color: #000;
        color: white;
        font-weight: 700;
        padding: 3px;
        margin-top: 5px;
        font-size: 22px;
    }

    /deep/ .col-form-label {
        font-family: 'Quintessential', sans-serif;
        text-transform: uppercase;
        font-size: 22px;
        font-weight: 700;
        padding-left: 0px;
    }

    /deep/ .fate-skills .form-group {
        margin-top: 1px;
        margin-bottom: 1px;
    }

    /deep/ .fate-skills .col-form-label {
        margin-top: -10px;
    }

    /deep/ .fate-skills label {
        padding-bottom: 0px;
        margin-bottom: 0px;
    }

    /deep/ .fate-aspects .form-group {
        margin-bottom: 12px;
        margin-top: 0px;
    }

    /deep/ input[type=checkbox] {
        height: 50px;
        width: 50px;
    }

    /deep/ .fate-conditions label {
        font-family: 'Quintessential', sans-serif;
        text-transform: uppercase;
        font-size: 30px;
        font-weight: 700;
        margin-left: -5px;
        margin-right: -5px;
    }

    /deep/ .fate-conditions label div {
        font-family: 'Quintessential', sans-serif;
        text-transform: capitalize;
    }

    .portrait {
        max-height: 450px;
        padding-top: 10px;
    }

    /deep/ .small {
        color: #888;
    }

    /deep/ .help-text{
        color: #000;
        font-size: 12px !important;
        margin-top: -10px;
        line-height: 12px;
    }
</style>
