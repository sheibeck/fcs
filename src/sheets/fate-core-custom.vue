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
                    <input type="text" class="form-control text-center" id="refresh" name="refresh" @change="setVal('refresh',  $event.target.value)" :value="getVal('refresh')" placeholder="Refresh" />
                </div>
                <div class="col-6 text-center ">
                    <div for="fatepoints" class="fate-header">FP</div>
                    <input type="text" class="form-control text-center" id="fatepoints" name="fatepoints" @change="setVal('fatepoints',  $event.target.value)" :value="getVal('fatepoints')" placeholder="Fate Points" />
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
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[highconcept]" name="aspect[highconcept]" @change="setVal('aspects.highconcept', $event.target.value)" :value="getVal('aspects.highconcept')" placeholder="High Concept" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[trouble]" name="aspect[trouble]" @change="setVal('aspects.trouble', $event.target.value)" :value="getVal('aspects.trouble')" placeholder="Trouble" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[other1]" name="aspect[other1]" @change="setVal('aspects.other1', $event.target.value)" :value="getVal('aspects.other1')" placeholder="Aspect" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[other2]" name="aspect[other2]" @change="setVal('aspects.other2', $event.target.value)" :value="getVal('aspects.other2')" placeholder="Aspect" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[other3]" name="aspect[other3]" @change="setVal('aspects.other3', $event.target.value)" :value="getVal('aspects.other3')" placeholder="Aspect" />
            </div>
        </div>

        <div class="col-sm-12 col-md-8 fate-skills">
            <div class="form-group mt-0">
                <div class="fate-header">Skills</div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label ">Superb (+5)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[superb][s1]" name="skill[superb][s1]" @change="setVal('skills.superb.s1', $event.target.value)" :value="getVal('skills.superb.s1')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[superb][s2]" name="skill[superb][s2]" @change="setVal('skills.superb.s2', $event.target.value)" :value="getVal('skills.superb.s2')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[superb][s3]" name="skill[superb][s3]" @change="setVal('skills.superb.s3', $event.target.value)" :value="getVal('skills.superb.s3')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[superb][s4]" name="skill[superb][s4]" @change="setVal('skills.superb.s4', $event.target.value)" :value="getVal('skills.superb.s4')" placeholder="" />

                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[superb][s5]" name="skill[superb][s5]" @change="setVal('skills.superb.s5', $event.target.value)" :value="getVal('skills.superb.s5')" placeholder="" />
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Great (+4)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[great][s1]" name="skill[great][s1]" @change="setVal('skills.great.s1', $event.target.value)" :value="getVal('skills.great.s1')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[great][s2]" name="skill[great][s2]" @change="setVal('skills.great.s2', $event.target.value)" :value="getVal('skills.great.s2')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[great][s3]" name="skill[great][s3]" @change="setVal('skills.great.s3', $event.target.value)" :value="getVal('skills.great.s3')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[great][s4]" name="skill[great][s4]" @change="setVal('skills.great.s4', $event.target.value)" :value="getVal('skills.great.s4')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[great][s5]" name="skill[great][s5]" @change="setVal('skills.great.s5', $event.target.value)" :value="getVal('skills.great.s5')" placeholder="" />
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Good (+3)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[good][s1]" name="skill[good][s1]" @change="setVal('skills.good.s1', $event.target.value)" :value="getVal('skills.good.s1')" placeholder="" />                        
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[good][s2]" name="skill[good][s2]" @change="setVal('skills.good.s2', $event.target.value)" :value="getVal('skills.good.s2')" placeholder="" />                        
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[good][s3]" name="skill[good][s3]" @change="setVal('skills.good.s3', $event.target.value)" :value="getVal('skills.good.s3')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[good][s4]" name="skill[good][s4]" @change="setVal('skills.good.s4', $event.target.value)" :value="getVal('skills.good.s4')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[good][s5]" name="skill[good][s5]" @change="setVal('skills.good.s5', $event.target.value)" :value="getVal('skills.good.s5')" placeholder="" />
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Fair (+2)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[fair][s1]" name="skill[fair][s1]" @change="setVal('skills.fair.s1', $event.target.value)" :value="getVal('skills.fair.s1')" placeholder="" />     
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[fair][s2]" name="skill[fair][s2]" @change="setVal('skills.fair.s2', $event.target.value)" :value="getVal('skills.fair.s2')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[fair][s3]" name="skill[fair][s3]" @change="setVal('skills.fair.s3', $event.target.value)" :value="getVal('skills.fair.s3')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[fair][s4]" name="skill[fair][s4]" @change="setVal('skills.fair.s4', $event.target.value)" :value="getVal('skills.fair.s4')" placeholder="" />                        
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[fair][s5]" name="skill[fair][s5]" @change="setVal('skills.fair.s5', $event.target.value)" :value="getVal('skills.fair.s5')" placeholder="" />
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Average (+1)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[average][s1]" name="skill[average][s1]" @change="setVal('skills.average.s1', $event.target.value)" :value="getVal('skills.average.s1')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[average][s2]" name="skill[average][s2]" @change="setVal('skills.average.s2', $event.target.value)" :value="getVal('skills.average.s2')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[average][s3]" name="skill[average][s3]" @change="setVal('skills.average.s3', $event.target.value)" :value="getVal('skills.average.s3')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[average][s4]" name="skill[average][s4]" @change="setVal('skills.average.s4', $event.target.value)" :value="getVal('skills.average.s4')" placeholder="" />
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <input class="form-control" id="skill[average][s5]" name="skill[average][s5]" @change="setVal('skills.average.s5', $event.target.value)" :value="getVal('skills.average.s5')" placeholder="" />                      
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-6">
            <div class="form-group">
                <div for="stunts" class="fate-header">Stunts</div>
                <textarea class="form-control" id="stunts" name="stunts" rows="25" placeholder="Stunts" @change="setVal('stunts', $event.target.value)" :value="getVal('stunts')"></textarea>
            </div>
        </div>
        <div class="col-sm-12 col-md-6">
            <div class="form-group">
                <div for="stunts" class="fate-header">Extras</div>
                <textarea class="form-control" id="extras" name="extras" rows="25" placeholder="Extras" @change="setVal('extras', $event.target.value)" :value="getVal('extras')"></textarea>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-6 fate-stress">
            <!-- physical stress -->
            <div class="form-group">
                <div for="" class="fate-header">Physical Stress</div>
            </div>
            <div class="row">
                <div class="col">
                    <label for="stress">
                        1
                    </label>
                    <input type="checkbox" value="1" id="stress[stress1]" name="stress[stress1]" @change="setVal('stress.stress1', $event.target.checked)" :checked="getVal('stress.stress1', false)" />
                </div>

                <div class="col">
                    <label for="stress">
                        2
                    </label>
                    <input type="checkbox" value="2" id="stress[stress2]" name="stress[stress2]" @change="setVal('stress.stress2', $event.target.checked)" :checked="getVal('stress.stress2', false)" />
                </div>

                <div class="col">
                    <label class="stat-requirement" for="stress">
                        3
                    </label>
                    <input type="checkbox" value="3" id="stress[stress3]" name="stress[stress3]" @change="setVal('stress.stress3', $event.target.checked)" :checked="getVal('stress.stress3', false)" />
                    <span class="figure-caption small">Average+</span>
                </div>

                <div class="col">
                    <label class="stat-requirement" for="stress">
                        4
                    </label>
                    <input type="checkbox" value="3" id="stress[stress4]" name="stress[stress4]" @change="setVal('stress.stress4', $event.target.checked)" :checked="getVal('stress.stress4', false)" />
                    <span class="figure-caption small">Superb+</span>
                </div>
            </div>

            <!-- mental stress -->
            <div class="form-group">
                <div for="" class="fate-header">Mental Stress</div>
            </div>
            <div class="row">
                <div class="col">
                    <label for="stress">
                        1
                    </label>
                    <input type="checkbox" value="1" id="stress[mental1]" name="stress[mental1]" @change="setVal('stress.mental1', $event.target.checked)" :checked="getVal('stress.mental1', false)" />
                </div>

                <div class="col">
                    <label for="stress">
                        2
                    </label>
                    <input type="checkbox" value="2" id="stress[mental2]" name="stress[mental2]" @change="setVal('stress.mental2', $event.target.checked)" :checked="getVal('stress.mental2', false)" />
                </div>

                <div class="col">
                    <label class="stat-requirement" for="stress">
                        3
                    </label>
                    <input type="checkbox" value="3" id="stress[mental3]" name="stress[mental3]" @change="setVal('stress.mental3', $event.target.checked)" :checked="getVal('stress.mental3', false)" />
                    <span class="figure-caption small">Average+</span>
                </div>

                <div class="col">
                    <label class="stat-requirement" for="stress">
                        4
                    </label>
                    <input type="checkbox" value="3" id="stress[mental4]" name="stress[mental4]"  @change="setVal('stress.mental4', $event.target.checked)" :checked="getVal('stress.mental4', false)" />
                    <span class="figure-caption small">Superb+</span>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-sm-12 fate-consequences">
            <div class="form-group">
                <div class="fate-header col-12">Consequences</div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label">2</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[mild]" name="consequence[mild]" placeholder="Mild" @change="setVal('consequences.mild', $event.target.value)" :value="getVal('consequences.mild')" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label">4</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[moderate]" name="consequence[moderate]" placeholder="Moderate" @change="setVal('consequences.moderate', $event.target.value)" :value="getVal('consequences.moderate')" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label">6</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[severe]" name="consequence[severe]" placeholder="Severe" @change="setVal('consequences.severe', $event.target.value)" :value="getVal('consequences.severe')" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label stat-requirement">2</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[mild2]" name="consequence[mild2]" placeholder="Mild" @change="setVal('consequences.mild2', $event.target.value)" :value="getVal('consequences.mild2')" />
                    <span class="figure-caption small">Superb+</span>
                </div>
            </div>
        </div>

    </div>
</div>
</template>

<script>
export default {
  name: 'SheetFateCoreCustom',
  props: {
    character: Object,
  }, 
  computed: {
   
  },
  data () {
    return {       
    }
  },
  methods: {  
    getVal(graphPath, defaultValue) {
      return this.$parent.getVal(this.character, graphPath, defaultValue);
    },
    setVal(arr, val) {
       this.$parent.setVal(this.character, arr, val);       
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

    .fate-header {
        font-family: 'Archivo Black', sans-serif;
        text-transform: uppercase;
        background-color: #000;
        color: white;
        font-weight: 700;
        padding: 3px;
        margin-top: 5px;
        font-size: 22px;
    }

    .col-form-label {
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

    input[type=checkbox] {
        height: 50px;
        width: 50px;
    }

    .fate-consequences label {
        font-family: 'Archivo Black', sans-serif;
        text-transform: uppercase;
        font-weight: 700;
        font-size: 28px;
        padding-top: 0px;
        padding-bottom: 0px;
        padding-left: 25px;
    }

    .fate-stress label {
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
