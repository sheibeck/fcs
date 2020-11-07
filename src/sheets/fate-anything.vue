<template>
<div class="sheet">
	<div class="row">		
		<div class="col-sm-6 text-center order-md-2 text-md-right pb-2 pb-md-0 text-right d-md-flex">
			<div class="mr-auto d-print-none d-none d-md-inline"></div>
			<img alt="Fate Anything" class="img-fluid fate-logo order-1 order-md-2" :src="$parent.GetSheetImage()" />			
			<div class="d-print-none order-2 order-md-1">
				<small class="text-muted">{{`Customizations ${isEditLocked ? 'locked' : 'unlocked'}`}}</small> <button type="button" :title="`Click to ${isEditLocked ? 'unlock' : 'lock'}`" class="btn btn-link" @click="updateLockStatus()"><i :class="`fa fa-${isEditLocked ? 'lock' : 'unlock'}`"></i></button>
			</div>
		</div>

		<div class="col-sm-6 d-flex flex-column flex-md-row order-md-1">
			<div class="form-group d-flex mr-md-3 col-md-8">
				<label class="mt-2 mr-2">Name</label>
				<input type="text" class="form-control" id="name" name="name" @change="setVal('name',  $event.target.value)" :value="getVal('name')" placeholder="Name" />
			</div>

			<div class="form-group d-flex col-md-4">
				<label class="mt-2 mr-2">Pronoun</label>
				<input type="text" class="form-control" id="pronoun" name="pronoun" @change="setVal('pronoun',  $event.target.value)" :value="getVal('pronoun')" placeholder="Pronoun" />
			</div>
		</div>		
	</div>

	<div class="row">
		<!-- aspects -->
		<div class="col-sm-6 col-md-7 fate-aspects px-0" style="border-right: 2px solid #3A5224;">
			<div class="fate-header d-flex">
				<div class="mr-auto">Aspects</div>
				<div v-if="!isEditLocked">
					<i title="Add Aspect" class="fas d-print-none fa-plus pr-2" style="cursor: pointer;" v-on:click="addAspect()"></i>
				</div>
			</div>
			<div class="px-1">
				<div v-for="aspect in character.template.aspects" :key="aspect.id">
					<inputaspect v-on:remove-aspect="onRemoveAspect" :aspect="aspect" :customlabel="true" :showlabel="true" :removable="true" :editlock="isEditLocked" />
				</div>
			</div>
			
			<inputstuntextra item="stunts" :rows="30" :border="false" header="Stunts" v-on="$listeners" />

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
			<div class="fate-header d-flex">				
				<div class="mr-auto">Stress <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>	
				<div v-if="!isEditLocked">
					<i title="Add Stress Track" class="fas d-print-none fa-plus pr-2" style="cursor: pointer;" v-on:click="addStressTrack()"></i>
				</div>
			</div>

			<!-- stress -->
			<div class="d-md-flex flex-column pb-2 px-1" v-for="stress in character.template.stress" :key="stress.id">
				<div class="form-group font-weight-bold pr-2 mt-0 border-bottom d-flex">
					<input v-if="!isEditLocked" class="w-75 mr-auto inputlabel" type="text" :id="`${stress.label}`" :name="`${stress.label}`" 
						@change="setVal(`${stress.label}`,  $event.target.value)" 
						:value="getVal(`${stress.label}`)" :placeholder="stress.placeholder" />
					<label v-else>{{getStressTrackLabel(stress.label, stress.placeholder)}}</label>
					<button type="button" v-if="!isEditLocked" class="btn btn-link text-secondary m-0 p-0" v-on:click="removeStressTrack(stress.id)">
						<i title="Delete Stress Track" class="fas d-print-none fa-minus-circle"></i>
					</button>
					<button type="button" v-if="!isEditLocked" class="btn btn-link text-secondary m-0 p-0" v-on:click="addStressBox(stress.id)">
						<i title="Add Stress Box" class="fas d-print-none fa-plus-circle"></i>
					</button>					
				</div>
				<div class="d-flex flex-wrap justify-content-around pt-1">
					<div v-for="box in stress.boxes" :key="box.id" class="pt-1">
						<inputstress v-on:remove-stress-box="onRemoveStressBox" :parentid="stress.id" :stress="box" :stresstype="getStressType(stress)"
							:customlabel="true" :removable="true" :hidelabel="false" :editlock="isEditLocked" />
					</div>
				</div>
			</div>				
			
			<!-- consequences -->
			<div class="fate-header d-flex">				
				<div class="mr-auto">Consequences</div>	
				<div v-if="!isEditLocked">
					<i title="Add Consequence" class="fas d-print-none fa-plus pr-2" style="cursor: pointer;" v-on:click="addConsequence()"></i>
				</div>
			</div>
			<div class="px-1" v-for="consequence in character.template.consequences" :key="consequence.obj">
				<inputconsequence v-on:remove-consequence="onRemoveConsequence" :consequence="consequence" :customlabel="true" :removable="true" :editlock="isEditLocked" />
			</div>

			<!-- Skills -->
			<div class="fate-header d-flex mt-2">				
				<div class="mr-auto">Skills</div>	
				<div v-if="!isEditLocked">
					<i title="Add Skill" class="fas d-print-none fa-plus pr-2" style="cursor: pointer;" v-on:click="addSkill()"></i>
				</div>
			</div>

			<div class="px-1 skills">				
				<div v-for="skill in character.template.skills" :key="skill.obj" class="mt-1">
					<inputskill v-on:remove-skill="onRemoveSkill" :removable="true" :item="skill" :customlabel="true" :editlock="isEditLocked" />
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
  name: 'SheetFateAnything',
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
  created() {
	this.init();
  },
  mounted() {
	this.$store.commit("updatePageTitle", 'Fate Anything (Character Sheet)');
  },
  data () {
    return {
		defaultTemplate: {
			skills:  [
				{id: 1, placeholder:"ACADEMICS", obj:"skills.skill1", label:"skills.label1"},
				{id: 2, placeholder:"ATHLETICS", obj:"skills.skill2", label:"skills.label2"},
				{id: 3, placeholder:"BURGLARY", obj:"skills.skill3", label:"skills.label3"},
				{id: 4, placeholder:"CONTACTS", obj:"skills.skill4", label:"skills.label4"},
				{id: 5, placeholder:"CRAFTS", obj:"skills.skill5", label:"skills.label5"},
				{id: 6, placeholder:"DECEIVE", obj:"skills.skill6", label:"skills.label6"},
				{id: 7, placeholder:"DRIVE", obj:"skills.skill7", label:"skills.label7"},
				{id: 8, placeholder:"EMPATHY", obj:"skills.skill8", label:"skills.label8"},
				{id: 9, placeholder:"FIGHT", obj:"skills.skill9", label:"skills.label9"},
				{id: 10, placeholder:"INVESTIGATE", obj:"skills.skill10", label:"skills.label10"},
				{id: 11, placeholder:"LORE", obj:"skills.skill11", label:"skills.label11"},
				{id: 12, placeholder:"NOTICE", obj:"skills.skill12", label:"skills.label12"},
				{id: 13, placeholder:"PHYSIQUE", obj:"skills.skill13", label:"skills.label13"},
				{id: 14, placeholder:"PROVOKE", obj:"skills.skill14", label:"skills.label14"},
				{id: 15, placeholder:"RAPPORT", obj:"skills.skill15", label:"skills.label15"},
				{id: 16, placeholder:"RESOURCES", obj:"skills.skill16", label:"skills.label16"},
				{id: 17, placeholder:"SHOOT", obj:"skills.skill17", label:"skills.label17"},
				{id: 18, placeholder:"STEALTH", obj:"skills.skill18", label:"skills.label18"},
				{id: 19, placeholder:"WILL", obj:"skills.skill19", label:"skills.label19"}			
			],
			aspects: [
				{id: 1, label:"aspects.label1", obj:"aspects.aspect1", placeholder:"High Concept"},
				{id: 2, label:"aspects.label2", obj:"aspects.aspect2", placeholder:"Trouble"},
				{id: 3, label:"aspects.label3", obj:"aspects.aspect3", placeholder:"Relationship"},
				{id: 4, label:"aspects.label4", obj:"aspects.aspect4", placeholder:"Aspect"},
				{id: 5, label:"aspects.label5", obj:"aspects.aspect5", placeholder:"Aspect"},		
			],
			consequences: [
				{id: 1, label:"consequences.label1", obj:"consequences.consequence1", value:"consequences.value1", placeholder:"Mild", valueplaceholder:"2"},
				{id: 2, label:"consequences.label2", obj:"consequences.consequence2", value:"consequences.value2", placeholder:"Moderate", valueplaceholder:"3"},
				{id: 3, label:"consequences.label3", obj:"consequences.consequence3", value:"consequences.value3", placeholder:"Severe", valueplaceholder:"4"},
			],
			stress: [
				{
					id: 1,
					label: "stress.stress1.label",
					placeholder: "Physical",
					boxes: [
						{id: 1, label:"stress.stress1.boxes.label1", obj:"stress.stress1.boxes.stress1", placeholder: "1"},
						{id: 2, label:"stress.stress1.boxes.label2", obj:"stress.stress1.boxes.stress2", placeholder: "2"},
						{id: 3, label:"stress.stress1.boxes.label3", obj:"stress.stress1.boxes.stress3", placeholder: "3"},
					]
				},
				{
					id: 2,
					label: "stress.stress2.label",
					placeholder: "Mental",
					boxes: [
						{id: 1, label:"stress.stress2.boxes.label1", obj:"stress.stress2.boxes.stress1", placeholder: "1"},
						{id: 2, label:"stress.stress2.boxes.label2", obj:"stress.stress2.boxes.stress2", placeholder: "2"},
						{id: 3, label:"stress.stress2.boxes.label3", obj:"stress.stress2.boxes.stress3", placeholder: "3"},
					]
				}
			] 		
		},
		isEditLocked: true,
    }
  },  
  methods: {  
	init() {
		if (!this.character.template) {
			this.character.template = this.$set(this.character, "template", this.defaultTemplate);
		}
	},
	updateLockStatus() {		
		this.isEditLocked = !this.isEditLocked;
	},
	getStressTrackLabel(label, placeholder) {     
    	let value = this.getVal(`${label}`);
    	return (!value) ? placeholder : value;     
    },
	getStressType(stress) {		
		if (stress.label !== "") {
			let label = this.getVal(stress.label);
			if (label !== "") {
				return label
			};
		}		
		return stress.placeholder;		
	},
    getVal(graphPath, defaultValue) {		
      	return this.$parent.getVal(this.character, graphPath, defaultValue);
    },
    setVal(arr, val) {		
		this.$parent.setVal(this.character, arr, val);
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
	addAspect() {
		var id = this.getNextId(this.character.template.aspects);
		var obj = {id: id, obj:`aspects.aspect${id}`, label:`aspects.label${id}`, placeholder:"ASPECT"};		
		this.character.template.aspects.push(obj);		
	},
	addSkill() {
		var id = this.getNextId(this.character.template.skills);
		var obj = {id: id, obj:`skills.skill${id}`, label:`skills.label${id}`, placeholder:"SKILL"}
		this.character.template.skills.push(obj);		
	},
	addConsequence() {
		var id = this.getNextId(this.character.template.consequences);
		var obj = {id: id, label:`consequences.label${id}`, obj:`consequences.consequence${id}`, value:`consequences.value${id}`, placeholder:"CONSEQUENCE", valueplaceholder:"2"};		
		this.character.template.consequences.push(obj);
	},
	addStressTrack() {
		var id = this.getNextId(this.character.template.stress);
		var obj = {
				id: id,
				label: `stress.stress${id}.label`,
				placeholder: "Stress",
				boxes: [
					{id: 1, label:`stress.stress${id}.boxes.label1`, obj:`stress.stress${id}.boxes.stress1`, placeholder: "1"},		
				]
			}
		this.character.template.stress.push(obj);
	},
	addStressBox(parentid) {		
		var stressTrack = this.character.template.stress.find(x => x.id === parentid);
		var id = this.getNextId(stressTrack.boxes);
		var obj = {id: id, label:`stress.stress${parentid}.boxes.label${id}`, obj:`stress.stress${parentid}.boxes.stress${id}`, placeholder: "1"}							
		stressTrack.boxes.push(obj);
	},
	getNextId(items) {
		if (items.length == 0) return 1;

		let max = Math.max.apply(Math, items.map(function(o) { return o.id; }));
		return max+1;
	},
	onRemoveAspect: function (id) {			
		let arr = this.character.template.aspects.filter(function( obj ) {
			return obj.id !== id;
		});
		this.$set(this.character.template, 'aspects', arr);
	},
	onRemoveSkill: function (id) {		
		let arr = this.character.template.skills.filter(function( obj ) {
			return obj.id !== id;
		});
		this.$set(this.character.template, 'skills', arr);
	},
	removeStressTrack: function (id) {
		let arr = this.character.template.stress.filter(function( obj ) {
			return obj.id !== id;
		});
		this.$set(this.character.template, 'stress', arr);
  	},
	onRemoveStressBox: function (id, parentid) {		
		var stressTrack = this.character.template.stress.find(x => x.id === parentid);
		let arr = stressTrack.boxes.filter(function( obj ) {
			return obj.id !== id;
		});
		this.$set(stressTrack, 'boxes', arr);
	},
	onRemoveConsequence: function (id) {
		let arr = this.character.template.consequences.filter(function( obj ) {
			return obj.id !== id;
		});
		this.$set(this.character.template, 'consequences', arr);
  	}
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
		height: 43px;
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

	/deep/ label {
		font-size: 22px !important;
		font-weight: 700;
		border-width: 0px;
		margin-top: 0px;
		margin-bottom: 0px;					
		text-transform: capitalize !important;
	}

</style>
