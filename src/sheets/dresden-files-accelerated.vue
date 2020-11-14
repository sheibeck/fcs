<template>
<div class="sheet">
	<div class="row">
		<div class="col-sm-6 col-md-4 order-md-2">
			<div class="row">
				<div class="col text-center fate-logo">
					<label>Dresden Files</label>
					<label>Accelerated</label>
				</div>
			</div>
		</div>

		<div class="col-sm-6 col-md-8 order-md-1">
			<div class="form-group">
				<div for="name" class="fate-header">Character Name</div>
				<input type="text" class="form-control" id="name" name="name" @change="setVal('name',  $event.target.value)" :value="getVal('name')" placeholder="Name" />
			</div>
		</div>
	</div>

	<div class="row">
		<!-- approaches -->
		<div class="col-sm-6 col-md-4 fate-approaches">
			<div class="form-group">
				<div class="fate-header col-12">Approaches</div>
			</div>

			<div v-for="approach in approaches" :key="approach.obj">
				<inputapproach :item="approach" inputclass="round-input" labelclass="col-form-label mt-1" />
			</div>
		</div>

		<!-- aspects -->
		<div class="col-sm-6 col-md-8 fate-aspects">
			<div class="form-group">
				<div for="" class="fate-header">Aspects</div>
			</div>
			<div v-for="aspect in aspects" :key="aspect.obj">
				<inputaspect :aspect="aspect" />
			</div>
		</div>
	</div>


	<div class="row">
		<!-- ladder -->
		<div class="col-sm-6 col-md-4">
			<div class="fate-ladder d-none d-md-block">
				<div class="form-group">
					<div class="fate-header col-12">Ladder</div>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+8 Legendary</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+7 Epic</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+6 Fantastic</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+5 Superb</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+4 Great</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+2 Fair</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+1 Average</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+0 Mediocre</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">–1 Poor</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">-2 Terrible</label>
				</div>
			</div>

			<!-- scale -->
			<div class="fate-scale">
				<div class="form-group">
					<div for="" class="fate-header">Scale (p.182)</div>
				</div>
				<div class="form-check">
				  <input class="form-check-input" type="radio" name="scale" id="scale[godlike]" value="godlike" @change="setVal('scale.godlike',  $event.target.checked)" :checked="getVal('scale.godlike')" />
				  <label class="form-check-label col-form-label" for="scale[godlike]">
				    Godlike
				  </label>
				</div>
				<div class="form-check">
					<input class="form-check-input" type="radio" name="scale" id="scale[legendary]" value="legendary" @change="setVal('scale.legendary',  $event.target.checked)" :checked="getVal('scale.legendary')" />
					<label class="form-check-label col-form-label" for="scale[legendary]">
						Legendary
					</label>
				</div>
				<div class="form-check">
					<input class="form-check-input" type="radio" name="scale" id="scale[otherworldly]" value="otherworldly" @change="setVal('scale.otherworldly',  $event.target.checked)" :checked="getVal('scale.otherworldly')" />
					<label class="form-check-label col-form-label" for="scale[otherworldly]">
						Otherworldly
					</label>
				</div>
				<div class="form-check">
					<input class="form-check-input" type="radio" name="scale" id="scale[supernatural]" value="supernatural" @change="setVal('scale.supernatural',  $event.target.checked)" :checked="getVal('scale.supernatural')" />
					<label class="form-check-label col-form-label" for="scale[supernatural]">
						Supernatural
					</label>
				</div>
				<div class="form-check">
					<input class="form-check-input" type="radio" name="scale" id="scale[mundane]" value="mundane" @change="setVal('scale.mundane',  $event.target.checked)" :checked="getVal('scale.mundane')" />
					<label class="form-check-label col-form-label" for="scale[mundane]">
						Mundane
					</label>
				</div>
			</div>
		</div>

		<!-- mantles & stunts -->
		<div class="col-sm-6 col-md-8 fate-mantles">
			<div class="form-group">
				<div for="" class="fate-header">Mantles</div>
			</div>
			<div class="form-group">
				<textarea type="text" class="form-control" id="mantles" name="mantles" rows="2" placeholder="Mantles" @change="setVal('mantles',  $event.target.value)" :value="getVal('mantles')"></textarea>
			</div>
			<div class="form-group">
				<inputstuntextra :item="stunts" :rows="13" :border="true" header="Stunts" v-on="$listeners" />
			</div>
			<div class="form-group d-md-flex justify-content-between">
				<span v-if="vttEnabled" class='dice fo20 pt-2'>A</span><label class="col-form-label pr-1">FP</label>
				<inputfatepoints class="w-25" />							
				<label class="col-form-label pr-1 w-25">Refresh</label>				
				<input class="form-control text-center w-25" type="number" id="refresh" name="refresh" @change="setVal('refresh',  $event.target.value)" :value="getVal('refresh')" placeholder="Refresh" />							
			</div>
		</div>
	</div>

	<div class="row">
		<!-- stress -->
		<div class="col-sm-6 col-md-4 fate-stress">
			<div class="form-group">
				<div for="" class="fate-header">Stress <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>
			</div>
			
			<div class="row">
				<div v-for="stress in stresses" :key="stress.obj" class="col mx-1">
					<inputstress :stress="stress" />
				</div>
			</div>	

			<div class="row">
				<label class="col-12 fate-otherstress-label">
					Other Types of Stress
				</label>
			</div>

			<div class="row justify-content-between">
				<div v-for="stress in otherstresses" :key="stress.obj" class="col">
					<inputstress :stress="stress" />
				</div>
			</div>
		</div>

		<!-- conditions -->
		<div class="col-sm-6 col-md-8 fate-conditions">
			<div class="form-group">
				<div class="fate-header col-12">Conditions <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>
			</div>		

			<div class="d-flex d-flex justify-content-between">				
				<inputcondition :condition="conditions.inperil" />				
				<inputcondition :condition="conditions.doomed" />					
			</div>

			<div class="d-flex justify-content-between">				
				<inputcondition :condition="conditions.indebted" />			
			</div>

			<div class="">
				<inputcondition :condition="conditions.condition1" />	
			</div>

			<div class="">
				<inputcondition :condition="conditions.condition2" />
			</div>

			<div class="">
				<inputcondition :condition="conditions.condition3" />
			</div>
		</div>
	</div>
</div>
</template>

<script>

import InputSkillColumn from '../components/input-skill-column'
import InputAspect from '../components/input-aspect'
import InputConsequence from '../components/input-consequence'
import InputCondition from '../components/input-condition'
import InputStuntExtra from '../components/input-stuntextra'
import InputStress from '../components/input-stress'
import InputFatePoints from '../components/input-fatepoints'
import { mapGetters } from 'vuex'


export default {
  name: 'SheetDresdenFilesAccelerated',
  components: {
	"inputapproach": InputSkillColumn,    
	"inputaspect": InputAspect,
	"inputconsequence": InputConsequence,
	"inputcondition": InputCondition,
	"inputstuntextra": InputStuntExtra,
	"inputstress": InputStress,
	"inputfatepoints": InputFatePoints,
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
   this.$store.commit("updatePageTitle", 'Dresden Files Accelerated (Character Sheet)');
  },
  data () {
    return {
		approaches:  [
			{placeholder:"Flair", obj:"approaches.flair"},
			{placeholder:"Focus", obj:"approaches.focus"},
			{placeholder:"Force", obj:"approaches.force"},
			{placeholder:"Guile", obj:"approaches.guile"},
			{placeholder:"Haste", obj:"approaches.haste"},
			{placeholder:"Intellect", obj:"approaches.intellect"},
		],
		aspects: [
			{label:"High Concept", obj:"aspects.highconcept"},
			{label:"Trouble", obj:"aspects.trouble"},
			{label:"Aspect", obj:"aspects.other"},		
			{label:"Aspect", obj:"aspects.other1"},
			{label:"Aspect", obj:"aspects.other2"},
			{label:"Aspect", obj:"aspects.other3"},
		],
		conditions: {
			inperil:
				{label: "In Peril (p.117)", items: [
					{obj:"conditions.inperil"}				
				]},
			doomed:
				{label: "Doomed (p.117)", items: [
					{obj:"conditions.doomed"}				
				]},	
			indebted:
				{label: "Indebted (p.117)", items: [
					{obj:"conditions.indebtedcheck1"},
					{obj:"conditions.indebtedcheck2"},
					{obj:"conditions.indebtedcheck3"},
					{obj:"conditions.indebtedcheck4"},
					{obj:"conditions.indebtedcheck5"},	
				]},			
			condition1:
				{label: "conditions.condition1", placeholder: "Condition Name", items: [
					{obj:"conditions.condition1check1", label:""},
					{obj:"conditions.condition1check2"},
					{obj:"conditions.condition1check3"},
					{obj:"conditions.condition1check4"},
					{obj:"conditions.condition1check5"},	
				]},
			condition2:
				{label: "conditions.condition2", placeholder: "Condition Name", items: [
					{obj:"conditions.condition2check1", label:""},
					{obj:"conditions.condition2check2"},
					{obj:"conditions.condition2check3"},
					{obj:"conditions.condition2check4"},
					{obj:"conditions.condition2check5"},	
				]},
			condition3:
				{label: "conditions.condition3", placeholder: "Condition Name", items: [
					{obj:"conditions.condition3check1", label:""},
					{obj:"conditions.condition3check2"},
					{obj:"conditions.condition3check3"},
					{obj:"conditions.condition3check4"},
					{obj:"conditions.condition3check5"},	
				]},
		},		
		stresses: [
			{label:"1", obj:"stress1"},
			{label:"1", obj:"stress2"},
			{label:"1", obj:"stress3"},
			{label:"1", obj:"stress4"},
			{label:"1", obj:"stress5"},
			{label:"1", obj:"stress6"}			
		],
		otherstresses: [
			{label:"1", obj:"stressother1"},
			{label:"1", obj:"stressother2"},
			{label:"1", obj:"stressother3"},			
		],
		stunts: "stunts"		
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
		switch(type)
		{			
			case "fatepoint":
				this.$parent.sendToVTT(type, this.character.name, null, item);
				break;
			case "stress":
			case "consequence":
			case "stuntextra":
			case "condition":
				this.$parent.sendToVTT(type, this.character.name, label, item);
				break;
			default:
				if (this.getVal(item)) {
					this.$parent.sendToVTT(type, this.character.name, label, this.getVal(item), skillType);
				}
				break;
		}
	}	
  }
}
</script>

<style lang="scss" scoped>  
    @import url('https://fonts.googleapis.com/css?family=Aldrich');

  	body {
		color: #452f92;
	}

	.fate-logo {
		font-size: 32px;
		line-height: 30px;
		font-family: 'Aldrich', sans-serif;
		text-transform: uppercase;
	}

	/deep/ .fate-header {
		font-family: 'Aldrich', sans-serif;
		text-transform: uppercase;
		background-color: #452f92;
		color: white;
		font-weight: 700;
		padding: 3px;
		margin-top: 5px;
		font-size: 22px;
	}

	/deep/ .col-form-label {
    	font-family: 'Aldrich', sans-serif;
    	text-transform: uppercase;
		font-size: 22px;
		font-weight: 700;
	}

	.fate-approaches .form-group {
		margin-bottom: 3px;
		margin-top: 3px;
	}

	.fate-aspects .form-group {
		margin-bottom: 12px;
		margin-top: 0px;
	}

	.fate-ladder .row label {
		margin-bottom: -9px;
		margin-top: -9px;
		padding-bottom: 0px;
		padding-top: 0px
	}

	input[type=radio] {
		height: 25px;
		width: 25px;
		margin-top: 3px;
	}

	/deep/ .fate-conditions input[type=checkbox] {
		height: 50px;
		width: 50px;
	}

	/deep/ .fate-conditions .form-check label {
		margin-left: 20px;
	}

	/deep/ input[type=checkbox] {
		height: 50px;
		width: 50px;
	}

	.fate-scale label {
		margin-left: 10px;
		padding-bottom: 0px;
		padding-top: 0px;
	}

	/deep/ .round-input {
		border-radius: 45px;		
		height: 40x;
		font-size: 24px;
		height: 47px !important;		
	}

	/deep/ .fate-consequences label {
		font-family: 'Aldrich', sans-serif;
		text-transform: uppercase;
		font-weight: 700;
		font-size: 28px;
		padding-top: 0px;
		padding-bottom: 0px;
		padding-left: 25px;
	}

	/deep/ .fate-stress label {
		font-family: 'Aldrich', sans-serif;
		text-transform: uppercase;
		font-size: 30px;
		font-weight: 700;
		margin-left: -5px;
		margin-right: -5px;
	}

	/deep/ .fate-otherstress-label {
		font-size: 16px !important;
		text-align: center;
	}

	/deep/ .fate-condition-label {
		border: 0px;		
		border-bottom: solid 1px #452f92;
		padding-top: 10px;
	}
</style>
