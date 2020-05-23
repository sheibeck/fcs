<template>
<div class="sheet">
	<div class="row">		
		<div class="col-sm-6">
			<div class="form-group">
				<input type="text" class="form-control" id="name" name="name" @change="setVal('name',  $event.target.value)" :value="getVal('name')" placeholder="Name" />
			</div>
		</div>
		<div class="col-sm-6 text-center order-md-2 text-md-right pb-2 pb-md-0">
			<img alt="Fate Condensed" class="img-fluid fate-logo" :src="$parent.GetSheetImage()" />
		</div>
	</div>

	<div class="row">
		<!-- aspects -->
		<div class="col-sm-6 col-md-7 fate-aspects px-0" style="border-right: 2px solid #3A5224;">
			<div for="" class="fate-header">Aspects</div>
			<div class="px-3">
				<div v-for="aspect in aspects" :key="aspect.obj">
					<inputaspect :aspect="aspect" :showlabel="true" />
				</div>
			</div>
			
			<inputstuntextra :item="stunts" :rows="30" :border="false" header="Stunts" />

			<div class="fate-header mb-5 mb-sm-0">
				<div class="d-flex">
					<input class="refresh center" id="refresh" name="refresh" @change="setVal('refresh',  $event.target.value)" :value="getVal('refresh')" placeholder="3" /> <div class="pt-0">Refresh</div>
				</div>
			</div>
		</div>

		<!-- Vitals and Skills -->
		<div class="col-sm-6 col-md-5 fate-skills px-0 mt-3 mt-sm-0">
			<div class="fate-header col-12">Vitals</div>

			<div class="px-3">				
				<!-- Stress -->
				<div class="form-group text-center font-weight-bold">
					<div class="col-12">STRESS</div>
				</div>

				<!-- physical stress -->
				<div class="d-flex flex-row ">
					<div class="form-group font-weight-bold pr-2 pt-2 mr-auto">
						PHYSICAL
					</div>
					<input type="checkbox" value="1" id="stress[stress1]" name="stress[stress1]" @change="setVal('stress.stress1',  $event.target.checked)" :checked="getVal('stress.stress1')" />
					<input type="checkbox" value="1" id="stress[stress2]" name="stress[stress2]" @change="setVal('stress.stress2',  $event.target.checked)" :checked="getVal('stress.stress2')" />
					<input type="checkbox" value="1" id="stress[stress3]" name="stress[stress3]" @change="setVal('stress.stress3',  $event.target.checked)" :checked="getVal('stress.stress3')" />
					<input type="checkbox" value="1" id="stress[stress4]" name="stress[stress4]" @change="setVal('stress.stress4',  $event.target.checked)" :checked="getVal('stress.stress4')" :disabled="!skillHasValue('skill13', 1)" />
					<input type="checkbox" value="1" id="stress[stress5]" name="stress[stress5]" @change="setVal('stress.stress5',  $event.target.checked)" :checked="getVal('stress.stress5')" :disabled="!skillHasValue('skill13', 3)" />
					<input type="checkbox" value="1" id="stress[stress6]" name="stress[stress6]" @change="setVal('stress.stress6',  $event.target.checked)" :checked="getVal('stress.stress6')" :disabled="!skillHasValue('skill13', 3)" />
				</div>

				<!-- mental stress -->
				<div class="d-flex flex-row">
					<div class="form-group font-weight-bold pr-3 pt-2 mr-auto">
						MENTAL
					</div>
					<input type="checkbox" value="1" id="stress[mental1]" name="stress[mental1]" @change="setVal('stress.mental1',  $event.target.checked)" :checked="getVal('stress.mental1')" />
					<input type="checkbox" value="1" id="stress[mental2]" name="stress[mental2]" @change="setVal('stress.mental2',  $event.target.checked)" :checked="getVal('stress.mental2')" />
					<input type="checkbox" value="1" id="stress[mental3]" name="stress[mental3]" @change="setVal('stress.mental3',  $event.target.checked)" :checked="getVal('stress.mental3')" />
					<input type="checkbox" value="1" id="stress[mental4]" name="stress[mental4]" @change="setVal('stress.mental4',  $event.target.checked)" :checked="getVal('stress.mental4')" :disabled="!skillHasValue('skill19', 1)" />
					<input type="checkbox" value="1" id="stress[mental5]" name="stress[mental5]" @change="setVal('stress.mental5',  $event.target.checked)" :checked="getVal('stress.mental5')" :disabled="!skillHasValue('skill19', 3)" />
					<input type="checkbox" value="1" id="stress[mental6]" name="stress[mental6]" @change="setVal('stress.mental6',  $event.target.checked)" :checked="getVal('stress.mental6')" :disabled="!skillHasValue('skill19', 3)" />
				</div>

				<!-- consequences -->
				<div class="form-group text-center font-weight-bold">
					<div class="col-12">CONSEQUENCES</div>
				</div>

				<div v-for="consequence in consequences" :key="consequence.obj">
					<inputconsequence :consequence="consequence" />
				</div>
			</div>

			<!-- Skills -->
			<div class="fate-header col-12">Skills</div>

			<div class="px-3 skills">
				<div class="small text-muted font-italic">Click to edit skill names. Bonus stress is still calculated from value of physique/will slots even if you rename them.</div>
				<div v-for="skill in skills" :key="skill.obj">
					<inputskill :item="skill" />
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import InputSkillColumn from '../components/input-skill-column'
import InputAspect from '../components/input-aspect'
import InputConsequence from '../components/input-consequence'
import InputStressTrack from '../components/input-stress-track'
import InputStuntExtra from '../components/input-stuntextra'

export default {
  name: 'SheetFateCondensed',
  components: {
	"inputskill": InputSkillColumn,    
	"inputaspect": InputAspect,
	"inputconsequence": InputConsequence,
	"inputstress": InputStressTrack,
	"inputstuntextra": InputStuntExtra,
  },
  props: {    
    character: Object,
  }, 
  computed: {
 	...mapGetters([  
      'roll20Enabled'
    ]),
  },
  mounted() {
   this.$parent.$parent.title = 'Fate Condensed (Character Sheet)';
  },
  data () {
    return {
		skills:  [
			{placeholder:"ACADEMICS", obj:"skills.skill1", label:"skills.label1"},
			{placeholder:"ATHLETICS", obj:"skills.skill2", label:"skills.label2"},
			{placeholder:"BURGLARY", obj:"skills.skill3", label:"skills.label3"},
			{placeholder:"CONTACTS", obj:"skills.skill4", label:"skills.label4"},
			{placeholder:"CRAFTS", obj:"skills.skill5", label:"skills.label5"},
			{placeholder:"DECEIVE", obj:"skills.skill6", label:"skills.label6"},
			{placeholder:"DRIVE", obj:"skills.skill7", label:"skills.label7"},
			{placeholder:"EMPATHY", obj:"skills.skill8", label:"skills.label8"},
			{placeholder:"FIGHT", obj:"skills.skill9", label:"skills.label9"},
			{placeholder:"INVESTIGATE", obj:"skills.skill10", label:"skills.label10"},
			{placeholder:"LORE", obj:"skills.skill11", label:"skills.label11"},
			{placeholder:"NOTICE", obj:"skills.skill12", label:"skills.label12"},
			{placeholder:"PHYSIQUE", obj:"skills.skill13", label:"skills.label13"},
			{placeholder:"PROVOKE", obj:"skills.skill14", label:"skills.label14"},
			{placeholder:"RAPPORT", obj:"skills.skill15", label:"skills.label15"},
			{placeholder:"RESOURCES", obj:"skills.skill16", label:"skills.label16"},
			{placeholder:"SHOOT", obj:"skills.skill17", label:"skills.label17"},
			{placeholder:"STEALTH", obj:"skills.skill18", label:"skills.label18"},
			{placeholder:"WILL", obj:"skills.skill19", label:"skills.label19"},
			
		],
		aspects: [
			{label:"High Concept", obj:"aspects.highconcept"},
			{label:"Trouble", obj:"aspects.trouble"},
			{label:"Relationship", obj:"aspects.relationship"},
			{label:"Aspect", obj:"aspects.other1"},
			{label:"Aspect", obj:"aspects.other2"},			
		],
		consequences: [
			{label:"Mild", obj:"consequences.mild", value: "2"},
			{label:"Moderate", obj:"consequences.moderate", value: "4"},
			{label:"Severe", obj:"consequences.severe", value: "6"},
			{label:"Mild", obj:"consequences.mild2", value: "2", requirement: {obj:"skill13|skill19", val:"5" } },
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

		if (this.roll20Enabled && arr.indexOf("stress") !== -1)
		{
			let label = arr.indexOf("mental") > -1 ? "Mental" : "Physical";
			this.sendToRoll20("stress", `1 ${label}`, arr, val);		
			this.$parent.$parent.save();		
		}		
    },
    skillHasValue(skillList, value) {        
        var skillArray = skillList.split("|");
        
        var result = false;
        skillArray.forEach( (skillName) => {
            if (this.character.skills && this.character.skills[skillName] && parseInt(this.character.skills[skillName]) >= value)
            {
                result = true;                
            }
        });

        return result;
	}, 
	sendToRoll20(type, label, obj, item) {		
		switch(type)
		{			
			case "fatepoint":
				this.$parent.sendToRoll20(type, this.character.name, null, item);
				break;
			case "stress":
			case "consequence":
			case "stuntextra":
				this.$parent.sendToRoll20(type, this.character.name, label, item);
				break;
			default:
				if (this.getVal(item)) {
					this.$parent.sendToRoll20(type, this.character.name, label, this.getVal(item));
				}
				break;
		}
	},   
  }
}
</script>

<style lang="scss" scoped>
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:800');

	.sheet {
		margin: 20px;
		margin-top: 40px;
		max-width: 1024px;
	}

	.fate-logo {
		margin-top: -27px;
		max-height: 80px;
	}

	/deep/ .fate-header {
		font-family: 'Open Sans', sans-serif;
		text-transform: uppercase;
		background-color: black;
		color: white;
		font-weight: 700;
		padding-bottom: 0px;
		margin-bottom: 0px;
		font-size: 36px;
		height: 40px;
	}


	/deep/ .col-form-label {
		font-family: 'Open Sans', sans-serif;
		text-transform: uppercase;
		font-size: 22px;
		font-weight: 700;
	}

	.fate-skills .form-group {
		margin-top: 1px;
		margin-bottom: 1px;
	}

	.fate-skills label {
		padding-bottom: 2px;
	}

	.fate-aspects .form-group {
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
		font-size: 30px;
		font-weight: 700;
		margin-left: -5px;
		margin-right: -5px;
	}

	.portrait {
		max-height: 450px;
		padding-top: 10px;
	}

	.small {
		color: #888;
	}

	/* IMAGE STYLES */	
	textarea {
		border: 0 !important;
	}

	#stunts {
		height: 500px;		
		min-height: 500px;
	}

	/deep/ input.inputlabel {
		font-size: 22px;
		font-weight: 700;
		border-width: 0px;
		padding-top: 0px;
		text-transform: capitalize !important;		
	}

	input.refresh {
		border: 4px solid black;
		border-radius: 50px 50px;
		width: 100px;
		height: 100px;
		text-align: center;
		font-size: 55px; 		
	}

	@media print {
		.sheet {
			margin: 20px;
			margin-top: 20px;
			max-width: 1024px;
		}
	}
</style>
