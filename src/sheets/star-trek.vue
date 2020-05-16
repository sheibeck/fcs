<template>
<div class="sheet">
	<div class="page">
		<div class="row">
			<div class="col-sm-6 col-md-4 order-md-2">
				<div class="row">
					<div class="col text-center">
							<img alt="Star Trek" class="img-fluid fate-logo" :src="$parent.GetSheetImage()" />
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
				<div class="form-group">
					<input type="text" class="form-control" id="aspect[other4]" name="aspect[other4]" @change="setVal('aspects.other4', $event.target.value)" :value="getVal('aspects.other4')" placeholder="Aspect" />
				</div>
			</div>

			<!-- aspects -->
			<div class="col-sm-6 col-md-4 fate-approaches">
				<div class="form-group">
					<div class="fate-header col-12">Approaches</div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Command</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[command]" name="approach[command]" @change="setVal('approaches.command', $event.target.value)" :value="getVal('approaches.command')" placeholder="+" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Security</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[security]" name="approach[security]" @change="setVal('approaches.security', $event.target.value)" :value="getVal('approaches.security')" placeholder="+" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Science</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[science]" name="approach[science]" @change="setVal('approaches.science', $event.target.value)" :value="getVal('approaches.science')" placeholder="+" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Conn</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[conn]" name="approach[conn]" @change="setVal('approaches.conn', $event.target.value)" :value="getVal('approaches.conn')" placeholder="+" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Engineering</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[engineering]" name="approach[engineering]" @change="setVal('approaches.engineering', $event.target.value)" :value="getVal('approaches.engineering')" placeholder="+" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Medicine</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[medicine]" name="approach[medicine]" @change="setVal('approaches.medicine', $event.target.value)" :value="getVal('approaches.medicine')" placeholder="+" />
				  </div>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-12 col-md-6">
				<div class="form-group">
					<div for="stunts" class="fate-header">Stunts</div>
					<textarea class="form-control" id="stunts" name="stunts" rows="25" @change="setVal('stunts', $event.target.value)" :value="getVal('stunts')" placeholder="Stunt"></textarea>
				</div>
			</div>
			<div class="col-12 col-md-6">
				<div class="form-group">
					<div for="stunts" class="fate-header">Extras</div>
					<textarea class="form-control" id="extras" name="extras" rows="25" @change="setVal('extras', $event.target.value)" :value="getVal('extras')" placeholder="Extras"></textarea>
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
					  <label for="stress">
						1
					  </label>
					  <input type="checkbox" value="1" id="stress[stress1]" name="stress[stress1]" @change="setVal('stress.stress1', $event.target.checked)" :checked="getVal('stress.stress1')" />
					</div>

					<div class="col">
					  <label for="stress">
						2
					  </label>
					  <input type="checkbox" value="2" id="stress[stress2]" name="stress[stress2]" @change="setVal('stress.stress2', $event.target.checked)" :checked="getVal('stress.stress2')" />
					</div>

					<div class="col">
					  <label class="" for="stress">
						3
					  </label>
					  <input type="checkbox" value="3" id="stress[stress3]" name="stress[stress3]" @change="setVal('stress.stress3', $event.target.checked)" :checked="getVal('stress.stress3')" />
					</div>
				</div>
			</div>

			<div class="col-sm-6 col-md-8 fate-consequences">
				<div class="form-group">
					<div class="fate-header col-12">Consequences</div>
				</div>

				<div class="form-group row">
				  <label class="col-2 col-form-label">2</label>
				  <div class="col-10">
					<input class="form-control" type="text" id="consequence[mild]" name="consequence[mild]" @change="setVal('consequences.mild', $event.target.value)" :value="getVal('consequences.mild')" placeholder="Mild" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-2 col-form-label">4</label>
				  <div class="col-10">
					<input class="form-control" type="text" id="consequence[moderate]" name="consequence[moderate]" @change="setVal('consequences.moderate', $event.target.value)" :value="getVal('consequences.moderate')" placeholder="Moderate" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-2 col-form-label">6</label>
				  <div class="col-10">
					<input class="form-control" type="text" id="consequence[severe]" name="consequence[severe]" @change="setVal('consequences.severe', $event.target.value)" :value="getVal('consequences.severe')" placeholder="Severe" />
				  </div>
				</div>
			</div>
		</div>
	</div>

	<hr />

	<div class="page">
		<div class="row">
			<div class="col-sm-6 col-md-4 order-md-2">
				<div class="row">
					<div class="col text-center">
						<img alt="Star Trek Ship" class="img-fluid fate-ship-logo" src="/static/sheets/star-trek/ship-logo.png" />
					</div>
				</div>
			</div>

			<div class="col-sm-6 col-md-8 order-md-1">
				<div class="form-group">
					<div for="name" class="fate-header">Ship Name</div>
					<input type="text" class="form-control" id="ship_name" name="ship_name" @change="setVal('ship_name', $event.target.value)" :value="getVal('ship_name')" placeholder="Ship Name" />
				</div>

				<div class="form-group">
					<textarea class="form-control" id="ship_description" name="ship_description" rows="3" @change="setVal('ship_description', $event.target.value)" :value="getVal('ship_description')" placeholder="Description"></textarea>
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
					<input type="text" class="form-control" id="aspect[ship_highconcept]" name="aspect[ship_highconcept]" @change="setVal('aspects.ship_highconcept', $event.target.value)" :value="getVal('aspects.ship_highconcept')" placeholder="High Concept" />
				</div>
				<div class="form-group">
					<input type="text" class="form-control" id="aspect[ship_trouble]" name="aspect[ship_trouble]" @change="setVal('aspects.ship_trouble', $event.target.value)" :value="getVal('aspects.ship_trouble')" placeholder="Trouble" />
				</div>
				<div class="form-group">
					<input type="text" class="form-control" id="aspect[ship_other1]" name="aspect[ship_other1]" @change="setVal('aspects.ship_other1', $event.target.value)" :value="getVal('aspects.ship_other1')" placeholder="Aspect" />
				</div>
				<div class="form-group">
					<input type="text" class="form-control" id="aspect[ship_other2]" name="aspect[ship_other2]" @change="setVal('aspects.ship_other2', $event.target.value)" :value="getVal('aspects.ship_other2')" placeholder="Aspect" />
				</div>
				<div class="form-group">
					<input type="text" class="form-control" id="aspect[ship_other3]" name="aspect[ship_other3]" @change="setVal('aspects.ship_other3', $event.target.value)" :value="getVal('aspects.ship_other3')" placeholder="Aspect" />
				</div>
				<div class="form-group">
					<input type="text" class="form-control" id="aspect[ship_other4]" name="aspect[ship_other4]" @change="setVal('aspects.ship_other4', $event.target.value)" :value="getVal('aspects.ship_other4')" placeholder="Aspect" />
				</div>
			</div>

			<!-- aspects -->
			<div class="col-sm-6 col-md-4 fate-approaches">
				<div class="form-group">
					<div class="fate-header col-12">Approaches</div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Engines</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[engines]" name="approach[engines]" @change="setVal('approaches.engines', $event.target.value)" :value="getVal('approaches.engines')" placeholder="+" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Computers</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[computers]" name="approach[computers]" @change="setVal('approaches.computers', $event.target.value)" :value="getVal('approaches.computers')" placeholder="+" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Weapons</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[weapons]" name="approach[weapons]" @change="setVal('approaches.weapons', $event.target.value)" :value="getVal('approaches.weapons')" placeholder="+" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Structure</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[structure]" name="approach[structure]" @change="setVal('approaches.structure', $event.target.value)" :value="getVal('approaches.structure')" placeholder="+" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Sensors</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[sensors]" name="approach[sensors]" @change="setVal('approaches.sensors', $event.target.value)" :value="getVal('approaches.sensors')" placeholder="+" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-9 col-form-label">Communications</label>
				  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[communications]" name="approach[communications]" @change="setVal('approaches.communications', $event.target.value)" :value="getVal('approaches.communications')" placeholder="+" />
				  </div>
				</div>


			</div>
		</div>

		<div class="row">
			<div class="col-12 col-md-6">
				<div class="form-group">
					<div for="stunts" class="fate-header">Stunts</div>
					<textarea class="form-control" id="ship_stunts" name="ship_stunts" rows="25" @change="setVal('ship_stunts', $event.target.value)" :value="getVal('ship_stunts')" placeholder="Stunt"></textarea>
				</div>
			</div>
			<div class="col-12 col-md-6">
				<div class="form-group">
					<div for="stunts" class="fate-header">Extras</div>
					<textarea class="form-control" id="ship_extras" name="ship_extras" rows="25" @change="setVal('ship_extras', $event.target.value)" :value="getVal('ship_extras')" placeholder="Extras"></textarea>
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
					  <label for="stress">
						1
					  </label>
					  <input type="checkbox" value="1" id="stress[ship_stress1]" name="stress[ship_stress1]" @change="setVal('stress.ship_stress1', $event.target.checked)" :checked="getVal('stress.ship_stress1')" />
					</div>

					<div class="col">
					  <label for="stress">
						2
					  </label>
					  <input type="checkbox" value="2" id="stress[ship_stress2]" name="stress[ship_stress2]" @change="setVal('stress.ship_stress2', $event.target.checked)" :checked="getVal('stress.ship_stress2')" />
					</div>

					<div class="col">
					  <label class="" for="stress">
						3
					  </label>
					  <input type="checkbox" value="3" id="stress[ship_stress3]" name="stress[ship_stress3]" @change="setVal('stress.ship_stress3', $event.target.checked)" :checked="getVal('stress.ship_stress3')" />
					</div>
				</div>
			</div>

			<div class="col-sm-6 col-md-8 fate-consequences">
				<div class="form-group">
					<div class="fate-header col-12">Consequences</div>
				</div>

				<div class="form-group row">
				  <label class="col-2 col-form-label">2</label>
				  <div class="col-10">
					<input class="form-control" type="text" id="consequence[ship_mild]" name="consequence[ship_mild]" @change="setVal('consequences.ship_mild', $event.target.value)" :value="getVal('consequences.ship_mild')" placeholder="Mild" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-2 col-form-label">4</label>
				  <div class="col-10">
					<input class="form-control" type="text" id="consequence[ship_moderate]" name="consequence[ship_moderate]" @change="setVal('consequences.ship_moderate', $event.target.value)" :value="getVal('consequences.ship_moderate')" placeholder="Moderate" />
				  </div>
				</div>

				<div class="form-group row">
				  <label class="col-2 col-form-label">6</label>
				  <div class="col-10">
					<input class="form-control" type="text" id="consequence[ship_severe]" name="consequence[ship_severe]" @change="setVal('consequences.ship_severe', $event.target.value)" :value="getVal('consequences.ship_severe')" placeholder="Severe" />
				  </div>
				</div>
			</div>
		</div>

	</div>

</div>
</template>

<script>
export default {
  name: 'SheetStarTrek',
  props: {    
    character: Object,
  },
  mounted() {
   this.$parent.$parent.title = 'Star Trek (Character Sheet)';
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
 @import url('https://fonts.googleapis.com/css?family=Teko:600');

	.sheet {
		margin: 20px;
		margin-top: 40px;
		max-width: 1024px;
	}

	.fate-logo {
		margin-top: -27px;
		max-height: 130px;
	}

	.fate-ship-logo {
		max-height: 260px;
		margin-top: 25px;
	}

	.fate-header {
        font-family: 'Teko', sans-serif;
        text-transform: uppercase;
		background-color: #000;
		color: white;
		font-weight: 700;
		padding: 3px;
		margin-top: 5px;
		font-size: 22px;
	}

	.col-form-label {
        font-family: 'Teko', sans-serif;
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
        font-family: 'Teko', sans-serif;
        text-transform: uppercase;
		font-weight: 700;
		font-size: 28px;
		padding-top: 0px;
		padding-bottom: 0px;
		padding-left: 25px;
	}

	.fate-stress label {
        font-family: 'Teko', sans-serif;
        text-transform: uppercase;
		font-size: 30px;
		font-weight: 700;
		margin-left: -5px;
		margin-right: -5px;
	}

	.page {
		margin-top: 25px;
	}

	.page:first-child {
		margin-top: auto;
	}

	@media print {
		.page {
			page-break-before: always;
		}

		.page:first-child {
			page-break-before: avoid;
		}

		hr {
			display: none;
		}
	}
</style>
