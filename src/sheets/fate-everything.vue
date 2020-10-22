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
				<input type="text" class="form-control" id="pronoun" name="pronoun" @change="setVal('pronoun',  $event.target.value)" :value="getVal('pronoun')" placeholder="Pronoun" />
			</div>
		</div>
		<div class="col-sm-6 text-center order-md-2 text-md-right pb-2 pb-md-0">
			<img alt="Fate Everything" class="img-fluid fate-logo" :src="$parent.GetSheetImage()" />
		</div>
	</div>

	<div class="row">
		<!-- aspects -->
		<div class="col-sm-6 col-md-7 fate-aspects px-0" style="border-right: 2px solid #3A5224;">
			<div class="fate-header d-flex">
				<div class="mr-auto">Aspects</div>
				<div>
					<i title="Add Aspect" class="fas d-print-none fa-plus pr-2" style="cursor: pointer;" v-on:click="addAspect()"></i>
				</div>
			</div>
			<div class="px-3">
				<div v-for="aspect in aspects" :key="aspect.id">
					<inputaspect v-on:remove-aspect="onRemoveAspect" :aspect="aspect" :customlabel="true" :showlabel="true" :removable="true" />
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
			<div class="fate-header col-12 d-flex">				
				<div class="mr-auto">Stress <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>	
				<div>
					<i title="Add Stress Track" class="fas d-print-none fa-plus pr-2" style="cursor: pointer;" v-on:click="addStressTrack()"></i>
				</div>
			</div>

			<!-- stress -->
			<div class="d-md-flex flex-column pb-2" v-for="stress in stress" :key="stress.id">
				<div class="form-group font-weight-bold pr-2 mt-0 text-center border-bottom">					
					<input class="w-75 mr-auto inputlabel text-center" type="text" :id="`${stress.label}`" :name="`${stress.label}`" 
						@change="setVal(`${stress.label}`,  $event.target.value)" 
						:value="getVal(`${stress.label}`)" :placeholder="stress.placeholder" />					
					<button type="button" class="btn btn-link text-secondary m-0 p-0" v-on:click="removeStress(stress.id)">
						<i title="Delete Stress Track" class="fas d-print-none fa-minus-circle pr-2"></i>
					</button>
					<button type="button" class="btn btn-link text-secondary m-0 p-0" v-on:click="addStressBox(stress.id)">
						<i title="Add Stress Box" class="fas d-print-none fa-plus-circle pr-2"></i>
					</button>
					
				</div>
				<div class="d-flex flex-wrap pt-1">
					<div v-for="box in stress.boxes" :key="box.id" class="pt-1">
						<inputstress v-on:remove-stress-box="onRemoveStressBox" :parentid="stress.id" :stress="box" :stresstype="stress.label"
							:customlabel="true" :removable="true" :hidelabel="false" />
					</div>
				</div>
			</div>				
			
			<!-- consequences -->
			<div class="fate-header col-12 d-flex">				
				<div class="mr-auto">Consequences</div>	
				<div>
					<i title="Add Consequence" class="fas d-print-none fa-plus pr-2" style="cursor: pointer;" v-on:click="addConsequence()"></i>
				</div>
			</div>
			<div v-for="consequence in consequences" :key="consequence.obj">
				<inputconsequence :consequence="consequence" :customlabel="true" />
			</div>

			<!-- Skills -->
			<div class="fate-header col-12 d-flex">				
				<div class="mr-auto">Skills</div>	
				<div>
					<i title="Add Skill" class="fas d-print-none fa-plus pr-2" style="cursor: pointer;" v-on:click="addSkill()"></i>
				</div>
			</div>

			<div class="px-3 skills">				
				<div v-for="skill in skills" :key="skill.obj" class="py-1">
					<inputskill v-on:remove-skill="onRemoveSkill" :removable="true" :item="skill" />
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
  name: 'SheetFateEverything',
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
   this.$parent.$parent.title = 'Fate Everything (Character Sheet)';
  },
  data () {
    return {
		skills:  [
			{id: 1, placeholder:"SKILL", obj:"skills.skill1", label:"skills.label1"},
		],
		aspects: [
			{id: 1, label:"aspects.label1", obj:"aspects.aspect1", placeholder:"ASPECT"},
		],
		consequences: [
			{id: 1, label:"consequences.label1", obj:"consequences.consequence1", value:"consequences.value1", placeholder:"CONSEQUENCE", valueplaceholder:"2"},
		],
		stress: [
			{
				id: 1,
				label: "stress.label1",
				placeholder: "Stress",
				boxes: [
					{id: 1, label:"stress1.boxes.label1", obj:"stress1.boxes.stress1", placeholder: "1"},		
				]
			}
		] 		
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
	addAspect() {
		var id = this.getNextId(this.aspects);
		var obj = {id: id, label:`aspects.label${id}`, obj:`aspects.aspect${id}`, placeholder:"ASPECT"};		
		this.aspects.push(obj);		
	},
	addSkill() {
		var id = this.getNextId(this.skills);
		var obj = {id: id, obj:`skills.skill${id}`, label:`skills.label${id}`, placeholder:"SKILL"}
		this.skills.push(obj);		
	},
	addStressTrack() {
		var id = this.getNextId(this.skills);
		var obj = {
				id: id,
				label: "stress.label1",
				placeholder: "Stress",
				boxes: [
					{id: 1, label:`stress1.boxes.label1`, obj:`stress1.boxes.stress1`, placeholder: "1"},		
				]
			}
		this.stress.push(obj);
	},
	addStressBox(parentid) {		
		var stressTrack = this.stress.find(x => x.id === parentid);
		var id = this.getNextId(stressTrack.boxes);
		var obj = {id: id, label:`stress1.boxes.label${id}`, obj:`stress1.boxes.stress${id}`, placeholder: "1"}							
		stressTrack.boxes.push(obj);
	},
	getNextId(items) {
		if (items.length == 0) return 1;

		let max = Math.max.apply(Math, items.map(function(o) { return o.id; }));
		return max+1;
	},
	onRemoveAspect: function (id) {	
		let arr = this.aspects.filter(function( obj ) {
			return obj.id !== id;
		});
		this.$set(this, 'aspects', arr);
	},
	onRemoveSkill: function (id) {		
		let arr = this.skills.filter(function( obj ) {
			return obj.id !== id;
		});
		this.$set(this, 'skills', arr);
	},
	onRemoveStressTrack: function (id) {
		let arr = this.stress.filter(function( obj ) {
			return obj.id !== id;
		});
		this.$set(this, 'stress', arr);
  	},
	onRemoveStressBox: function (id, parentid) {
		var stressTrack = this.stress.find(x => x.id === parentid);
		let arr = stressTrack.boxes.filter(function( obj ) {
			return obj.id !== id;
		});
		this.$set(stressTrack, 'boxes', arr);
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
