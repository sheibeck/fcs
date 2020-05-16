<template>
<div class="sheet">
	<div class="row">
		<div class="col-sm-6 col-md-4 order-md-2">
			<div class="row">
				<div class="col text-center">
					<img alt="Mouse Guard" class="img-fluid fate-logo" :src="$parent.GetSheetImage()" />
				</div>
			</div>

			<div class="row">
				<div class="col-6 text-center">
					<div for="refresh" class="fate-header">Refresh</div>
					<input type="text" class="form-control text-center" id="refresh" name="refresh" @change="setVal('refresh', $event.target.value)" :value="getVal('refresh')" placeholder="Refresh" />
				</div>
				<div class="col-6 text-center ">
					<div for="fatepoints" class="fate-header">FP</div>
					<input type="text" class="form-control text-center" id="fatepoints" name="fatepoints" @change="setVal('fatepoints', $event.target.value)" :value="getVal('fatepoints')" placeholder="Fate Points" />
				</div>
			</div>
		</div>

		<div class="col-sm-6 col-md-8 order-md-1">
			<div class="form-group">
				<div for="name" class="fate-header">Name</div>
				<input type="text" class="form-control" id="name" name="name" @change="setVal('name', $event.target.value)" :value="getVal('name')" placeholder="Name" />
			</div>

			<div class="form-group">
				<textarea class="form-control" id="description" name="description" rows="3" @change="setVal('description', $event.target.value)" :value="getVal('description')" placeholder="Description"></textarea>
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

		<!-- aspects -->
		<div class="col-sm-6 col-md-4 fate-skills">
			<div class="form-group">
				<div class="fate-header col-12">Skills</div>
			</div>

			<div class="form-group row">
			  <label class="col-9 col-form-label">Fighter</label>
			  <div class="col-3">
				<input class="form-control text-center" type="text" id="approach[fighter]" name="approach[fighter]" @change="setVal('approaches.fighter', $event.target.value)" :value="getVal('approaches.fighter')" placeholder="+" />
			  </div>
			</div>

			<div class="form-group row">
			  <label class="col-9 col-form-label">Healer</label>
			  <div class="col-3">
				<input class="form-control text-center" type="text" id="approach[healer]" name="approach[healer]" @change="setVal('approaches.healer', $event.target.value)" :value="getVal('approaches.healer')" placeholder="+" />
			  </div>
			</div>

			<div class="form-group row">
			  <label class="col-9 col-form-label">Hunter</label>
			  <div class="col-3">
				<input class="form-control text-center" type="text" id="approach[hunter]" name="approach[hunter]" @change="setVal('approaches.hunter', $event.target.value)" :value="getVal('approaches.hunter')" placeholder="+" />
			  </div>
			</div>

			<div class="form-group row">
			  <label class="col-9 col-form-label">Scout</label>
			  <div class="col-3">
				<input class="form-control text-center" type="text" id="approach[scout]" name="approach[scout]" @change="setVal('approaches.scout', $event.target.value)" :value="getVal('approaches.scout')" placeholder="+" />
			  </div>
			</div>

			<div class="form-group row">
			  <label class="col-9 col-form-label">Orator</label>
			  <div class="col-3">
				<input class="form-control text-center" type="text" id="approach[orator]" name="approach[orator]" @change="setVal('approaches.orator', $event.target.value)" :value="getVal('approaches.orator')" placeholder="+" />
			  </div>
			</div>

			<div class="form-group row">
			  <label class="col-9 col-form-label">Craftsmouse</label>
			  <div class="col-3">
				<input class="form-control text-center" type="text" id="approach[craftsmouse]" name="approach[craftsmouse]" @change="setVal('approaches.craftsmouse', $event.target.value)" :value="getVal('approaches.craftsmouse')" placeholder="+" />
			  </div>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-12 col-md-6">
			<div class="form-group">
				<div for="stunts" class="fate-header">Stunts, Wises & Gear</div>
				<textarea class="form-control" id="stunts" name="stunts" rows="17" @change="setVal('stunts', $event.target.value)" :value="getVal('stunts')" placeholder="Stunts & Extras"></textarea>
			</div>
		</div>
		<div class="col-sm-12 col-md-6">
			<div class="form-group">
				<div class="fate-header">Portrait</div>
				<div class="col text-center">
					<img alt="Mouse Guard" class="img-fluid portrait" :src="getPortrait()" />
				</div>
			</div>
		</div>
	</div>

	<div class="row fate-conditions">
		<div class="col-12 form-group">
			<div for="" class="fate-header">Conditions</div>
		</div>

		<div class="col-sm-12 col-md-6">
			<div class="row">
			  <label for="stress" class="col-10">
				<u class="small">Fleeting</u>
			  </label>
			</div>

			<div class="row">
			  <label for="stress" class="col-10">
				Hungry/Thirsty
			  </label>
			  <input type="checkbox" value="1" id="condition[hungry]" name="condition[hungry]" @change="setVal('conditions.hungry', $event.target.checked)" :checked="getVal('conditions.hungry')" class="col-2" />
			</div>

			<div class="row">
			  <label for="stress" class="col-10">
				Angry
			  </label>
			  <input type="checkbox" value="2" id="condition[angry]" name="condition[angry]" @change="setVal('conditions.angry', $event.target.checked)" :checked="getVal('conditions.angry')" class="col-2" />
			</div>

			<div class="row">
			  <label for="stress" class="col-10">
				Frightened
			  </label>
			  <input type="checkbox" value="2" id="condition[frightened]" name="condition[frightened]" @change="setVal('conditions.frightened', $event.target.checked)" :checked="getVal('conditions.frightened')" class="col-2" />
			</div>

			<div class="row">
			  <label for="stress" class="col-10">
				<u class="small">Sticky</u>
			  </label>
			</div>
			<div class="row">
			  <label for="stress" class="col-10">
				Exhausted
			  </label>
			  <input type="checkbox" value="3" id="condition[exhausted]" name="condition[exhausted]" @change="setVal('conditions.exhausted', $event.target.checked)" :checked="getVal('conditions.exhausted')" class="col-2" />
			</div>

			<div class="row">
			  <label for="stress" class="col-10">
				Sick
			  </label>
			  <input type="checkbox" value="3" id="condition[sick]" name="condition[sick]" @change="setVal('conditions.sick', $event.target.checked)" :checked="getVal('conditions.sick')" class="col-2" />
			</div>
		</div>

		<div class="col-sm-12 col-md-6">
			<div class="row">
			  <label for="stress" class="col-10">
				<u class="small">Lasting</u>
			  </label>
			</div>

			<div class="row">
			  <label for="stress" class="col-8">
				Injured
			  </label>
			  <label class="col-1">2</label><input type="checkbox" value="2" id="condition[injured]" name="condition[injured]" class="col-3" @change="setVal('conditions.injured', $event.target.checked)" :checked="getVal('conditions.injured')" />
			</div>

			<div class="row">
			  <label for="stress" class="col-8">
				Wounded
			  </label>
			  <label class="col-1">3</label><input type="checkbox" value="3" id="condition[wounded]" name="condition[wounded]" class="col-3" @change="setVal('conditions.wounded', $event.target.checked)" :checked="getVal('conditions.wounded')" />
			</div>

			<div class="row">
			  <label for="stress" class="col-8">
				Broken
			  </label>
			  <label class="col-1">4</label><input type="checkbox" value="3" id="condition[broken]" name="condition[broken]" class="col-3" @change="setVal('conditions.broken', $event.target.checked)" :checked="getVal('conditions.broken')" />
			</div>
		</div>

	</div>

</div>
</template>

<script>
export default {
  name: 'SheetMouseGuard',
  props: {    
    character: Object,
  },
  mounted() {
   this.$parent.$parent.title = 'Mouse Guard (Character Sheet)';
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
    getPortrait() {		
        return this.character.image_url || "/static/sheets/mouse-guard/portrait.jpg";
    }
  }
}
</script>

<style lang="scss" scoped>
 @import url('https://fonts.googleapis.com/css?family=IM+Fell+English');

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
        font-family: 'IM Fell English', sans-serif;
        text-transform: uppercase;
		background-color: #000;
		color: white;
		font-weight: 700;
		padding: 3px;
		margin-top: 5px;
		font-size: 22px;
	}

	.col-form-label {
        font-family: 'IM Fell English', sans-serif;
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

</style>
