<template>
<div class="sheet">
	<div class="row">		
		<div class="col-sm-6 d-flex">
			<div class="form-group w-75 d-flex mr-3">
				<label class="mt-2 mr-2">Name</label>
				<input type="text" class="form-control" id="name" name="name" @change="setVal('name',  $event.target.value)" :value="getVal('name')" placeholder="Name" />
			</div>

			<div class="form-group d-flex">
				<label class="mt-2 mr-2">Pronoun</label>
				<input type="text" class="form-control" id="pronoun" name="pronoun" @change="setVal('pronoun',  $event.target.value)" :value="getVal('name')" placeholder="Pronoun" />
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
			
			<inputstuntextra item="stunts" :rows="30" :border="false" header="Stunts" />

			<div class="fate-header mb-5 mb-sm-0">
				<div class="d-flex">
					<input class="refresh pl-md-3" type="number" id="refresh" name="refresh" @change="setVal('refresh',  $event.target.value)" :value="getVal('refresh')" placeholder="3" /> <div class="pt-0">Refresh</div>
				</div>				
			</div>
			<div style="height: 50px;"></div>
			<div class="fate-header mb-5 mb-sm-0 d-flex">
				<div class="mr-auto"></div>
				<div class="d-flex" style="min-height: 50px;">
					<span v-if="vttEnabled" class='dice fo20 font-weight-normal'>A</span><div class="pt-0">Fate Points</div>
					<inputfatepoints inputclass="fatepoints" placeholder="-" />
				</div>
			</div>					
		</div>

		<!-- Vitals and Skills -->
		<div class="col-sm-6 col-md-5 fate-skills px-0 mt-3 mt-sm-0">
			<div class="fate-header col-12">Vitals</div>

			<div class="px-3">				
				<!-- Stress -->
				<div class="form-group text-center font-weight-bold">
					<div class="col-12">STRESS  <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>
				</div>

				<!-- physical stress -->
				<div class="d-md-flex flex-row pb-2">
					<div class="form-group font-weight-bold pr-2 pt-2 mr-auto">
						PHYSICAL
					</div>
					<div class="d-flex justify-content-between">
						<div v-for="stress in physicalstress" :key="stress.obj">
							<inputstress :stress="stress" stresstype="Physical" hidelabel="true" />
						</div>
					</div>
				</div>

				<!-- mental stress -->
				<div class="d-md-flex flex-row">
					<div class="form-group font-weight-bold pr-3 pt-2 mr-auto">
						MENTAL
					</div>
					<div class="d-flex justify-content-between">
						<div v-for="stress in mentalstress" :key="stress.obj">
							<inputstress :stress="stress" stresstype="Mental" hidelabel="true" />
						</div>
					</div>
				</div>

				<!-- consequences -->
				<div class="form-group text-center font-weight-bold">
					<div class="col-12">CONSEQUENCES <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>
				</div>
				<div v-for="consequence in consequences" :key="consequence.obj">
					<inputconsequence :consequence="consequence" />
				</div>
			</div>

			<!-- Skills -->
			<div class="fate-header col-12">Skills</div>

			<div class="px-3 skills">
				<div class="small text-muted font-italic d-print-none">Click to edit skill names. Bonus stress is still calculated from value of physique/will slots even if you rename them.</div>
				<div v-for="skill in skills" :key="skill.obj" class="py-1">
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
import InputStress from '../components/input-stress'
import InputStuntExtra from '../components/input-stuntextra'
import InputFatePoints from '../components/input-fatepoints'

export default {
  name: 'SheetFateCondensed',
  components: {
	"inputskill": InputSkillColumn,    
	"inputaspect": InputAspect,
	"inputconsequence": InputConsequence,
	"inputstress": InputStress,
	"inputstuntextra": InputStuntExtra,
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
		physicalstress: [
			{label:"1", obj:"stress1"},
			{label:"2", obj:"stress2"},
			{label:"3", obj:"stress3"},
            {label:"4", obj:"stress4", requirement: {obj:"skill13", val:"1" }},
			{label:"5", obj:"stress5", requirement: {obj:"skill13", val:"3" }},
			{label:"6", obj:"stress6", requirement: {obj:"skill13", val:"3" }},
        ],
        mentalstress: [
			{label:"1", obj:"mental1"},
			{label:"2", obj:"mental2"},
			{label:"3", obj:"mental3"},
            {label:"4", obj:"mental4", requirement: {obj:"skill19", val:"1" }},
			{label:"5", obj:"mental5", requirement: {obj:"skill19", val:"3" }},
			{label:"6", obj:"mental6", requirement: {obj:"skill19", val:"3" }},						
		],        
		
    }
  },
  methods: {  
    getVal(graphPath, defaultValue) {
      return this.$parent.getVal(this.character, graphPath, defaultValue);
    },
    setVal(arr, val) {		
		this.$parent.setVal(this.character, arr, val);

		if (this.vttEnabled && arr.indexOf("stress") !== -1)
		{
			let label = arr.indexOf("mental") > -1 ? "Mental" : "Physical";
			this.sendToVTT("stress", `1 ${label}`, arr, val);		
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
	sendToVTT(type, label, obj, item, skillType) {		
		switch(type)
		{			
			case "fatepoint":
				this.$parent.sendToVTT(type, this.character.name, null, item);
				break;
			case "stress":
			case "consequence":
			case "stuntextra":
				this.$parent.sendToVTT(type, this.character.name, label, item);
				break;
			default:
				if (this.getVal(item)) {
					this.$parent.sendToVTT(type, this.character.name, label, this.getVal(item), skillType);
				}
				break;
		}
	},   
  }
}
</script>

<style lang="scss" scoped>
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:800');

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
		height: 38px;
		width: 38px;
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

	/deep/ input.refresh {
		border: 4px solid black;
		border-radius: 50px 50px;
		width: 100px;
		height: 100px;
		text-align: center;
		font-size: 55px;		
	}
	/deep/ input.fatepoints {
		border: 4px solid black;
		border-radius: 50px 50px;
		width: 100px;
		height: 100px;
		text-align: center;
		font-size: 55px;
		padding-left: 20px;	
		margin-top: -60px;	
	}

</style>
