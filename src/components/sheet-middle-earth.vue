<template>
<div class="sheet">
    <div class="row">
        <div class="col-sm-6 col-md-4 order-md-2">
            <div class="row">
                <div class="col text-center">
                    <img alt="LOGO" class="img-fluid fate-logo" src="/static/sheets/middle-earth/logo.png" />
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
                <div for="name" class="fate-header">Name</div>
                <input type="text" class="form-control" id="name" name="name" @change="character.name = $event.target.value" :value="exists(character, 'name')" placeholder="Name" />
            </div>

            <div class="form-group">
                <textarea class="form-control" id="description" name="description" rows="3" placeholder="Description" @change="character.description = $event.target.value" :value="exists(character, 'description')"></textarea>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- aspects -->
        <div class="col-sm-6 col-md-8 fate-aspects">
            <div class="form-group">
                <div for="" class="fate-header">Aspects</div>
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[highconcept]" name="aspect[highconcept]" @change="character.aspects.highconcept = $event.target.value" :value="exists(character.aspects, 'highconcept')" placeholder="High Concept" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[trouble]" name="aspect[trouble]" @change="character.aspects.trouble = $event.target.value" :value="exists(character.aspects, 'trouble')" placeholder="Trouble" />
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

        <!-- aspects -->
        <div class="col-sm-6 col-md-4 fate-skills">
            <div class="form-group">
                <div class="fate-header col-12">Skills</div>
            </div>

            <div class="form-group row">
                <div class="col-9 col-form-label">
                    <label class="col-12">Personality</label>
                    <div class="col-12 skill-desc">Awe, Inspire, Persuade</div>
                </div>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[personality]" name="approach[personality]" @change="character.approaches.personality = $event.target.value" :value="exists(character.approaches, 'personality')" placeholder="+" />
                </div>
            </div>

            <div class="form-group row">
                <div class="col-9 col-form-label">
                    <label class="col-12">Movement</label>
                    <div class="col-12 skill-desc">Athletics, Travel, Stealth</div>
                </div>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[movement]" name="approach[movement]" @change="character.approaches.movement = $event.target.value" :value="exists(character.approaches, 'movement')" placeholder="+" />
                </div>
            </div>

            <div class="form-group row">
                <div class="col-9 col-form-label">
                    <label class="col-12">Perception</label>
                    <div class="col-12 skill-desc">Awareness, Insight, Search</div>
                </div>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[perception]" name="approach[perception]" @change="character.approaches.perception = $event.target.value" :value="exists(character.approaches, 'perception')" placeholder="+" />
                </div>
            </div>

            <div class="form-group row">
                <div class="col-9 col-form-label">
                    <label class="col-12">Survival</label>
                    <div class="col-12 skill-desc">Explore, Healing, Hunting</div>
                </div>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[survival]" name="approach[survival]" @change="character.approaches.survival = $event.target.value" :value="exists(character.approaches, 'survival')" placeholder="+" />
                </div>
            </div>

            <div class="form-group row">
                <div class="col-9 col-form-label">
                    <label class="col-12">Custom</label>
                    <div class="col-12 skill-desc">Song, Courtesy, Riddle</div>
                </div>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[custom]" name="approach[custom]" @change="character.approaches.custom = $event.target.value" :value="exists(character.approaches, 'custom')"  placeholder="+" />
                </div>
            </div>

            <div class="form-group row">
                <div class="col-9 col-form-label">
                    <label class="col-12">Vocation</label>
                    <div class="col-12 skill-desc">Craft, Battle, Lore</div>
                </div>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[vocation]" name="approach[vocation]" @change="character.approaches.vocation = $event.target.value" :value="exists(character.approaches, 'vocation')" placeholder="+" />
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-6">
            <div class="form-group">
                <div for="stunts" class="fate-header">Stunts</div>
                <textarea class="form-control" id="stunts" name="stunts" rows="17" placeholder="Stunts" @change="character.stunts = $event.target.value" :value="exists(character, 'stunts')" ></textarea>
            </div>
        </div>
        <div class="col-sm-12 col-md-6">
            <div class="form-group">
                <div for="gear" class="fate-header">Gear</div>
                <textarea class="form-control" id="gear" name="gear" rows="17" placeholder="Gear" @change="character.approaches.gear = $event.target.value" :value="exists(character, 'gear')" ></textarea>
            </div>
        </div>
    </div>

    <div class="row fate-conditions">
        <div class="col-12 form-group">
            <div for="" class="fate-header">Conditions</div>
        </div>

        <div class="col-sm-12 col-md-6">
            <div class="row">
                <div class="col-10">
                    <label class="col-12">Hopeful</label>
                    <div class="col-12 help-text">
                        <strong>Effect: </strong>While this box is checked you have a +2 on rolls against despair and fear. You may uncheck this box in combat to soak 1 stress.
                        <br /><strong>Recover: </strong>Spend at least one full day in a warm, safe place with acceptable food and be in the company of close friends.
                    </div>
                </div>
                <input type="checkbox" value="2" id="condition[hopeful]" name="condition[hopeful]" class="col-2" @change="character.conditions.hopeful = $event.target.value" :checked="exists(character.conditions, 'hopeful', true)" />
            </div>

            <div class="row">
                <div class="col-10">
                    <label class="col-12">Weary</label>
                    <div class="col-12 help-text">
                        <strong>Effect: </strong>You may check this box in combat to soak 1 stress.
                        <br/><strong>Recover: </strong>You must have a few hours of rest.
                    </div>
                </div>
                <input type="checkbox" value="1" id="condition[weary]" name="condition[weary]" class="col-2" @change="character.conditions.weary = $event.target.value" :checked="exists(character.conditions, 'weary', false)" />
            </div>

            <div class="row">
                <div class="col-10">
                    <label class="col-12">Miserable</label>
                    <div class="col-12 help-text">
                        <strong>Effect: </strong>You may check this box in combat to soak 1 stress.
                        <br /><strong>Recover: </strong>You must have a warm dry place to rest and a meal.
                    </div>
                </div>
                <input type="checkbox" value="2" id="condition[miserable]" name="condition[miserable]" class="col-2" @change="character.conditions.miserable = $event.target.value" :checked="exists(character.conditions, 'miserable', false)" />
            </div>

            <div class="row">
                <div class="col-10">
                    <label class="col-12">Frightened</label>
                    <div class="col-12 help-text">
                        <strong>Effect: </strong>While checked, you must attempt to get away from the source of your fear.
                        <br /><strong>Recover: </strong>At the beginning of any scene where you are no longer in the presence of the source of your fear.
                    </div>
                </div>
                <input type="checkbox" value="2" id="condition[frightened]" name="condition[frightened]" class="col-2"  @change="character.conditions.frightened = $event.target.value" :checked="exists(character.conditions, 'frightened', false)">
            </div>
        </div>

        <div class="col-sm-12 col-md-6">
            <div class="row">
                <div class="col-10">
                    <label class="col-12">Poisoned</label>
                    <div class="col-12 help-text">
                        <strong>Effect: </strong>checked you have the 'Poisoned' aspect.
                        <br /><strong>Recover: </strong>Receive medical care and have ample time to rest and eat.
                    </div>
                </div>
                <input type="checkbox" value="2" id="condition[poisoned]" name="condition[poisoned]" class="col-2" @change="character.conditions.poisoned = $event.target.value" :checked="exists(character.conditions, 'poisoned', false)">
            </div>

            <div class="row mt-4">
                <div class="col-8">
                    <label class="col-12">Injured</label>
                    <div class="col-12 ml-3 help-text">
                        <strong>Effect: </strong>A minor injury.
                        <br /><strong>Recover: </strong>Uncheck this box after the end of the next scene.
                    </div>
                </div>
                <label class="col-1">2</label><input type="checkbox" value="2" id="condition[injured]" name="condition[injured]" class="col-3" @change="character.conditions.injured = $event.target.value" :checked="exists(character.conditions, 'injured', false)" />
            </div>

            <div class="row">
                <div class="col-8">
                    <label class="col-12">Wounded</label>
                    <div class="col-12 ml-3 help-text">
                        <strong>Effect: </strong>A lasting wound that affects your abilities.
                        <br /><strong>Recover: </strong>requires medical attention. Uncheck this box at the beginning of the next game session.
                    </div>
                </div>
                <label class="col-1">4</label><input type="checkbox" value="4" id="condition[wounded]" name="condition[wounded]" class="col-3" @change="character.conditions.wounded = $event.target.value" :checked="exists(character.conditions, 'wounded', false)" />

            </div>

            <div class="row">
                <div class="col-8">
                    <label class="col-12">Dying</label>
                    <div class="col-12 ml-3 help-text">
                        <strong>Effect:</strong>A dire wound that will dramatically altar your life &mdash; if you survive.
                        <br /><strong>Recover: </strong>Requires medical attention as well as a long recovery in a safe place with ample food and rest.
                    </div>
                </div>
                <label class="col-1">6</label><input type="checkbox" value="6" id="condition[dying]" name="condition[dying]" class="col-3" @change="character.conditions.dying = $event.target.value" :checked="exists(character.conditions, 'dying', false)" />
            </div>
        </div>

    </div>

</div>

</template>

<script>
export default {
  name: 'SheetMiddleEarth',
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
    exists(parent, value, defaultValue) {
      this.$parent.exists(parent, value, defaultValue);
    }  
  }
}
</script>

<style lang="scss" scoped>
  @import url('https://fonts.googleapis.com/css?family=Quintessential');

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
        font-family: 'Quintessential', sans-serif;
        text-transform: uppercase;
        background-color: #000;
        color: white;
        font-weight: 700;
        padding: 3px;
        margin-top: 5px;
        font-size: 22px;
    }

    .col-form-label {
        font-family: 'Quintessential', sans-serif;
        text-transform: uppercase;
        font-size: 22px;
        font-weight: 700;
        padding-left: 0px;
    }

    .fate-skills .form-group {
        margin-top: 1px;
        margin-bottom: 1px;
    }

    .fate-skills .col-form-label {
        margin-top: -10px;
    }

    .fate-skills label {
        padding-bottom: 0px;
        margin-bottom: 0px;
    }

    .fate-skills .skill-desc {
        margin-top: -10px;
        font-size: 10px;
        font-weight: 600;
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
        font-family: 'Quintessential', sans-serif;
        text-transform: uppercase;
        font-size: 30px;
        font-weight: 700;
        margin-left: -5px;
        margin-right: -5px;
    }

    .fate-conditions label div {
        font-family: 'Quintessential', sans-serif;
        text-transform: capitalize;
    }

    .portrait {
        max-height: 450px;
        padding-top: 10px;
    }

    .small {
        color: #888;
    }

    .help-text{
        color: #000;
        font-size: 12px !important;
        margin-top: -10px;
        line-height: 12px;
    }
</style>
