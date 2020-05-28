<template>
<div class="sheet">
    <div class="row">
        <div class="col-sm-6 text-center order-md-2 text-md-right pb-2 pb-md-0">
            <img alt="Fate of Cthulhu" class="img-fluid fate-logo" :src="$parent.GetSheetImage()" />
        </div>
        <div class="col-sm-6">
            <div class="form-group">
                <input type="text" class="form-control" id="name" name="name" @change="setVal('name',  $event.target.value)" :value="getVal('name')" placeholder="Name" />
            </div>
        </div>
    </div>

    <div class="row">
        <!-- aspects -->
        <div class="col-sm-6 col-md-8 fate-aspects px-0" style="border-right: 2px solid #3A5224;">
            <div for="" class="fate-header">Aspects</div>
            <div v-for="aspect in aspects" :key="aspect.obj">
                <inputaspect :aspect="aspect" />
            </div>         

            <div class="">
              <inputstuntextra item="stunts" :rows="18" :border="false" header="Regular Stunts" />
            </div>
                         
            <div class="">
              <inputstuntextra item="stunts_corrupted" :rows="14" :border="false" header="Corrupted Stunts" />
            </div>
        </div>

        <!-- Vitals and Skills -->

        <div class="col-sm-6 col-md-4 fate-skills px-0">
            <div class="fate-header col-12">Vitals</div>

            <div class="pl-3">
                <!-- Stress -->
                <div class="form-group text-center font-weight-bold d-flex flex-row">
                    <div class="col-6">REFRESH</div>
                    <div class="col-6">CORRUPTION</div>
                </div>

                <div class="form-group text-center font-weight-bold d-flex">
                    <div class="form-group w-50">
                        <input type="number" class="form-control text-center" id="refresh" name="refresh" @change="setVal('refresh',  $event.target.value)" :value="getVal('refresh')" placeholder="Refresh" />                        
                        <span v-if="roll20Enabled" class='dice fo20'>A</span>
                        <span>FP</span>                    
                        <inputfatepoints inputclass="fatepoints" placeholder="-" />
                    </div>
                    <div class="form-group w-50 d-flex flex-wrap justify-content-center">
                       <div v-for="stress in corruption" :key="stress.obj">
					        <inputstress :stress="stress" stresstype="Corruption" hidelabel="true" />
				        </div>
                    </div>
                </div>

                <!-- Stress -->
                <div class="form-group text-center font-weight-bold pt-2">
                    <div class="col-12">STRESS <span v-if="roll20Enabled" class='dice fo20 font-weight-normal'>D</span></div>
                </div>

                <!-- physical stress -->
                <div class="d-md-flex flex-row pb-2">
                    <div class="form-group font-weight-bold pr-2 mr-auto">
                        PHYSICAL
                    </div>
                    <div class="d-flex justify-content-between stressbox">
						<div v-for="stress in physicalstress" :key="stress.obj">
							<inputstress :stress="stress" stresstype="Physical" hidelabel="true" />
						</div>
					</div>
                </div>

                <!-- mental stress -->
                <div class="d-md-flex flex-row">
                    <div class="form-group font-weight-bold pr-3 mr-auto">
                        MENTAL
                    </div>
                   <div class="d-flex justify-content-between stressbox">
						<div v-for="stress in mentalstress" :key="stress.obj">
							<inputstress :stress="stress" stresstype="Mental" hidelabel="true" />
						</div>
					</div>
                </div>

                <!-- consequences -->
                <div class="form-group text-center font-weight-bold pt-2">
                    <div class="col-12">CONSEQUENCES <span v-if="roll20Enabled" class='dice fo20 font-weight-normal'>D</span></div>
                </div>
                <div v-for="consequence in consequences" :key="consequence.obj">
					<inputconsequence :consequence="consequence" />
				</div>
            </div>

            <!-- Skills -->
            <div class="fate-header col-12">Skills</div>

            <div class="pl-3">
                <div class="pt-1" v-for="skill in skills" :key="skill.obj">
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
import InputAspect from '../components/input-aspect-cthulhu'
import InputConsequence from '../components/input-consequence'
import InputStress from '../components/input-stress'
import InputStuntExtra from '../components/input-stuntextra'
import InputFatePoints from '../components/input-fatepoints'

export default {
  name: 'SheetFateOfCthulhu',
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
      'roll20Enabled'
    ]),
  },
  mounted() {
   this.$parent.$parent.title = 'Fate of Cthulhu (Character Sheet)';
  },
  data () {
    return {
        skills:  [
			{placeholder:"ACADEMICS", obj:"skills.academics"},
            {placeholder:"ATHLETICS", obj:"skills.athletics"},
            {placeholder:"BURGLARY", obj:"skills.burglary"},
            {placeholder:"CONTACTS", obj:"skills.contacts"},
            {placeholder:"CRAFTS", obj:"skills.crafts"},
            {placeholder:"DECEIVE", obj:"skills.deceive"},
            {placeholder:"DRIVE", obj:"skills.drive"},
            {placeholder:"EMPATHY", obj:"skills.empathy"},
            {placeholder:"FIGHT", obj:"skills.fight"},
            {placeholder:"INVESTIGATE", obj:"skills.investigate"},
            {placeholder:"LORE", obj:"skills.lore"},
            {placeholder:"NOTICE", obj:"skills.notice"},
            {placeholder:"PHYSIQUE", obj:"skills.physique"},
            {placeholder:"PROVOKE", obj:"skills.provoke"},
            {placeholder:"RAPPORT", obj:"skills.rapport"},
            {placeholder:"RESOURCES", obj:"skills.resources"},
            {placeholder:"SHOOT", obj:"skills.shoot"},
            {placeholder:"STEALTH", obj:"skills.stealth"},
            {placeholder:"WILL", obj:"skills.will"},
		],
		aspects: [
			{label:"High Concept", obj:"aspects.highconcept", corrupted_obj:"aspect_corrupted.highconcept"},
			{label:"Trouble", obj:"aspects.trouble", corrupted_obj:"aspect_corrupted.trouble"},
			{label:"Relationship", obj:"aspects.relationship", corrupted_obj:"aspect_corrupted.relationship"},
			{label:"Aspect", obj:"aspects.other1", corrupted_obj:"aspect_corrupted.other1"},
			{label:"Aspect", obj:"aspects.other2", corrupted_obj:"aspect_corrupted.other2"},			
		],
		consequences: [
			{label:"Mild", obj:"consequences.mild", value: "2"},
			{label:"Moderate", obj:"consequences.moderate", value: "4"},
			{label:"Severe", obj:"consequences.severe", value: "6"},
			{label:"Mild", obj:"consequences.mild2", value: "2", requirement: {obj:"physique|will", val:"5" } },
		],
		physicalstress: [
			{label:"1", obj:"stress1"},
			{label:"2", obj:"stress2"},
			{label:"3", obj:"stress3"},
            {label:"4", obj:"stress4", requirement: {obj:"physique", val:"1" }},
			{label:"5", obj:"stress5", requirement: {obj:"physique", val:"3" }},
			{label:"6", obj:"stress6", requirement: {obj:"physique", val:"3" }},
        ],
        mentalstress: [
			{label:"1", obj:"mental1"},
			{label:"2", obj:"mental2"},
			{label:"3", obj:"mental3"},
            {label:"4", obj:"mental4", requirement: {obj:"will", val:"1" }},
			{label:"5", obj:"mental5", requirement: {obj:"will", val:"3" }},
			{label:"6", obj:"mental6", requirement: {obj:"will", val:"3" }},						
        ],
        corruption: [
			{label:"1", obj:"corruption1"},
			{label:"1", obj:"corruption2"},
            {label:"1", obj:"corruption3"},
            {label:"1", obj:"corruption4"},
        ],
    }
  },
  methods: {  
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
    sendToRoll20(type, label, obj, item, skillType) {		
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
					this.$parent.sendToRoll20(type, this.character.name, label, this.getVal(item), skillType);
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
        max-height: 130px;
    }

    /deep/ .fate-header {
        font-family: 'Open Sans', sans-serif;
        text-transform: uppercase;
        background-color: #3A5224;
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

    /deep/ div .stressbox input[type=checkbox] {
        height: 28px;
        width: 28px;
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

    /deep/ .small {
        color: #888;
    }

    /* HIDE CHECKBOX */
    /deep/ .corrupted-checkbox {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        cursor: pointer;
    }

    /* IMAGE STYLES */
    /deep/ .corrupted-checkbox + div {
        min-width: 50px;
        min-height: 50px;
        background-repeat: no-repeat;
        background-position: center center;
        cursor: pointer;
        background-image: url('/static/sheets/fate-of-cthulhu/corrupted-checkbox.png');
    }

    /* CHECKED STYLES */
    /deep/ .corrupted-checkbox:checked + div {
        background-image: url('/static/sheets/fate-of-cthulhu/corrupted-checkbox-checked.png');
    }

    /deep/ textarea {
        border: 0 !important;
    }
</style>
