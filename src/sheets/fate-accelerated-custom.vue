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
					<input type="number" class="form-control text-center" id="refresh" name="refresh" @change="setVal('refresh',  $event.target.value)" :value="getVal('refresh')" placeholder="Refresh" />
				</div>
				<div class="col-6 text-center ">
					<div for="fatepoints" class="fate-header">
						FP <span v-if="roll20Enabled" class='dice fo20 font-weight-normal small'>A</span>
					</div>							
					<input type="number" class="form-control text-center" id="fatepoints" name="fatepoints" @change="setVal('fatepoints',  $event.target.value)" :value="getVal('fatepoints')" placeholder="Fate Points" />					
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
			<div v-for="aspect in aspects" :key="aspect.obj">
				<inputaspect :aspect="aspect" />
			</div>
		</div>

		<!-- aspects -->
		<div class="col-sm-6 col-md-4 fate-approaches">
			<div class="form-group">
				<div class="fate-header col-12">Approaches</div>
			</div>
			
			<div v-for="approach in approaches" :key="approach.obj">
				<inputapproach :item="approach" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col">		
			<inputstuntextra :item="stunts" :rows="25" :border="true" header="Stunts &amp; Extras" />
		</div>
	</div>

	<div class="row">
		<!-- stress -->
		<div class="col-sm-6 col-md-4 fate-stress">
			<div class="form-group">
				<div for="" class="fate-header">Stress <span v-if="roll20Enabled" class='dice fo20 font-weight-normal small'>D</span></div>
			</div>

			<div class="d-flex">
				<div v-for="stress in stresses" :key="stress.obj">
					<inputstress :stress="stress" />
				</div>
			</div>
		</div>

		<div class="col-sm-6 col-md-8 fate-consequences">
			<div class="form-group">
				<div class="fate-header col-12">Consequences <span v-if="roll20Enabled" class='dice fo20 font-weight-normal small'>D</span></div>
			</div>

			<div v-for="consequence in consequences" :key="consequence.obj">
				<inputconsequence :consequence="consequence" />
			</div>

		</div>
	</div>

</div>
</template>

<script>

import InputSkillColumn from '../components/input-skill-column'
import InputAspect from '../components/input-aspect'
import InputConsequence from '../components/input-consequence'
import InputStressAccelerated from '../components/input-accelerated-stress'
import InputStuntExtra from '../components/input-stuntextra'
import { mapGetters } from 'vuex'

export default {
  name: 'SheetFateAcceleratedCustom',
  components: {
	"inputapproach": InputSkillColumn,    
	"inputaspect": InputAspect,
	"inputconsequence": InputConsequence,
	"inputstress": InputStressAccelerated,
	"inputstuntextra": InputStuntExtra,
  },
  props: {    
    character: Object,
  },
  computed: {
 	...mapGetters([  
      'roll20Enabled'
    ]),
  },
  mounted() {
   this.$parent.$parent.title = 'Fate Accelerated Custom (Character Sheet)';
  },
  data () {
    return {		
		approaches:  [
			{placeholder:"Careful", obj:"approaches.approach1", label:"approaches.label1"},
			{placeholder:"Clever", obj:"approaches.approach2", label:"approaches.label2"},
			{placeholder:"Flashy", obj:"approaches.approach3", label:"approaches.label3"},
			{placeholder:"Forceful", obj:"approaches.approach4", label:"approaches.label4"},
			{placeholder:"Quick", obj:"approaches.approach5", label:"approaches.label5"},
			{placeholder:"Sneaky", obj:"approaches.approach6", label:"approaches.label6"},
		],
		aspects: [
			{label:"High Concept", obj:"aspects.highconcept"},
			{label:"Trouble", obj:"aspects.trouble"},
			{label:"Aspect", obj:"aspects.other1"},
			{label:"Aspect", obj:"aspects.other2"},
			{label:"Aspect", obj:"aspects.other3"},
			{label:"Aspect", obj:"aspects.other4"},
		],
		consequences: [
			{label:"Mild", obj:"consequences.mild", value: "2"},
			{label:"Moderate", obj:"consequences.moderate", value: "4"},
			{label:"Severe", obj:"consequences.severe", value: "6"},			
		],
		stresses: [
			{label:"1", obj:"stress1"},
			{label:"2", obj:"stress2"},
			{label:"3", obj:"stress3"},			
		],
		stunts: "stunts"
    }
  },
  methods: {   
	getVal(graphPath, defaultValue) {
    	return this.$parent.getVal(this.character, graphPath, defaultValue);
    },
    setVal(arr, val) {		
		if (this.roll20Enabled && arr === 'fatepoints') {
			this.roll20FatePoints(arr,val)
		} else {
			this.$parent.setVal(this.character, arr, val);
		}
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
	roll20FatePoints(arr,val) {
		if(arr === 'fatepoints')
		{
			let oldVal = this.character[arr];
			if (!oldVal || (parseInt(oldVal) < parseInt(val))) {
				this.sendToRoll20("fatepoint", null, arr, "1");
			}
			else {
				this.sendToRoll20("fatepoint", null, arr, "-1");
			}
		}
		this.$parent.setVal(this.character, arr, val);
		this.$parent.$parent.save();
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

	.col-form-label {
		font-family: 'Archivo Black', sans-serif;
		text-transform: uppercase;
		font-size: 22px;
		font-weight: 700;
	}

	.fate-approaches .form-group {
		margin-bottom: 3px;
		margin-top: 3px;
	}

	/deep/ input.inputlabel {
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

</style>
