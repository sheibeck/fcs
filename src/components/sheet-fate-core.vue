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
                    <input type="text" class="form-control text-center" id="refresh" name="refresh" @change="character.refresh = $event.target.value" :value="exists(character, 'refresh')" placeholder="Refresh" />
                </div>
                <div class="col-6 text-center ">
                    <div for="fatepoints" class="fate-header">FP</div>
                    <input type="text" class="form-control text-center" id="fatepoints" name="fatepoints" @change="character.fatepoints = $event.target.value" :value="exists(character, 'fatepoints')" placeholder="Fate Points" />
                </div>
            </div>
        </div>

        <div class="col-sm-6 col-md-8 order-md-1">
            <div class="form-group">
                <div for="name" class="fate-header">ID</div>
                <input type="text" class="form-control" id="name" name="name" @change="character.name = $event.target.value" :value="exists(character, 'name')" placeholder="Name" />
            </div>

            <div class="form-group">
                <textarea class="form-control" id="description" name="description" rows="3" @change="character.description = $event.target.value" :value="exists(character, 'description')" placeholder="Description"></textarea>
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
                <input type="text" class="form-control" id="aspect[highconcept]" name="aspect[highconcept]" @change="set('aspects', 'highconcept', $event.target.value)" :value="exists(character.aspects, 'highconcept')" placeholder="High Concept" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[trouble]" name="aspect[trouble]" @change="set('aspects', 'trouble', $event.target.value)" :value="exists(character.aspects, 'trouble')" placeholder="Trouble" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[other1]" name="aspect[other1]" @change="character.aspects.other1 = $event.target.value" :value="exists(character.aspects, 'other1')" placeholder="Aspect" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[other2]" name="aspect[other2]" @change="character.aspects.other2 = $event.target.value" :value="exists(character.aspects, 'other2')" placeholder="Aspect" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[other3]" name="aspect[other3]" @change="character.aspects.other3 = $event.target.value" :value="exists(character.aspects, 'other3')" placeholder="Aspect" />
            </div>
        </div>

        <div class="col-sm-12 col-md-8 fate-skills">
            <div class="form-group mt-0">
                <div class="fate-header">Skills</div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label ">Superb (+5)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[superb][s1]" name="skill[superb][s1]" @change="set('skills', 'superb', $event.target.value, 's1')" :value="exists(character.skills, 'superb', '', 's1')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[superb][s2]" name="skill[superb][s2]" @change="character.skills.superb.s2 = $event.target.value" :value="exists(character.skills, 'superb', '', 's2')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[superb][s3]" name="skill[superb][s3]" @change="character.skills.superb.s3 = $event.target.value" :value="exists(character.skills, 'superb', '', 's3')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[superb][s4]" name="skill[superb][s4]" @change="character.skills.superb.s4 = $event.target.value" :value="exists(character.skills, 'superb', '', 's4')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[superb][s5]" name="skill[superb][s5]" @change="character.skills.superb.s5 = $event.target.value" :value="exists(character.skills, 'superb', '', 's5')" placeholder=""></select>
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Great (+4)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[great][s1]" name="skill[great][s1]" @change="character.skills.great.s1 = $event.target.value" :value="exists(character.skills, 'great', '', 's1')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[great][s2]" name="skill[great][s2]" @change="character.skills.great.s2 = $event.target.value" :value="exists(character.skills, 'great', '', 's2')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[great][s3]" name="skill[great][s3]" @change="character.skills.great.s3 = $event.target.value" :value="exists(character.skills, 'great', '', 's3')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[great][s4]" name="skill[great][s4]" @change="character.skills.great.s4 = $event.target.value" :value="exists(character.skills, 'great', '', 's4')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[great][s5]" name="skill[great][s5]" @change="character.skills.great.s5 = $event.target.value" :value="exists(character.skills, 'great', '', 's5')" placeholder=""></select>
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Good (+3)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[good][s1]" name="skill[good][s1]" @change="character.skills.good.s1 = $event.target.value" :value="exists(character.skills, 'good', '', 's1')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[good][s2]" name="skill[good][s2]" @change="character.skills.good.s2 = $event.target.value" :value="exists(character.skills, 'good', '', 's2')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[good][s3]" name="skill[good][s3]" @change="character.skills.good.s3 = $event.target.value" :value="exists(character.skills, 'good', '', 's3')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[good][s4]" name="skill[good][s4]" @change="character.skills.good.s4 = $event.target.value" :value="exists(character.skills, 'good', '', 's4')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[good][s5]" name="skill[good][s5]" @change="character.skills.good.s5 = $event.target.value" :value="exists(character.skills, 'good', '', 's5')" placeholder=""></select>
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Fair (+2)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[fair][s1]" name="skill[fair][s1]" @change="character.skills.fair.s1 = $event.target.value" :value="exists(character.skills, 'fair', '', 's1')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[fair][s2]" name="skill[fair][s2]" @change="character.skills.fair.s2 = $event.target.value" :value="exists(character.skills, 'fair', '', 's2')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[fair][s3]" name="skill[fair][s3]" @change="character.skills.fair.s3 = $event.target.value" :value="exists(character.skills, 'fair', '', 's3')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[fair][s4]" name="skill[fair][s4]" @change="character.skills.fair.s4 = $event.target.value" :value="exists(character.skills, 'fair', '', 's4')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[fair][s5]" name="skill[fair][s5]" @change="character.skills.fair.s5 = $event.target.value" :value="exists(character.skills, 'fair', '', 's5')" placeholder=""></select>
                </div>
            </div>

            <div class="form-group row mr-0">
                <label class="col-xs-12 pr-md-0 col-md-2 col-form-label">Average (+1)</label>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[average][s1]" name="skill[average][s1]" @change="character.skills.average.s1 = $event.target.value" :value="exists(character.skills, 'average', '', 's1')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[average][s2]" name="skill[average][s2]" @change="character.skills.average.s2 = $event.target.value" :value="exists(character.skills, 'average', '', 's2')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[average][s3]" name="skill[average][s3]" @change="character.skills.average.s3 = $event.target.value" :value="exists(character.skills, 'average', '', 's3')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[average][s4]" name="skill[average][s4]" @change="character.skills.average.s4 = $event.target.value" :value="exists(character.skills, 'average', '', 's4')" placeholder=""></select>
                </div>
                <div class="col-xs-12 col-md-2 p-md-0">
                    <select class="form-control" id="skill[average][s5]" name="skill[average][s5]" @change="character.skills.average.s5 = $event.target.value" :value="exists(character.skills, 'average', '', 's5')" placeholder=""></select>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-6">
            <div class="form-group">
                <div for="stunts" class="fate-header">Stunts</div>
                <textarea class="form-control" id="stunts" name="stunts" rows="25" placeholder="Stunts" @change="character.stunts = $event.target.value" :value="exists(character, 'stunts')" ></textarea>
            </div>
        </div>
        <div class="col-sm-12 col-md-6">
            <div class="form-group">
                <div for="stunts" class="fate-header">Extras</div>
                <textarea class="form-control" id="extras" name="extras" rows="25" placeholder="Extras" @change="character.extras = $event.target.value" :value="exists(character, 'extras')"></textarea>
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
                    <input type="checkbox" value="1" id="stress[stress1]" name="stress[stress1]" @change="character.stress.stress1 = $event.target.value" :checked="exists(character.stress, 'stress1', false)" />
                </div>

                <div class="col">
                    <label for="stress">
                        2
                    </label>
                    <input type="checkbox" value="2" id="stress[stress2]" name="stress[stress2]" @change="character.stress.stress2 = $event.target.value" :checked="exists(character.stress, 'stress2', false)" />
                </div>

                <div class="col">
                    <label class="stat-requirement" for="stress">
                        3
                    </label>
                    <input type="checkbox" value="3" id="stress[stress3]" name="stress[stress3]" @change="character.stress.stress3 = $event.target.value;autocalc();" :checked="exists(character.stress, 'stress3', false)" disabled data-required='physique' data-required-value='1'>
                </div>

                <div class="col">
                    <label class="stat-requirement" for="stress">
                        4
                    </label>
                    <input type="checkbox" value="3" id="stress[stress4]" name="stress[stress4]" @change="character.stress.stress4 = $event.target.value;autocalc();" :checked="exists(character.stress, 'stress4', false)" disabled data-required='physique' data-required-value='3'>
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
                    <input type="checkbox" value="1" id="stress[mental1]" name="stress[mental1]" @change="character.stress.mental1 = $event.target.value" :checked="exists(character.stress, 'mental1', false)" />
                </div>

                <div class="col">
                    <label for="stress">
                        2
                    </label>
                    <input type="checkbox" value="2" id="stress[mental2]" name="stress[mental2]" @change="character.stress.mental2 = $event.target.value" :checked="exists(character.stress, 'mental2', false)" />
                </div>

                <div class="col">
                    <label class="stat-requirement" for="stress" />
                        3
                    </label>
                    <input type="checkbox" value="3" id="stress[mental3]" name="stress[mental3]" @change="character.stress.mental3 = $event.target.value;autocalc();" :checked="exists(character.stress, 'mental3', false)" disabled data-required='will' data-required-value='1'>
                </div>

                <div class="col">
                    <label class="stat-requirement" for="stress">
                        4
                    </label>
                    <input type="checkbox" value="3" id="stress[mental4]" name="stress[mental4]"  @change="character.stress.mental4 = $event.target.value;autocalc();" :checked="exists(character.stress, 'mental4', false)" disabled data-required='will' data-required-value='3'>
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
                    <input class="form-control" type="text" id="consequence[mild]" name="consequence[mild]" placeholder="Mild" @change="character.consequences.mild = $event.target.value" :checked="exists(character.consequences, 'mild')" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label">4</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[moderate]" name="consequence[moderate]" placeholder="Moderate" @change="character.consequences.moderate = $event.target.value" :checked="exists(character.consequences, 'moderate')" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label">6</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[severe]" name="consequence[severe]" placeholder="Severe" @change="character.severe.mild = $event.target.value" :checked="exists(character.consequences, 'severe')" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label stat-requirement">2</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[mild2]" name="consequence[mild2]" placeholder="Mild" @change="character.consequences.mild2 = $event.target.value;autocalc();" :checked="exists(character.consequences, 'mild2')" disabled data-required='physiqueOrWill' data-required-value='5'>
                </div>
            </div>
        </div>

    </div>
</div>
</template>

<script>
export default {
  name: 'SheetFateCore',
  props: {
    character: Object,
  },
  mounted() {    
      this.initSheet();
  },
  computed: {
   
  },
  data () {
    return {
    }
  },
  methods: {  
    exists(parent, index, defaultValue, secondary) {
      this.$parent.exists(parent, index, defaultValue, secondary);
    },
    set(parent, index, value, secondary) {
       this.$parent.set(parent, index, value, secondary);
    },
    // autocalculate stuff
    getSkillValue(name) {
        if (name.indexOf('average') > -1)
            return 1;

        if (name.indexOf('fair') > -1)
            return 2;

        if (name.indexOf('good') > -1)
            return 3;

        if (name.indexOf('great') > -1)
            return 4;

        if (name.indexOf('superb') > -1)
            return 5;

        return 0;
    },
    autocalc() {
        var $physique = $('select').filter(function () { return $(':selected', this).val() == 'Physique' });
        var $will = $('select').filter(function () { return $(':selected', this).val() == 'Will' });

        var physique = '';
        var will = '';

        if ($physique.length > 0)
            physique = $physique.attr('name');

        if ($will.length > 0)
            will = $will.attr('name');

        $("input[data-required='physique']").each(() => {
            var $this = $(this);
            var qualifies = this.getSkillValue(physique) >= parseInt($this.data('required-value'));
            this.showQualified(qualifies, $this);
        });

        $("input[data-required='will']").each(() => {
            var $this = $(this);
            var qualifies = this.getSkillValue(will) >= parseInt($this.data('required-value'));
            this.showQualified(qualifies, $this);
        });

        $("input[data-required='physiqueOrWill']").each(() => {
            var $this = $(this);
            var qualifies = this.getSkillValue(physique) >= parseInt($this.data('required-value')) || this.getSkillValue(will) >= parseInt($this.data('required-value'));
            this.showQualified(qualifies, $this);
        });
    },
    showQualified(isQualified, $elem) {
        if (isQualified) {
            $elem.attr('disabled', false);
            $elem.prev('label').removeClass('stat-requirement');
            $elem.parent().prev('label').removeClass('stat-requirement');
        }
        else {
            $elem.attr('disabled', true);
            $elem.prev('label').addClass('stat-requirement');
            $elem.parent().prev('label').addClass('stat-requirement');
        }
    },
    populateSkillList() {
        var skills = ['', 'Athletics', 'Burglary', 'Contacts', 'Crafts', 'Deceive', 'Drive', 'Empathy'
                    , 'Fight', 'Investigate', 'Lore', 'Notice', 'Physique', 'Provoke', 'Rapport'
                    , 'Resources', 'Shoot', 'Stealth', 'Will'];

        $.each(skills, function (i, item) {
            $('select').append($('<option>', {
                value: item,
                text: item
            }));
        });
    },
    initSheet() {      
        this.populateSkillList();
    }
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
