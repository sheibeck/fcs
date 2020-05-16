<template>
<div class="sheet">
    <div class="row">
        <div class="col-sm-6 col-md-4 order-md-2">
            <div class="row">
                <div class="col text-center">
                    <img alt="FATE ACCELERATED" class="img-fluid fate-logo" :src="$parent.GetSheetImage()" />
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
        <div class="col-sm-6 col-md-8 fate-aspects">
            <div class="form-group">
                <div for="" class="fate-header">Aspects</div>
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[highconcept]" name="aspect[highconcept]" @change="setVal('aspects.highconcept',  $event.target.value)" :value="getVal('aspects.highconcept')" placeholder="High Concept" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[trouble]" name="aspect[trouble]" @change="setVal('aspects.trouble',  $event.target.value)" :value="getVal('aspects.trouble')" placeholder="Trouble" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[other1]" name="aspect[other1]" @change="setVal('aspects.other1',  $event.target.value)" :value="getVal('aspects.other1')" placeholder="Aspect" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[other2]" name="aspect[other2]" @change="setVal('aspects.other2',  $event.target.value)" :value="getVal('aspects.other2')" placeholder="Aspect" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[other3]" name="aspect[other3]" @change="setVal('aspects.other3',  $event.target.value)" :value="getVal('aspects.other3')" placeholder="Aspect" />
            </div>
            <div class="form-group">
                <input type="text" class="form-control" id="aspect[other4]" name="aspect[other4]" @change="setVal('aspects.other4',  $event.target.value)" :value="getVal('aspects.other4')" placeholder="Aspect" />
            </div>
        </div>

        <div class="col-sm-6 col-md-4 fate-approaches">
            <div class="form-group">
                <div class="fate-header col-12">Approaches</div>
            </div>

            <div class="form-group row">
                <label class="col-9 col-form-label">Strength</label>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[strength]" name="approach[strength]" @change="setVal('approaches.strength',  $event.target.value)" :value="getVal('approaches.strength')" placeholder="+" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-9 col-form-label">Dexterity</label>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[dexterity]" name="approach[dexterity]" @change="setVal('approaches.dexterity',  $event.target.value)" :value="getVal('approaches.dexterity')" placeholder="+" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-9 col-form-label">Constitution</label>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[constitution]" name="approach[constitution]" @change="setVal('approaches.constitution',  $event.target.value)" :value="getVal('approaches.constitution')" placeholder="+" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-9 col-form-label">Intelligence</label>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[intelligence]" name="approach[intelligence]" @change="setVal('approaches.intelligence',  $event.target.value)" :value="getVal('approaches.intelligence')" placeholder="+" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-9 col-form-label">Wisdom</label>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[wisdom]" name="approach[wisdom]" @change="setVal('approaches.wisdom',  $event.target.value)" :value="getVal('approaches.wisdom')" placeholder="+" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-9 col-form-label">Charisma</label>
                <div class="col-3">
                    <input class="form-control text-center" type="text" id="approach[charisma]" name="approach[charisma]" @change="setVal('approaches.charisma',  $event.target.value)" :value="getVal('approaches.charisma')" placeholder="+" />
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-6">
            <div class="form-group">
                <div for="stunts" class="fate-header">Stunts & Gear</div>
                <textarea class="form-control" id="stunts" name="stunts" rows="15" @change="setVal('stunts',  $event.target.value)" :value="getVal('stunts')" placeholder="Stunts & Gear"></textarea>
            </div>
        </div>
        <div class="col-sm-12 col-md-6">
            <div class="form-group">
                <div for="stunts" class="fate-header">Spells</div>
                <textarea class="form-control" id="spells" name="spells" rows="15" @change="setVal('spells',  $event.target.value)" :value="getVal('spells')" placeholder="Spells"></textarea>
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
                    <input type="checkbox" value="1" id="stress[stress1]" name="stress[stress1]" @change="setVal('stress.stress1',  $event.target.checked)" :checked="getVal('stress.stress1')" />
                </div>

                <div class="col">
                    <label for="stress">
                        2
                    </label>
                    <input type="checkbox" value="2" id="stress[stress2]" name="stress[stress2]" @change="setVal('stress.stress2',  $event.target.checked)" :checked="getVal('stress.stress2')" />
                </div>

                <div class="col">
                    <label :class="{'stat-requirement': !approachHasValue('constitution', 1)}" for="stress">
                        3
                    </label>
                    <input type="checkbox" value="3" id="stress[stress3]" name="stress[stress3]"  @change="setVal('stress.stress3',  $event.target.checked)" :checked="getVal('stress.stress3')" :disabled="!approachHasValue('constitution', 1)" />
                </div>

                <div class="col">
                    <label :class="{'stat-requirement': !approachHasValue('constitution', 3)}" for="stress">
                        4
                    </label>
                    <input type="checkbox" value="3" id="stress[stress4]" name="stress[stress4]" @change="setVal('stress.stress4',  $event.target.checked)" :checked="getVal('stress.stress4')" :disabled="!approachHasValue('constitution', 3)" />
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
                    <input type="checkbox" value="1" id="stress[mental1]" name="stress[mental1]" @change="setVal('stress.mental1',  $event.target.checked)" :checked="getVal('stress.mental1')" />
                </div>

                <div class="col">
                    <label for="stress">
                        2
                    </label>
                    <input type="checkbox" value="2" id="stress[mental2]" name="stress[mental2]" @change="setVal('stress.mental2',  $event.target.checked)" :checked="getVal('stress.mental2')" />
                </div>

                <div class="col">
                    <label :class="{'stat-requirement': !approachHasValue('wisdom', 1)}" for="stress">
                        3
                    </label>
                    <input type="checkbox" value="3" id="stress[mental3]" name="stress[mental3]" @change="setVal('stress.mental3',  $event.target.checked)" :checked="getVal('stress.mental3')" :disabled="!approachHasValue('wisdom', 1)">
                </div>

                <div class="col">
                    <label :class="{'stat-requirement': !approachHasValue('wisdom', 3)}" for="stress">
                        4
                    </label>
                    <input type="checkbox" value="3" id="stress[mental4]" name="stress[mental4]" @change="setVal('stress.mental4',  $event.target.checked)" :checked="getVal('stress.mental4')" :disabled="!approachHasValue('wisdom', 3)">
                </div>
            </div>

            <!-- corruption -->
            <div class="form-group">
                <div for="" class="fate-header">Corruption</div>
            </div>
            <div class="row">
                <div class="col">
                    <label for="stress">
                        &nbsp;&nbsp;
                    </label>
                    <input type="checkbox" value="1" id="corruption[corruption1]" name="corruption[corruption1]" @change="setVal('corruption.corruption1',  $event.target.checked)" :checked="getVal('corruption.corruption1')" />
                </div>

                <div class="col">
                    <label for="stress">
                        &nbsp;&nbsp;
                    </label>
                    <input type="checkbox" value="2" id="corruption[corruption2]" name="corruption[corruption2]" @change="setVal('corruption.corruption2',  $event.target.checked)" :checked="getVal('corruption.corruption2')" />
                </div>

                <div class="col">
                    <label class="" for="stress">
                        &nbsp;&nbsp;
                    </label>
                    <input type="checkbox" value="3" id="corruption[corruption3]" name="corruption[corruption3]" @change="setVal('corruption.corruption3',  $event.target.checked)" :checked="getVal('corruption.corruption3')" />
                </div>

                <div class="col">
                    <label class="" for="stress">
                        &nbsp;&nbsp;
                    </label>
                    <input type="checkbox" value="4" id="corruption[corruption4]" name="corruption[corruption4]" @change="setVal('corruption.corruption4',  $event.target.checked)" :checked="getVal('corruption.corruption4')" />
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
                    <input class="form-control" type="text" id="consequence[mild]" name="consequence[mild]"  @change="setVal('consequences.mild',  $event.target.value)" :value="getVal('consequences.mild')" placeholder="Mild" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label">4</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[moderate]" name="consequence[moderate]" @change="setVal('consequences.moderate',  $event.target.value)" :value="getVal('consequences.moderate')" placeholder="Moderate" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label">6</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[severe]" name="consequence[severe]" @change="setVal('consequences.severe',  $event.target.value)" :value="getVal('consequences.severe')" placeholder="Severe" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label" :class="{'stat-requirement': !approachHasValue('constitution|wisdom', 5)}">2</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[mild2]" name="consequence[mild2]" @change="setVal('consequences.mild2',  $event.target.value)" :value="getVal('consequences.mild2')" placeholder="Mild" :disabled="!approachHasValue('constitution|wisdom', 5)" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label" :class="{'stat-requirement': !approachHasValue('constitution|wisdom', 6)}">4</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[moderate2]" name="consequence[moderate2]" @change="setVal('consequences.moderate2',  $event.target.value)" :value="getVal('consequences.moderate2')" placeholder="Moderate" :disabled="!approachHasValue('constitution|wisdom', 6)" />
                </div>
            </div>

            <div class="form-group row">
                <label class="col-2 col-form-label" :class="{'stat-requirement': !approachHasValue('constitution|wisdom', 7)}">6</label>
                <div class="col-10">
                    <input class="form-control" type="text" id="consequence[severe2]" name="consequence[severe2]" @change="setVal('consequences.severe2',  $event.target.value)" :value="getVal('consequences.severe2')" placeholder="Severe" :disabled="!approachHasValue('constitution|wisdom', 7)" />
                </div>
            </div>

            <div class="form-group">
                <div class="fate-header col-12">Insanity</div>
            </div>

            <div class="form-group row">
                <div class="col">
                    <textarea class="form-control" id="insanity" name="insanity" rows="2" @change="setVal('insanity',  $event.target.value)" :value="getVal('insanity')" placeholder="insanity"></textarea>
                </div>
            </div>
        </div>

    </div>    
</div>
</template>

<script>
export default {
  name: 'SheetFateFreeport',
  props: {    
    character: Object,
  },
  mounted() {
   this.$parent.$parent.title = 'Fate Freeport (Character Sheet)';
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
    approachHasValue(approachList, value) {                
        const aObj = this.character.approaches;
        var itemArray = approachList.split("|");
        
        var result = false;
        itemArray.forEach( (approachName) => {
            if (aObj && aObj[approachName] && parseInt(aObj[approachName]) >= value)
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
 @import url('https://fonts.googleapis.com/css?family=Trade+Winds');

	.sheet {
		margin: 20px;
		margin-top: 40px;
		max-width: 1024px;
	}

	.fate-logo {
		max-height: 130px;
	}

	.fate-header {
        font-family: 'Trade Winds', sans-serif;
        text-transform: uppercase;
		background-color: #000;
		color: white;
		font-weight: 700;
		padding: 3px;
		margin-top: 5px;
		font-size: 22px;
	}

	.col-form-label {
        font-family: 'Trade Winds', sans-serif;
        text-transform: uppercase;
		font-size: 22px;
		font-weight: 700;
	}

	.fate-approaches .form-group {
		margin-bottom: 3px;
		margin-top: 3px;
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
        font-family: 'Trade Winds', sans-serif;
        text-transform: uppercase;
		font-weight: 700;
		font-size: 28px;
		padding-top: 0px;
		padding-bottom: 0px;
		padding-left: 25px;
	}

	.fate-stress label {
        font-family: 'Trade Winds', sans-serif;
        text-transform: uppercase;
		font-size: 30px;
		font-weight: 700;
		margin-left: -5px;
		margin-right: -5px;
	}

	.stat-requirement {
		color: #ccc
	}

</style>
