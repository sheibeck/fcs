<template>
<div class="sheet">
	<div class="row">
		<div class="col-sm-6 col-md-4 order-md-2">
			<div class="row">
				<div class="col text-center fate-logo">
					<label>Dresden Files</label>
					<label>Accelerated</label>
				</div>
			</div>
		</div>

		<div class="col-sm-6 col-md-8 order-md-1">
			<div class="form-group">
				<div for="name" class="fate-header">Character Name</div>
				<input type="text" class="form-control" id="name" name="name" @change="setVal('name',  $event.target.value)" :value="getVal('name')" placeholder="Name" />
			</div>
		</div>
	</div>

	<div class="row">
		<!-- approaches -->
		<div class="col-sm-6 col-md-4 fate-approaches">
			<div class="form-group">
				<div class="fate-header col-12">Approaches</div>
			</div>

			<div class="form-group row">
				<label class="col-9 col-form-label">Flair</label>
				<div class="col-3">
				<input class="form-control text-center round-input" type="text" id="approach[flair]" name="approach[flair]" @change="setVal('approaches.flair',  $event.target.value)" :value="getVal('approaches.flair')" placeholder="+" />
				</div>
			</div>

			<div class="form-group row">
				<label class="col-9 col-form-label">Focus</label>
				<div class="col-3">
				<input class="form-control text-center round-input" type="text" id="approach[focus]" name="approach[focus]" @change="setVal('approaches.focus',  $event.target.value)" :value="getVal('approaches.focus')" placeholder="+" />
				</div>
			</div>

			<div class="form-group row">
				<label class="col-9 col-form-label">Force</label>
				<div class="col-3">
				<input class="form-control text-center round-input" type="text" id="approach[force]" name="approach[force]" @change="setVal('approaches.force',  $event.target.value)" :value="getVal('approaches.force')" placeholder="+" />
				</div>
			</div>

			<div class="form-group row">
				<label class="col-9 col-form-label">Guile</label>
				<div class="col-3">
				<input class="form-control text-center round-input" type="text" id="approach[guile]" name="approach[guile]" @change="setVal('approaches.guile',  $event.target.value)" :value="getVal('approaches.guile')" placeholder="+" />
				</div>
			</div>

			<div class="form-group row">
				<label class="col-9 col-form-label">Haste</label>
				<div class="col-3">
				<input class="form-control text-center round-input" type="text" id="approach[haste]" name="approach[haste]" @change="setVal('approaches.haste',  $event.target.value)" :value="getVal('approaches.haste')" placeholder="+" />
				</div>
			</div>

			<div class="form-group row">
				<label class="col-9 col-form-label">Intellect</label>
				<div class="col-3">
				<input class="form-control text-center round-input" type="text" id="approach[intellect]" name="approach[intellect]" @change="setVal('approaches.intellect',  $event.target.value)" :value="getVal('approaches.intellect')" placeholder="+" />
				</div>
			</div>
		</div>

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
				<textarea type="text" class="form-control" id="aspect[other]" rows="8" name="aspect[other]" @change="setVal('aspects.other',  $event.target.value)" :value="getVal('aspects.other')" placeholder="Other Aspects"></textarea>
			</div>
		</div>
	</div>


	<div class="row">
		<!-- ladder -->
		<div class="col-sm-6 col-md-4">
			<div class="fate-ladder d-none d-md-block">
				<div class="form-group">
					<div class="fate-header col-12">Ladder</div>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+8 Legendary</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+7 Epic</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+6 Fantastic</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+5 Superb</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+4 Great</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+2 Fair</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+1 Average</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">+0 Mediocre</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">–1 Poor</label>
				</div>
				<div class="form-group row">
					<label class="col-9 col-form-label">-2 Terrible</label>
				</div>
			</div>

			<!-- scale -->
			<div class="fate-scale">
				<div class="form-group">
					<div for="" class="fate-header">Scale (p.182)</div>
				</div>
				<div class="form-check">
				  <input class="form-check-input" type="radio" name="scale" id="scale[godlike]" value="godlike" @change="setVal('scale.godlike',  $event.target.checked)" :checked="getVal('scale.godlike')" />
				  <label class="form-check-label col-form-label" for="scale[godlike]">
				    Godlike
				  </label>
				</div>
				<div class="form-check">
					<input class="form-check-input" type="radio" name="scale" id="scale[legendary]" value="legendary" @change="setVal('scale.legendary',  $event.target.checked)" :checked="getVal('scale.legendary')" />
					<label class="form-check-label col-form-label" for="scale[legendary]">
						Legendary
					</label>
				</div>
				<div class="form-check">
					<input class="form-check-input" type="radio" name="scale" id="scale[otherworldly]" value="otherworldly" @change="setVal('scale.otherworldly',  $event.target.checked)" :checked="getVal('scale.otherworldly')" />
					<label class="form-check-label col-form-label" for="scale[otherworldly]">
						Otherworldly
					</label>
				</div>
				<div class="form-check">
					<input class="form-check-input" type="radio" name="scale" id="scale[supernatural]" value="supernatural" @change="setVal('scale.supernatural',  $event.target.checked)" :checked="getVal('scale.supernatural')" />
					<label class="form-check-label col-form-label" for="scale[supernatural]">
						Supernatural
					</label>
				</div>
				<div class="form-check">
					<input class="form-check-input" type="radio" name="scale" id="scale[mundane]" value="mundane" @change="setVal('scale.mundane',  $event.target.checked)" :checked="getVal('scale.mundane')" />
					<label class="form-check-label col-form-label" for="scale[mundane]">
						Mundane
					</label>
				</div>
			</div>
		</div>

		<!-- mantles & stunts -->
		<div class="col-sm-6 col-md-8 fate-mantles">
			<div class="form-group">
				<div for="" class="fate-header">Mantles</div>
			</div>
			<div class="form-group">
				<textarea type="text" class="form-control" id="mantles" name="mantles" rows="2" placeholder="Mantles" @change="setVal('mantles',  $event.target.value)" :value="getVal('mantles')"></textarea>
			</div>
			<div class="form-group">
				<div for="" class="fate-header">Stunts</div>
			</div>
			<div class="form-group">
				<textarea type="text" class="form-control" id="stunts" name="stunts" rows="13" @change="setVal('stunts',  $event.target.value)" :value="getVal('stunts')" placeholder="Stunts"></textarea>
			</div>
			<div class="form-group row">
				<label class="col-sm-12 col-md-9 col-form-label text-right">Refresh</label>
				<div class="col-sm-12 col-md-3">
					<input class="form-control text-center" type="text" id="refresh" name="refresh" @change="setVal('refresh',  $event.target.value)" :value="getVal('refresh')" placeholder="Refresh">
				</div>
			</div>
		</div>
	</div>

	<div class="row">
		<!-- stress -->
		<div class="col-sm-6 col-md-4 fate-stress">
			<div class="form-group">
				<div for="" class="fate-header">Stress</div>
			</div>
			<div class="row">
				<div class="col">
				  <label for="stress[stress1]">
					1
				  </label>
				  <input type="checkbox" value="1" id="stress[stress1]" name="stress[stress1]" @change="setVal('stress.stress1',  $event.target.checked)" :checked="getVal('stress.stress1')" />
				</div>

				<div class="col">
				  <label for="stress[stress2]">
					1
				  </label>
				  <input type="checkbox" value="1" id="stress[stress2]" name="stress[stress2]" @change="setVal('stress.stress2',  $event.target.checked)" :checked="getVal('stress.stress2')" />
				</div>

				<div class="col">
				  <label class="" for="stress[stress3]">
					1
				  </label>
				  <input type="checkbox" value="1" id="stress[stress3]" name="stress[stress3]" @change="setVal('stress.stress3',  $event.target.checked)" :checked="getVal('stress.stress3')" />
				</div>
			</div>
			<div class="row">
				<div class="col">
				  <label for="stress[stress4]">
					1
				  </label>
				  <input type="checkbox" value="1" id="stress[stress4]" name="stress[stress4]" @change="setVal('stress.stress4',  $event.target.checked)" :checked="getVal('stress.stress4')" />
				</div>

				<div class="col">
				  <label for="stress[stress5]">
					1
				  </label>
				  <input type="checkbox" value="1" id="stress[stress5]" name="stress[stress5]" @change="setVal('stress.stress5',  $event.target.checked)" :checked="getVal('stress.stress5')" />
				</div>

				<div class="col">
				  <label class="" for="stress[stress6]">
					1
				  </label>
				  <input type="checkbox" value="1" id="stress[stress6]" name="stress[stress6]" @change="setVal('stress.stress6',  $event.target.checked)" :checked="getVal('stress.stress6')" />
				</div>
			</div>

			<div class="row">
				<label class="col-12 fate-otherstress-label">
					Other Types of Stress
				</label>
			</div>

			<div class="row">
				<div class="col">
					<label for="stress[stressother1]">
					1
					</label>
					<input type="checkbox" value="1" id="stress[stressother1]" name="stress[stressother1]" @change="setVal('stress.stressother1',  $event.target.checked)" :checked="getVal('stress.stressother1')" />
				</div>

				<div class="col">
					<label for="stress[stressother2]">
					1
					</label>
					<input type="checkbox" value="1" id="stress[stressother2]" name="stress[stressother2]" @change="setVal('stress.stressother2',  $event.target.checked)" :checked="getVal('stress.stressother2')" />
				</div>

				<div class="col">
					<label class="" for="stress[stressother3]">
					1
					</label>
					<input type="checkbox" value="1" id="stress[stressother3]" name="stress[stressother3]" @change="setVal('stress.stressother3',  $event.target.checked)" :checked="getVal('stress.stressother3')" />
				</div>
			</div>
		</div>

		<!-- conditions -->
		<div class="col-sm-6 col-md-8 fate-conditions">
			<div class="form-group row">
				<div class="fate-header col-12">Conditions</div>
			</div>

			<div class="form-group row">
				<input class="col-3 col-sm-6 col-md-2" value="1" type="checkbox" name="condition[inperil]" id="condition[inperil]" @change="setVal('stress.stressother3',  $event.target.checked)" :checked="getVal('stress.stressother3')" />
				<label class="col-9 col-sm-6 col-md-4 col-form-label" for="condition[inperil]">
					In Peril (p.117)
				</label>

				<input class="col-3 col-sm-6 col-md-2" value="1" type="checkbox" name="condition[doomed]" id="condition[doomed]" @change="setVal('stress.stressother3',  $event.target.checked)" :checked="getVal('stress.stressother3')" />
				<label class="col-9 col-sm-6 col-md-4 col-form-label" for="condition[doomed]">
					Doomed (p.117)
				</label>
			</div>

			<div class="row">
				<div class="col-sm-12 col-md-6 order-md-2">
					<label class="form-check-label col-form-label" for="condition[indebted]">
						indebted (p.117)
					</label>
				</div>
				<div class="col-sm-12 col-md-6 order-md-1">
					<input type="checkbox" value="1" name="condition[indebtedcheck1]" id="condition[indebtedcheck1]" @change="setVal('conditions.indebtedcheck1',  $event.target.checked)" :checked="getVal('conditions.indebtedcheck1')" />
					<input type="checkbox" value="2" name="condition[indebtedcheck2]" id="condition[indebtedcheck2]" @change="setVal('conditions.indebtedcheck2',  $event.target.checked)" :checked="getVal('conditions.indebtedcheck2')" />
					<input type="checkbox" value="3" name="condition[indebtedcheck3]" id="condition[indebtedcheck3]" @change="setVal('conditions.indebtedcheck3',  $event.target.checked)" :checked="getVal('conditions.indebtedcheck3')" />
					<input type="checkbox" value="4" name="condition[indebtedcheck4]" id="condition[indebtedcheck4]" @change="setVal('conditions.indebtedcheck4',  $event.target.checked)" :checked="getVal('conditions.indebtedcheck4')" />
					<input type="checkbox" value="5" name="condition[indebtedcheck5]" id="condition[indebtedcheck5]" @change="setVal('conditions.indebtedcheck5',  $event.target.checked)" :checked="getVal('conditions.indebtedcheck5')" />
				</div>
			</div>

			<div class="row">
				<div class="col-sm-12 col-md-6 order-md-2">
					<input type="text" class="fate-condition-label col-form-label" name="condition[condition1]" id="condition[condition1]" @change="setVal('conditions.condition1',  $event.target.value)" :value="getVal('conditions.condition1')" placeholder="Condition Name" />
				</div>
				<div class="col-sm-12 col-md-6 order-md-1">
					<input type="checkbox" value="1" name="condition[condition1check1]" id="condition[condition1check1]" @change="setVal('conditions.condition1check1',  $event.target.checked)" :checked="getVal('conditions.condition1check1')" />
					<input type="checkbox" value="2" name="condition[condition1check2]" id="condition[condition1check2]" @change="setVal('conditions.condition1check2',  $event.target.checked)" :checked="getVal('conditions.condition1check2')" />
					<input type="checkbox" value="3" name="condition[condition1check3]" id="condition[condition1check3]" @change="setVal('conditions.condition1check3',  $event.target.checked)" :checked="getVal('conditions.condition1check3')" />
					<input type="checkbox" value="4" name="condition[condition1check4]" id="condition[condition1check4]" @change="setVal('conditions.condition1check4',  $event.target.checked)" :checked="getVal('conditions.condition1check4')" />
					<input type="checkbox" value="5" name="condition[condition1check5]" id="condition[condition1check5]" @change="setVal('conditions.condition1check5',  $event.target.checked)" :checked="getVal('conditions.condition1check5')" />
				</div>
			</div>

			<div class="row">
				<div class="col-sm-12 col-md-6 order-md-2">
					<input type="text" class="fate-condition-label col-form-label" name="condition[condition2]" id="condition[condition2]" @change="setVal('conditions.condition2',  $event.target.value)" :value="getVal('conditions.condition2')" placeholder="Condition Name"/>
				</div>
				<div class="col-sm-12 col-md-6 order-md-1">
					<input type="checkbox" value="1" name="condition[condition2check1]" id="condition[condition2check1]" @change="setVal('conditions.condition2check1',  $event.target.checked)" :checked="getVal('conditions.condition2check1')" />
					<input type="checkbox" value="2" name="condition[condition2check2]" id="condition[condition2check2]" @change="setVal('conditions.condition2check2',  $event.target.checked)" :checked="getVal('conditions.condition2check2')" />
					<input type="checkbox" value="3" name="condition[condition2check3]" id="condition[condition2check3]" @change="setVal('conditions.condition2check3',  $event.target.checked)" :checked="getVal('conditions.condition2check3')" />
					<input type="checkbox" value="4" name="condition[condition2check4]" id="condition[condition2check4]" @change="setVal('conditions.condition2check4',  $event.target.checked)" :checked="getVal('conditions.condition2check4')" />
					<input type="checkbox" value="5" name="condition[condition2check5]" id="condition[condition2check5]" @change="setVal('conditions.condition2check5',  $event.target.checked)" :checked="getVal('conditions.condition2check5')" />
				</div>
			</div>

			<div class="row">
				<div class="col-sm-12 col-md-6 order-md-2">
					<input type="text" class="fate-condition-label col-form-label" name="condition[condition3]" id="condition[condition3]" @change="setVal('conditions.condition3',  $event.target.value)" :value="getVal('conditions.condition3')" placeholder="Condition Name"/>
				</div>
				<div class="col-sm-12 col-md-6 order-md-1">
					<input type="checkbox" value="1" name="condition[condition3check1]" id="condition[condition3check1]" @change="setVal('conditions.condition3check1',  $event.target.checked)" :checked="getVal('conditions.condition3check1')" />
					<input type="checkbox" value="2" name="condition[condition3check2]" id="condition[condition3check2]" @change="setVal('conditions.condition3check2',  $event.target.checked)" :checked="getVal('conditions.condition3check2')" />
					<input type="checkbox" value="3" name="condition[condition3check3]" id="condition[condition3check3]" @change="setVal('conditions.condition3check3',  $event.target.checked)" :checked="getVal('conditions.condition3check3')" />
					<input type="checkbox" value="4" name="condition[condition3check4]" id="condition[condition3check4]" @change="setVal('conditions.condition3check4',  $event.target.checked)" :checked="getVal('conditions.condition3check4')" />
					<input type="checkbox" value="5"  name="condition[condition3check5]" id="condition[condition3check5]" @change="setVal('conditions.condition3check5',  $event.target.checked)" :checked="getVal('conditions.condition3check5')" />
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script>
export default {
  name: 'SheetDresdenFilesAccelerated',
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
    @import url('https://fonts.googleapis.com/css?family=Aldrich');

  body {
		color: #452f92;
	}

	.sheet {
		margin: 20px;
		margin-top: 40px;
		max-width: 1024px;
	}

	.fate-logo {
		font-size: 32px;
		line-height: 30px;
		font-family: 'Aldrich', sans-serif;
		text-transform: uppercase;
	}

	.fate-header {
    font-family: 'Aldrich', sans-serif;
    text-transform: uppercase;
		background-color: #452f92;
		color: white;
		font-weight: 700;
		padding: 3px;
		margin-top: 5px;
		font-size: 22px;
	}

	.col-form-label {
    font-family: 'Aldrich', sans-serif;
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

	.fate-ladder .row label {
		margin-bottom: -9px;
		margin-top: -9px;
		padding-bottom: 0px;
		padding-top: 0px
	}

	input[type=radio] {
		height: 25px;
    width: 25px;
    margin-top: 3px;
	}

	.fate-conditions input[type=checkbox] {
		height: 50px;
		width: 50px;
	}

	.fate-conditions .form-check label {
		margin-left: 20px;
	}

	input[type=checkbox] {
		height: 50px;
		width: 50px;
	}

	.fate-scale label {
		margin-left: 10px;
		padding-bottom: 0px;
		padding-top: 0px;
	}

	.round-input {
			border-radius: 25px;
			width: 50px;
			height: 50px;
			font-size: 24px;
	}

	.fate-consequences label {
    font-family: 'Aldrich', sans-serif;
    text-transform: uppercase;
		font-weight: 700;
		font-size: 28px;
		padding-top: 0px;
		padding-bottom: 0px;
		padding-left: 25px;
	}

	.fate-stress label {
    font-family: 'Aldrich', sans-serif;
    text-transform: uppercase;
		font-size: 30px;
		font-weight: 700;
		margin-left: -5px;
		margin-right: -5px;
	}

	.fate-otherstress-label {
		font-size: 16px !important;
		text-align: center;
	}

	.fate-condition-label {
		border: 0px;
		width: 100%;
		border-bottom: solid 1px #452f92;
	}
</style>
