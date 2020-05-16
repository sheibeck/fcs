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

		<!-- aspects -->
		<div class="col-sm-6 col-md-4 fate-approaches">
			<div class="form-group">
				<div class="fate-header col-12">Approaches</div>
			</div>

			<div class="form-group row">
				<div class="col-9">
				  <input class="form-control approachlabel" type="text" id="approach[label1]" name="approach[label1]" @change="setVal('approaches.label1',  $event.target.value)" :value="getVal('approaches.label1')" placeholder="Careful">
				</div>
			  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[approach1]" name="approach[approach1]" @change="setVal('approaches.approach1',  $event.target.value)" :value="getVal('approaches.approach1')" placeholder="+">
			  </div>
			</div>

			<div class="form-group row">
				<div class="col-9">
			  	<input class="form-control approachlabel" type="text" id="approach[label2]" name="approach[label2]" @change="setVal('approaches.label2',  $event.target.value)" :value="getVal('approaches.label2')" placeholder="Clever">
				</div>
				<div class="col-3">
					<input class="form-control text-center" type="text" id="approach[approach2]" name="approach[approach2]" @change="setVal('approaches.approach2',  $event.target.value)" :value="getVal('approaches.approach2')" placeholder="+">
			  </div>
			</div>

			<div class="form-group row">
				<div class="col-9">
			  	<input class="form-control approachlabel" type="text" id="approach[label3]" name="approach[label3]" @change="setVal('approaches.label3',  $event.target.value)" :value="getVal('approaches.label3')" placeholder="Flashy">
				</div>
			  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[approach3]" name="approach[approach3]" @change="setVal('approaches.approach3',  $event.target.value)" :value="getVal('approaches.approach3')" placeholder="+">
			  </div>
			</div>

			<div class="form-group row">
				<div class="col-9">
				  <input class="form-control approachlabel" type="text" id="approach[label4]" name="approach[label4]" @change="setVal('approaches.label4',  $event.target.value)" :value="getVal('approaches.label4')" placeholder="Forceful">
				</div>
				<div class="col-3">
					<input class="form-control text-center" type="text" id="approach[approach4]" name="approach[approach4]" @change="setVal('approaches.approach4',  $event.target.value)" :value="getVal('approaches.approach4')" placeholder="+">
			  </div>
			</div>

			<div class="form-group row">
				<div class="col-9">
			  	<input class="form-control approachlabel" type="text" id="approach[label5]" name="approach[label5]" @change="setVal('approaches.label5',  $event.target.value)" :value="getVal('approaches.label5')" placeholder="Quick">
				</div>
			  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[approach5]" name="approach[approach5]" @change="setVal('approaches.approach5',  $event.target.value)" :value="getVal('approaches.approach5')" placeholder="+">
			  </div>
			</div>

			<div class="form-group row">
				<div class="col-9">
			  	<input class="form-control approachlabel" type="text" id="approach[label6]" name="approach[label6]" @change="setVal('approaches.label6',  $event.target.value)" :value="getVal('approaches.label6')" placeholder="Sneaky">
				</div>
			  <div class="col-3">
					<input class="form-control text-center" type="text" id="approach[approach6]" name="approach[approach6]" @change="setVal('approaches.approach6',  $event.target.value)" :value="getVal('approaches.approach6')" placeholder="+">
			  </div>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col">
			<div class="form-group">
				<div for="stunts" class="fate-header">Stunts & Extras</div>
				<textarea class="form-control" id="stunts" name="stunts" rows="25" placeholder="Stunts & Extras" @change="setVal('stunts',  $event.target.value)" :value="getVal('stunts')"></textarea>
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
				  <input type="checkbox" value="1" id="stress[stress1]" name="stress[stress1]" @change="setVal('stress.stress1',  $event.target.checked)" :checked="getVal('stress.stress1')" />
				</div>

				<div class="col">
				  <label for="stress">
					2
				  </label>
				  <input type="checkbox" value="2" id="stress[stress2]" name="stress[stress2]" @change="setVal('stress.stress2',  $event.target.checked)" :checked="getVal('stress.stress2')" />
				</div>

				<div class="col">
				  <label class="" for="stress">
					3
				  </label>
				  <input type="checkbox" value="3" id="stress[stress3]" name="stress[stress3]" @change="setVal('stress.stress3',  $event.target.checked)" :checked="getVal('stress.stress3')" />
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
				<input class="form-control" type="text" id="consequence[mild]" name="consequence[mild]" placeholder="Mild" @change="setVal('consequence.mild',  $event.target.value)" :value="getVal('consequence.mild')" />
			  </div>
			</div>

			<div class="form-group row">
			  <label class="col-2 col-form-label">4</label>
			  <div class="col-10">
				<input class="form-control" type="text" id="consequence[moderate]" name="consequence[moderate]" placeholder="Moderate" @change="setVal('consequence.moderate',  $event.target.value)" :value="getVal('consequence.moderate')" />
			  </div>
			</div>

			<div class="form-group row">
			  <label class="col-2 col-form-label">6</label>
			  <div class="col-10">
				<input class="form-control" type="text" id="consequence[severe]" name="consequence[severe]" placeholder="Severe" @change="setVal('consequence.severe',  $event.target.value)" :value="getVal('consequence.severe')" />
			  </div>
			</div>
		</div>
	</div>

</div>
</template>

<script>
export default {
  name: 'SheetFateAcceleratedCustom',
  props: {    
    character: Object,
  },
  mounted() {
   this.$parent.$parent.title = 'Fate Accelerated Custom (Character Sheet)';
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

	input.approachlabel {
		font-family: 'Archivo Black', sans-serif;
		text-transform: uppercase;
		font-size: 22px;
		font-weight: 700;
		border: 0;
		outline: 0;
		background: transparent;
		border-bottom: 1px solid lightgray;
	}

	.fate-approaches .form-group {
		margin-bottom: 3px;
		margin-top: 3px;
	}

	input.approachlabel {
		font-family: 'Archivo Black', sans-serif;
    	text-transform: uppercase;
		font-size: 22px;
		font-weight: 700;
		border: 0;
		outline: 0;
		background: transparent;
		border-bottom: 1px solid lightgray;
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

</style>
