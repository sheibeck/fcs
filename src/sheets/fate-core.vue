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
                    <input type="number" class="form-control text-center" id="refresh" name="refresh" @change="setVal('refresh',  $event.target.value)" :value="getVal('refresh')" placeholder="Refresh" />
                </div>
                <div class="col-6 text-center ">                    
                    <div for="fatepoints" class="fate-header">
						FP <span v-if="vttEnabled" class='dice fo20 font-weight-normal small'>A</span>
					</div>
                    <inputfatepoints v-on="$listeners" />
                </div>
            </div>
        </div>

        <div class="col-sm-6 col-md-8 order-md-1 ">
            <div class="d-flex">
                <div class="form-group w-75 mr-1">
                    <div for="name" class="fate-header">ID</div>
                    <input type="text" class="form-control" id="name" name="name" @change="setVal('name',  $event.target.value)" :value="getVal('name')" placeholder="Name" />                
                </div>
                <div class="form-group w-25">
                    <div for="name" class="fate-header">Pronoun</div>
                    <input type="text" class="form-control" id="pronoun" name="pronoun" @change="setVal('pronoun',  $event.target.value)" :value="getVal('pronoun')" placeholder="Pronoun" />
                </div>
            </div>

            <div class="form-group">
                <textarea class="form-control" id="description" name="description" rows="3" @change="setVal('description',  $event.target.value)" :value="getVal('description')" placeholder="Description"></textarea>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- aspects -->
        <div class="col-sm-12 col-md-6 fate-aspects">
            <div class="form-group">
                <div for="" class="fate-header">Aspects</div>
            </div>            
            <div v-for="aspect in aspects" :key="aspect.obj" class="p-0 m-0">
				<inputaspect :aspect="aspect" v-on="$listeners" />
			</div>    
        </div>

        <div class="col-sm-12 col-md-6 fate-skills">                       
            <inputskillpyramid :skills="skills" header="Skills" :skillList="skillList" v-on="$listeners" />            
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-6">
            <inputstuntextra item="stunts" :rows="25" :border="true" header="Stunts" v-on="$listeners" />
        </div>
        <div class="col-sm-12 col-md-6">
           <inputstuntextra item="extras" :rows="25" :border="true" header="Extras" v-on="$listeners" />
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-6 fate-stress">
            <!-- physical stress -->
            <div class="form-group">
                <div for="" class="fate-header">Physical Stress <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>
            </div>
            <div class="d-flex d-flex justify-content-between">
				<div v-for="stress in physicalstress" :key="stress.obj">
					<inputstress :stress="stress" stresstype="Physical" v-on="$listeners" />
				</div>
			</div>

            <!-- mental stress -->
            <div class="form-group">
                <div for="" class="fate-header">Mental Stress <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>
            </div>
            <div class="d-flex justify-content-between">
				<div v-for="stress in mentalstress" :key="stress.obj">
					<inputstress :stress="stress" stresstype="Mental" v-on="$listeners"  />
				</div>
			</div>
        </div>
        <div class="col-md-6 col-sm-12 fate-consequences">
            <div class="form-group">
                <div class="fate-header col-12">Consequences <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>
            </div>
            <div v-for="consequence in consequences" :key="consequence.obj">
                <inputconsequence :consequence="consequence" v-on="$listeners" />
            </div>
        </div>

    </div>
</div>
</template>

<script>

import InputSkillPyramid from '../components/input-skill-pyramid'
import InputAspect from '../components/input-aspect'
import InputConsequence from '../components/input-consequence'
import InputStress from '../components/input-stress'
import InputStuntExtra from '../components/input-stuntextra'
import InputFatePoints from '../components/input-fatepoints'
import { mapGetters } from 'vuex'

export default {
  name: 'SheetFateCore',
  components: {	   
	"inputaspect": InputAspect,
	"inputconsequence": InputConsequence,
	"inputstress": InputStress,
    "inputstuntextra": InputStuntExtra,
    "inputfatepoints": InputFatePoints,
    "inputskillpyramid": InputSkillPyramid,
  },
  props: {
    character: Object,
  }, 
  mounted() {
    this.$store.commit("updatePageTitle", "Fate Core (Character Sheet)");    
  },
  computed: {
 	...mapGetters([  
      'vttEnabled',
    ])
  },
  data () {
    return {
        skillList: 
            ['', 'Athletics', 'Burglary', 'Contacts', 'Crafts', 'Deceive', 'Drive', 'Empathy'
                , 'Fight', 'Investigate', 'Lore', 'Notice', 'Physique', 'Provoke', 'Rapport'
                , 'Resources', 'Shoot', 'Stealth', 'Will'],
        
        skills: [
            {label: "Superb", value:"+5", obj:"skills.superb",  items:["s1", "s2", "s3", "s4", "s5"] },
            {label: "Great", value:"+4", obj:"skills.great",  items:["s1", "s2", "s3", "s4", "s5"] },
            {label: "Good", value:"+3", obj:"skills.good",  items:["s1", "s2", "s3", "s4", "s5"] },
            {label: "Fair", value:"+2", obj:"skills.fair",  items:["s1", "s2", "s3", "s4", "s5"] },
            {label: "Average", value:"+1", obj:"skills.average",  items:["s1", "s2", "s3", "s4", "s5"] }			
        ],
        aspects: [
			{label:"High Concept", obj:"aspects.highconcept"},
			{label:"Trouble", obj:"aspects.trouble"},
			{label:"Aspect", obj:"aspects.other1"},
			{label:"Aspect", obj:"aspects.other2"},
			{label:"Aspect", obj:"aspects.other3"},
		],
		consequences: [
			{label:"Mild", obj:"consequences.mild", value: "2"},
			{label:"Moderate", obj:"consequences.moderate", value: "4"},
            {label:"Severe", obj:"consequences.severe", value: "6"},
            {label:"Mild", obj:"consequences.mild2", value: "2", requirement: {obj:"physique|will", val:"5" }},
		],
		physicalstress: [
			{label:"1", obj:"stress1"},
			{label:"2", obj:"stress2"},
            {label:"3", obj:"stress3", requirement: {obj:"physique", val:"1" }},
            {label:"4", obj:"stress4", requirement: {obj:"physique", val:"3" }},						
        ],
        mentalstress: [
			{label:"1", obj:"mental1"},
			{label:"2", obj:"mental2"},
            {label:"3", obj:"mental3", requirement: {obj:"will", val:"1" }},
            {label:"4", obj:"mental4", requirement: {obj:"will", val:"3" }},						
		],        
    }
  },
  methods: {  
    getVal(graphPath, defaultValue) {
        let val = this.$parent.getVal(this.character, graphPath, defaultValue);
        return val;
    },
    setVal(arr, val) {        
        this.$parent.setVal(this.character, arr, val);        
    },
    sendToVTT(type, label, obj, item, skillType) {        
		this.$parent.parseVTTMessage(type, label, obj, item, skillType);
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
                    let curVal = haystack[key];
                    if(typeof curVal === "string" && curVal.toLowerCase() === value) {
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
  }
}
</script>

<style lang="scss" scoped>
    @import url('https://fonts.googleapis.com/css?family=Archivo+Black');

    .fate-logo {
        margin-top: -27px;
        max-height: 130px;
    }

    /deep/ .fate-header {
        font-family: 'Archivo Black', sans-serif;
        text-transform: uppercase;
        background-color: #000;
        color: white;
        font-weight: 700;
        padding: 3px;
        margin-top: 5px;
        font-size: 22px;
    }

    /deep/ .col-form-label {
        font-family: 'Archivo Black', sans-serif;
        text-transform: uppercase;
        font-size: 22px;
        font-weight: 700;
    }

    /deep/ .fate-skills .col-form-label {
        font-family: 'Archivo Black', sans-serif;
        font-size: 10px;
        font-weight: 600;
        color: gray;
    }

    .fate-aspects .form-group {
        margin-bottom: 12px;
        margin-top: 0px;
    }

    .fate-consequences .form-group {
        margin-bottom: 0px;
        margin-top: 1px;
    }

    /deep/ input[type=checkbox] {
        height: 50px;
        width: 50px;
    }

    /deep/ .fate-consequences label {
        font-family: 'Archivo Black', sans-serif;
        text-transform: uppercase;
        font-weight: 700;
        font-size: 28px;
        padding-top: 0px;
        padding-bottom: 0px;        
    }

    /deep/ .fate-stress label {
        font-family: 'Archivo Black', sans-serif;
        text-transform: uppercase;
        font-size: 30px;
        font-weight: 700;
        margin-left: -5px;
        margin-right: -5px;
    }

    select {
        font-size: 0.85em !important;
    }
</style>
