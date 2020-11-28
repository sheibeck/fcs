<template>
<div class="sheet">
	<div class="row">
		<div class="col-sm-6 col-md-4 order-md-2">
			<div class="row">
				<div class="col text-center">
					<img alt="Mouse Guard" class="img-fluid fate-logo" :src="$parent.GetSheetImage()" />
				</div>
			</div>

			<div class="row">
				<div class="col-6 text-center">
					<div for="refresh" class="fate-header">Refresh</div>
					<input type="number" class="form-control text-center" id="refresh" name="refresh" @change="setVal('refresh', $event.target.value)" :value="getVal('refresh')" placeholder="Refresh" />
				</div>
				<div class="col-6 text-center ">
					<div for="fatepoints" class="fate-header">
						FP <span v-if="vttEnabled" class='dice fo20 font-weight-normal small'>A</span>
					</div>
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
				<textarea class="form-control" id="description" name="description" rows="3" @change="setVal('description', $event.target.value)" :value="getVal('description')" placeholder="Description"></textarea>
			</div>
		</div>
	</div>

	<div class="row">
		<!-- aspects -->
		<div class="col-sm-6 col-md-8 fate-aspects">
			<div class="form-group">
				<div for="" class="fate-header">Aspects</div>
			</div>
			<div v-for="aspect in aspects" :key="aspect.obj">
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
			<inputstuntextra item="stunts" :rows="18" :border="true" header="Stunts, Wises &amp; Gear" v-on="$listeners" />						
		</div>
		<div class="col-sm-12 col-md-6">
			<div class="form-group">
				<div class="fate-header">Portrait</div>
				<div class="col text-center">
					<img alt="Mouse Guard" class="img-fluid portrait" :src="getPortrait()" />
				</div>
			</div>
		</div>
	</div>

	<div class="row fate-conditions">
		<div class="col-12 form-group">
			<div for="" class="fate-header">Conditions <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>
		</div>

		<div class="col-sm-12 col-md-6">
			<div class="row">
			  <label for="stress" class="col-10">
				<u class="small">Fleeting</u>
			  </label>
			</div>

			<inputcondition :condition="conditions.fleeting" />			

			<div class="row">
			  <label for="stress" class="col-10">
				<u class="small">Sticky</u>
			  </label>
			</div>
			<inputcondition :condition="conditions.sticky" />
		</div>

		<div class="col-sm-12 col-md-6">
			<div class="row">
			  <label for="stress" class="col-10">
				<u class="small">Lasting</u>
			  </label>
			</div>
			
			<div class="w-100">
				<inputcondition :condition="conditions.lasting" showvalue="true" />
			</div>
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
  name: 'SheetMouseGuard',
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
   this.$store.commit("updatePageTitle", 'Mouse Guard (Character Sheet)');
  },
  data () {
    return {
		approaches:  [
			{placeholder:"Fighter", obj:"approaches.fighter"},
			{placeholder:"Healer", obj:"approaches.healer"},
			{placeholder:"Hunter", obj:"approaches.hunter"},
			{placeholder:"Scout", obj:"approaches.scout"},
			{placeholder:"Orator", obj:"approaches.orator"},
			{placeholder:"Craftsmouse", obj:"approaches.craftsmouse"},
		],
		aspects: [
			{label:"High Concept", obj:"aspects.highconcept"},
			{label:"Trouble", obj:"aspects.trouble"},
			{label:"Aspect", obj:"aspects.other1"},
			{label:"Aspect", obj:"aspects.other2"},
			{label:"Aspect", obj:"aspects.other3"},			
		],
	
		conditions:{ 					
			fleeting: {
				items: [
					{label:"Hungry", obj:"conditions.hungry"},
					{label: "Angry", obj:"conditions.angry"},
					{label: "Frightened", obj:"conditions.frightened"},
				]
			},    
			sticky: {
				items: [
					{label:"Exhausted", obj:"conditions.exhausted"},
					{label: "Sick", obj:"conditions.sick"},					
				]
			},  
			lasting: {
				items: [
					{label:"Injured", obj:"condition.injured", value: "2"},
					{label:"Wounded", obj:"condition.wounded", value: "3"},
					{label:"broken", obj:"condition.broken", value: "4"},				
				]
			},            
		},
    }
  },
  methods: {  
    getVal(graphPath, defaultValue) {
      return this.$parent.getVal(this.character, graphPath, defaultValue);
    },
    setVal(arr, val) {
       this.$parent.setVal(this.character, arr, val);       
    },
    getPortrait() {		
        return this.character.image_url || "/static/sheets/mouse-guard/portrait.jpg";
	},
	sendToVTT(type, label, obj, item, skillType) {
		this.$parent.parseVTTMessage(type, label, obj, item, skillType);
	},	
  }
}
</script>

<style lang="scss" scoped>
 @import url('https://fonts.googleapis.com/css?family=IM+Fell+English');

	.fate-logo {
		margin-top: -27px;
		max-height: 130px;
	}

	/deep/ .fate-header {
        font-family: 'IM Fell English', sans-serif;
        text-transform: uppercase;
		background-color: #000;
		color: white;
		font-weight: 700;
		padding: 3px;
		margin-top: 5px;
		font-size: 22px;
	}

	/deep/ .col-form-label {
        font-family: 'IM Fell English', sans-serif;
        text-transform: uppercase;
		font-size: 22px;
		font-weight: 700;
	}

	/deep/ .fate-skills .form-group {
		margin-top: 1px;
		margin-bottom: 1px;
	}

	/deep/ .fate-skills label {
		padding-bottom: 2px;
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
        font-family: 'IM Fell English', sans-serif;
        text-transform: uppercase;
		font-size: 24px;
		font-weight: 700;		
	}

	.portrait {
		max-height: 450px;
		padding-top: 10px;
	}

	.small {
		color: #888;
	}

</style>
