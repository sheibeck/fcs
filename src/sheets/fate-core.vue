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
						FP <span v-if="roll20Enabled" class='dice fo20 font-weight-normal small'>A</span>
					</div>                    
                    <inputfatepoints />
                </div>
            </div>
        </div>

        <div class="col-sm-6 col-md-8 order-md-1">
            <div class="form-group">
                <div for="name" class="fate-header">ID</div>
                <input type="text" class="form-control" id="name" name="name" @change="setVal('name',  $event.target.value)" :value="getVal('name')" placeholder="Name" />
            </div>

            <div class="form-group">
                <textarea class="form-control" id="description" name="description" rows="3" @change="setVal('description',  $event.target.value)" :value="getVal('description')" placeholder="Description"></textarea>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- aspects -->
        <div class="col-sm-12 col-md-4 fate-aspects">
            <div class="form-group">
                <div for="" class="fate-header">Aspects</div>
            </div>
            
            <div v-for="aspect in aspects" :key="aspect.obj" class="p-0 m-0">
				<inputaspect :aspect="aspect" />
			</div>    
        </div>

        <div class="col-sm-12 col-md-8 fate-skills">
            <div class="form-group mt-0">
                <div class="fate-header">Skills</div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label ">Superb (+5)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[superb][s1]" name="skill[superb][s1]" @change="setVal('skills.superb.s1', $event.target.value)" :value="getVal('skills.superb.s1')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>                    
                    </select>                   
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[superb][s2]" name="skill[superb][s2]" @change="setVal('skills.superb.s2', $event.target.value)" :value="getVal('skills.superb.s2')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[superb][s3]" name="skill[superb][s3]" @change="setVal('skills.superb.s3', $event.target.value)" :value="getVal('skills.superb.s3')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                                        </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[superb][s4]" name="skill[superb][s4]" @change="setVal('skills.superb.s4', $event.target.value)" :value="getVal('skills.superb.s4')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[superb][s5]" name="skill[superb][s5]" @change="setVal('skills.superb.s5', $event.target.value)" :value="getVal('skills.superb.s5')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Great (+4)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[great][s1]" name="skill[great][s1]" @change="setVal('skills.great.s1', $event.target.value)" :value="getVal('skills.great.s1')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[great][s2]" name="skill[great][s2]" @change="setVal('skills.great.s2', $event.target.value)" :value="getVal('skills.great.s2')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[great][s3]" name="skill[great][s3]" @change="setVal('skills.great.s3', $event.target.value)" :value="getVal('skills.great.s3')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[great][s4]" name="skill[great][s4]" @change="setVal('skills.great.s4', $event.target.value)" :value="getVal('skills.great.s4')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[great][s5]" name="skill[great][s5]" @change="setVal('skills.great.s5', $event.target.value)" :value="getVal('skills.great.s5')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Good (+3)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[good][s1]" name="skill[good][s1]" @change="setVal('skills.good.s1', $event.target.value)" :value="getVal('skills.good.s1')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[good][s2]" name="skill[good][s2]" @change="setVal('skills.good.s2', $event.target.value)" :value="getVal('skills.good.s2')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[good][s3]" name="skill[good][s3]" @change="setVal('skills.good.s3', $event.target.value)" :value="getVal('skills.good.s3')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[good][s4]" name="skill[good][s4]" @change="setVal('skills.good.s4', $event.target.value)" :value="getVal('skills.good.s4')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[good][s5]" name="skill[good][s5]" @change="setVal('skills.good.s5', $event.target.value)" :value="getVal('skills.good.s5')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Fair (+2)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[fair][s1]" name="skill[fair][s1]" @change="setVal('skills.fair.s1', $event.target.value)" :value="getVal('skills.fair.s1')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[fair][s2]" name="skill[fair][s2]" @change="setVal('skills.fair.s2', $event.target.value)" :value="getVal('skills.fair.s2')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[fair][s3]" name="skill[fair][s3]" @change="setVal('skills.fair.s3', $event.target.value)" :value="getVal('skills.fair.s3')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[fair][s4]" name="skill[fair][s4]" @change="setVal('skills.fair.s4', $event.target.value)" :value="getVal('skills.fair.s4')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[fair][s5]" name="skill[fair][s5]" @change="setVal('skills.fair.s5', $event.target.value)" :value="getVal('skills.fair.s5')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Average (+1)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[average][s1]" name="skill[average][s1]" @change="setVal('skills.average.s1', $event.target.value)" :value="getVal('skills.average.s1')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[average][s2]" name="skill[average][s2]" @change="setVal('skills.average.s2', $event.target.value)" :value="getVal('skills.average.s2')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[average][s3]" name="skill[average][s3]" @change="setVal('skills.average.s3', $event.target.value)" :value="getVal('skills.average.s3')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[average][s4]" name="skill[average][s4]" @change="setVal('skills.average.s4', $event.target.value)" :value="getVal('skills.average.s4')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[average][s5]" name="skill[average][s5]" @change="setVal('skills.average.s5', $event.target.value)" :value="getVal('skills.average.s5')" placeholder="">
                        <option v-for="skill in skills" :value="skill">{{skill}}</option>
                    </select>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-6">
            <inputstuntextra :item="stunts" :rows="25" :border="true" header="Stunts" />
        </div>
        <div class="col-sm-12 col-md-6">
           <inputstuntextra :item="extras" :rows="25" :border="true" header="Extras" />
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-6 fate-stress">
            <!-- physical stress -->
            <div class="form-group">
                <div for="" class="fate-header">Physical Stress</div>
            </div>
            <div class="d-flex d-flex justify-content-between">
				<div v-for="stress in physicalstress" :key="stress.obj">
					<inputstress :stress="stress" stresstype="Physical" />
				</div>
			</div>

            <!-- mental stress -->
            <div class="form-group">
                <div for="" class="fate-header">Mental Stress</div>
            </div>
            <div class="d-flex justify-content-between">
				<div v-for="stress in mentalstress" :key="stress.obj">
					<inputstress :stress="stress" stresstype="Mental" />
				</div>
			</div>
        </div>
        <div class="col-md-6 col-sm-12 fate-consequences">
            <div class="form-group">
                <div class="fate-header col-12">Consequences</div>
            </div>

            <div v-for="consequence in consequences" :key="consequence.obj">
                <inputconsequence :consequence="consequence" />
            </div>
        </div>

    </div>
</div>
</template>

<script>

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
  },
  props: {
    character: Object,
  }, 
  mounted() {      
      this.$parent.$parent.title = 'Fate Core (Character Sheet)';
  },
  computed: {
 	...mapGetters([  
      'roll20Enabled'
    ]),
  },
  data () {
    return {
        skills: 
            ['', 'Athletics', 'Burglary', 'Contacts', 'Crafts', 'Deceive', 'Drive', 'Empathy'
                , 'Fight', 'Investigate', 'Lore', 'Notice', 'Physique', 'Provoke', 'Rapport'
                , 'Resources', 'Shoot', 'Stealth', 'Will'],

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
        stunts: "stunts",
        extras: "extras"    
    }
  },
  methods: {  
    getVal(graphPath, defaultValue) {
        return this.$parent.getVal(this.character, graphPath, defaultValue);
    },
    setVal(arr, val) {        
        this.$parent.setVal(this.character, arr, val);        
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

    .sheet {
        margin: 20px;
        margin-top: 40px;
        max-width: 1024px;
    }

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

    .fate-skills .form-group {
        margin-bottom: 12px;
        margin-top: 12px;
    }

    .fate-skills .col-form-label {
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

    .stat-requirement {
        color: #ccc
    }

    select {
        font-size: 0.85em !important;
    }
</style>
