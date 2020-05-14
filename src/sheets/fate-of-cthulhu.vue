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
            <div class="px-3">
                <div class="form-group mb-0">
                    <div class="row">
                        <div class="col-8 col-md-10">
                            <label>High Concept</label>
                            <input type="text" class="form-control" id="aspect[highconcept]" name="aspect[highconcept]" @change="setVal('aspects.highconcept',  $event.target.value)" :value="getVal('aspects.highconcept')" placeholder="High Concept" />
                        </div>
                        <div class="col-4 col-md-2 text-center">
                            <label>Corrupted?</label>
                            <div class="text-center">
                                <input type="checkbox" class="form-control corrupted-checkbox" value="1" id="aspect_corrupted[highconcept]" name="aspect_corrupted[highconcept]" @change="setVal('aspect_corrupted.highconcept',  $event.target.checked)" :checked="getVal('aspect_corrupted.highconcept')"  />
                                <div></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="row">
                        <div class="col-8 col-md-10">
                            <label>Trouble</label>
                            <input type="text" class="form-control" id="aspect[trouble]" name="aspect[trouble]"  @change="setVal('aspects.trouble',  $event.target.value)" :value="getVal('aspects.trouble')" placeholder="Trouble" />
                        </div>
                        <div class="col-4 col-md-2 text-center pt-4">
                            <div class="text-center">
                                <input type="checkbox" class="form-control corrupted-checkbox" value="1" id="aspect_corrupted[trouble]"  name="aspect_corrupted[trouble]" @change="setVal('aspect_corrupted.trouble',  $event.target.checked)" :checked="getVal('aspect_corrupted.trouble')" />
                                <div></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="row">
                        <div class="col-8 col-md-10">
                            <label>Relationship</label>
                            <input type="text" class="form-control" id="aspect[relationship]" name="aspect[relationship]"  @change="setVal('aspects.relationship',  $event.target.value)" :value="getVal('aspects.relationship')" placeholder="Relationship" />
                        </div>
                        <div class="col-4 col-md-2 text-center pt-4">
                            <div class="text-center">
                                <input type="checkbox" class="form-control corrupted-checkbox" value="1" id="aspect_corrupted[relationship]" name="aspect_corrupted[relationship]" @change="setVal('aspect_corrupted.relationship',  $event.target.checked)" :checked="getVal('aspect_corrupted.relationship')"  />
                                <div></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="row">
                        <div class="col-8 col-md-10">
                            <label>Other Aspect</label>
                            <input type="text" class="form-control" id="aspect[other1]" name="aspect[other1]"  @change="setVal('aspects.other1',  $event.target.value)" :value="getVal('aspects.other1')" placeholder="Other Aspect" />
                        </div>
                        <div class="col-4 col-md-2 text-center pt-4">
                            <div class="text-center">
                                <input type="checkbox" class="form-control corrupted-checkbox" value="1" id="aspect_corrupted[other1]"  name="aspect_corrupted[other1]" @change="setVal('aspect_corrupted.other1',  $event.target.checked)" :checked="getVal('aspect_corrupted.other1')"  />
                                <div></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="row">
                        <div class="col-8 col-md-10">
                            <label>Other Aspect</label>
                            <input type="text" class="form-control" id="aspect[other2]" name="aspect[other2]"  @change="setVal('aspects.other2',  $event.target.value)" :value="getVal('aspects.other2')" placeholder="Other Aspect" />
                        </div>
                        <div class="col-4 col-md-2 text-center pt-4">
                            <div class="text-center">
                                <input type="checkbox" class="form-control corrupted-checkbox" value="1" id="aspect_corrupted[other2]" name="aspect_corrupted[other2]" @change="setVal('aspect_corrupted.other2',  $event.target.checked)" :checked="getVal('aspect_corrupted.other2')" />
                                <div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div for="" class="fate-header">Regular Stunts</div>

            <div class="px-3">
                <div class="form-group mb-0 pb-4">
                    <div class="small text-muted font-italic">Start with two stunts for free. You may buy additional stunts for 1 Refresh each, so long as your Refresh remains at or above 1.</div>
                    <textarea class="form-control" id="stunts" name="stunts" rows="14" @change="setVal('stunts',  $event.target.value)" :value="getVal('stunts')" placeholder="Regular Stunts"></textarea>
                </div>

            </div>
            
            <div for="" class="fate-header">Corrupted Stunts</div>      
            <div class="px-3">
                <div class="form-group mb-0">
                    <div class="small text-muted font-italic">Whenever one of your aspects becomes corrupted, you also gain a corruption stunt at the next minor milestone.</div>
                    <textarea class="form-control" id="stunts_corrupted" name="stunts_corrupted" rows="14" @change="setVal('stunts_corrupted',  $event.target.value)" :value="getVal('stunts_corrupted')" placeholder="Corrupted Stunts"></textarea>
                </div>
            </div>
        </div>

        <!-- Vitals and Skills -->

        <div class="col-sm-6 col-md-4 fate-skills px-0">
            <div class="fate-header col-12">Vitals</div>

            <div class="px-3">
                <!-- Stress -->
                <div class="form-group text-center font-weight-bold d-flex flex-row">
                    <div class="col-6">REFRESH</div>
                    <div class="col-6">CORRUPTION</div>
                </div>

                <div class="form-group text-center font-weight-bold d-flex flex-row">
                    <div class="form-group mx-4">
                        <input type="text" class="form-control text-center" id="refresh" name="refresh" @change="setVal('refresh',  $event.target.value)" :value="getVal('refresh')" placeholder="Refresh" />
                    </div>
                    <div class="form-group">
                        <input type="checkbox" class="form-control-sm" value="1" id="corruption[corruption1]" name="corruption[corruption1]" @change="setVal('corruption.corruption1',  $event.target.checked)" :checked="getVal('corruption.corruption1')" />
                        <input type="checkbox" class="form-control-sm" value="1" id="corruption[corruption2]" name="corruption[corruption2]" @change="setVal('corruption.corruption2',  $event.target.checked)" :checked="getVal('corruption.corruption2')" />
                        <input type="checkbox" class="form-control-sm" value="1" id="corruption[corruption3]" name="corruption[corruption3]" @change="setVal('corruption.corruption3',  $event.target.checked)" :checked="getVal('corruption.corruption3')" />
                        <input type="checkbox" class="form-control-sm" value="1" id="corruption[corruption4]" name="corruption[corruption4]" @change="setVal('corruption.corruption4',  $event.target.checked)" :checked="getVal('corruption.corruption4')" />
                    </div>
                </div>

                <!-- Stress -->
                <div class="form-group text-center font-weight-bold">
                    <div class="col-12">STRESS</div>
                </div>

                <!-- physical stress -->
                <div class="d-flex flex-row">
                    <div class="form-group font-weight-bold  pr-2 pt-2">
                        PHYSICAL
                    </div>
                    <input type="checkbox" value="1" id="stress[stress1]" name="stress[stress1]" @change="setVal('stress.stress1',  $event.target.checked)" :checked="getVal('stress.stress1')" />
                    <input type="checkbox" value="1" id="stress[stress2]" name="stress[stress2]" @change="setVal('stress.stress2',  $event.target.checked)" :checked="getVal('stress.stress2')" />
                    <input type="checkbox" value="1" id="stress[stress3]" name="stress[stress3]" @change="setVal('stress.stress3',  $event.target.checked)" :checked="getVal('stress.stress3')" />
                    <input type="checkbox" value="1" id="stress[stress4]" name="stress[stress4]" @change="setVal('stress.stress4',  $event.target.checked)" :checked="getVal('stress.stress4')" :disabled="!skillHasValue('physique', 1)" />
                    <input type="checkbox" value="1" id="stress[stress5]" name="stress[stress5]" @change="setVal('stress.stress5',  $event.target.checked)" :checked="getVal('stress.stress5')" :disabled="!skillHasValue('physique', 3)" />
                    <input type="checkbox" value="1" id="stress[stress6]" name="stress[stress6]" @change="setVal('stress.stress6',  $event.target.checked)" :checked="getVal('stress.stress6')" :disabled="!skillHasValue('physique', 3)" />
                </div>

                <!-- mental stress -->
                <div class="d-flex flex-row">
                    <div class="form-group font-weight-bold pr-3 pt-2">
                        MENTAL
                    </div>
                    <input type="checkbox" value="1" id="stress[mental1]" name="stress[mental1]" @change="setVal('stress.mental1',  $event.target.checked)" :checked="getVal('stress.mental1')" />
                    <input type="checkbox" value="1" id="stress[mental2]" name="stress[mental2]" @change="setVal('stress.mental2',  $event.target.checked)" :checked="getVal('stress.mental2')" />
                    <input type="checkbox" value="1" id="stress[mental3]" name="stress[mental3]" @change="setVal('stress.mental3',  $event.target.checked)" :checked="getVal('stress.mental3')" />
                    <input type="checkbox" value="1" id="stress[mental4]" name="stress[mental4]" @change="setVal('stress.mental4',  $event.target.checked)" :checked="getVal('stress.mental4')" :disabled="!skillHasValue('will', 1)" />
                    <input type="checkbox" value="1" id="stress[mental5]" name="stress[mental5]" @change="setVal('stress.mental5',  $event.target.checked)" :checked="getVal('stress.mental5')" :disabled="!skillHasValue('will', 3)" />
                    <input type="checkbox" value="1" id="stress[mental6]" name="stress[mental6]" @change="setVal('stress.mental6',  $event.target.checked)" :checked="getVal('stress.mental6')" :disabled="!skillHasValue('will', 3)" />
                </div>

                <!-- consequences -->
                <div class="form-group text-center font-weight-bold">
                    <div class="col-12">CONSEQUENCES</div>
                </div>

                <div class="form-group row">
                    <label class="col-2 col-form-label">2</label>
                    <div class="col-10">
                        <input class="form-control" type="text" id="consequence[mild]" name="consequence[mild]" @change="setVal('consequences.mild',  $event.target.value)" :value="getVal('consequences.mild')" placeholder="Mild">
                    </div>
                </div>

                <div class="form-group row">
                    <label class="col-2 col-form-label">4</label>
                    <div class="col-10">
                        <input class="form-control" type="text" id="consequence[moderate]" name="consequence[moderate]" @change="setVal('consequences.moderate',  $event.target.value)" :value="getVal('consequences.moderate')" placeholder="Moderate">
                    </div>
                </div>

                <div class="form-group row">
                    <label class="col-2 col-form-label">6</label>
                    <div class="col-10">
                        <input class="form-control" type="text" id="consequence[severe]" name="consequence[severe]" @change="setVal('consequences.severe',  $event.target.value)" :value="getVal('consequences.severe')" placeholder="Severe">
                    </div>
                </div>

                <div class="form-group row">
                    <label class="col-2 col-form-label stat-requirement">2</label>
                    <div class="col-10">
                        <input class="form-control" type="text" id="consequence[mild2]" name="consequence[mild2]" @change="setVal('consequences.mild2',  $event.target.value)" :value="getVal('consequences.mild2')" placeholder="Mild" :disabled="!skillHasValue('physique|will', 5)" />
                    </div>
                </div>
            </div>

            <!-- Skills -->
            <div class="fate-header col-12">Skills</div>

            <div class="px-3">
                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[academics]" name="skill[academics]" @change="setVal('skills.academics',  $event.target.value)" :value="getVal('skills.academics')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Academics</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[athletics]" name="skill[athletics]" @change="setVal('skills.athletics',  $event.target.value)" :value="getVal('skills.athletics')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Athletics</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[burglary]" name="skill[burglary]" @change="setVal('skills.burglary',  $event.target.value)" :value="getVal('skills.burglary')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Burglary</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[contacts]" name="skill[contacts]" @change="setVal('skills.contacts',  $event.target.value)" :value="getVal('skills.contacts')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Contacts</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[crafts]" name="skill[crafts]" @change="setVal('skills.crafts',  $event.target.value)" :value="getVal('skills.crafts')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Crafts</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[deceive]" name="skill[deceive]" @change="setVal('skills.deceive',  $event.target.value)" :value="getVal('skills.deceive')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Deceive</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[drive]" name="skill[drive]" @change="setVal('skills.drive',  $event.target.value)" :value="getVal('skills.drive')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Drive</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[empathy]" name="skill[empathy]" @change="setVal('skills.empathy',  $event.target.value)" :value="getVal('skills.empathy')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Empathy</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[fight]" name="skill[fight]" @change="setVal('skills.fight',  $event.target.value)" :value="getVal('skills.fight')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Fight</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[investigate]" name="skill[investigate]" @change="setVal('skills.investigate',  $event.target.value)" :value="getVal('skills.investigate')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Investigate</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[lore]" name="skill[lore]" @change="setVal('skills.lore',  $event.target.value)" :value="getVal('skills.lore')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Lore</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[notice]" name="skill[notice]" @change="setVal('skills.notice',  $event.target.value)" :value="getVal('skills.notice')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Notice</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[physique]" name="skill[physique]" @change="setVal('skills.physique',  $event.target.value)" :value="getVal('skills.physique')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Physique</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[provoke]" name="skill[provoke]" @change="setVal('skills.provoke',  $event.target.value)" :value="getVal('skills.provoke')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Provoke</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[rapport]" name="skill[rapport]" @change="setVal('skills.rapport',  $event.target.value)" :value="getVal('skills.rapport')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Rapport</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[resources]" name="skill[resources]" @change="setVal('skills.resources',  $event.target.value)" :value="getVal('skills.resources')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Resources</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[shoot]" name="skill[shoot]" @change="setVal('skills.shoot',  $event.target.value)" :value="getVal('skills.shoot')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Shoot</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[stealth]" name="skill[stealth]" @change="setVal('skills.stealth',  $event.target.value)" :value="getVal('skills.stealth')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Stealth</label>
                </div>

                <div class="form-group row">
                    <div class="col-3">
                        <input class="form-control text-center" type="text" id="skill[will]" name="skill[will]" @change="setVal('skills.will',  $event.target.value)" :value="getVal('skills.will')" placeholder="+" />
                    </div>
                    <label class="col-9 col-form-label">Will</label>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
  name: 'SheetFateOfCthulhu',
  props: {    
    character: Object,
  },
  mounted() {
   this.$parent.$parent.title = 'Fate of Cthulhu (Character Sheet)';
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
        max-height: 130px;
    }

    .fate-header {
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


    .col-form-label {
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

    input[type=checkbox] {
        height: 50px;
        width: 50px;
    }

    .fate-conditions label {
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

    /* HIDE CHECKBOX */
    .corrupted-checkbox {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        cursor: pointer;
    }

    /* IMAGE STYLES */
    .corrupted-checkbox + div {
        min-width: 50px;
        min-height: 50px;
        background-repeat: no-repeat;
        background-position: center center;
        cursor: pointer;
        background-image: url('/static/sheets/fate-of-cthulhu/corrupted-checkbox.png');
    }

    /* CHECKED STYLES */
    .corrupted-checkbox:checked + div {
        background-image: url('/static/sheets/fate-of-cthulhu/corrupted-checkbox-checked.png');
    }

    textarea {
        border: 0 !important;
    }
</style>
