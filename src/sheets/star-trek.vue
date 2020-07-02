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
						<input type="number" class="form-control text-center" id="refresh" name="refresh" @change="setVal('refresh', $event.target.value)" :value="getVal('refresh')" placeholder="Refresh" />
					</div>
					<div class="col-6 text-center ">										
						<div for="fatepoints" class="fate-header">
							FP <span v-if="vttEnabled" class='dice fo20 font-weight-normal small'>A</span>
						</div>	
						<inputfatepoints />
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
			<div class="col-12 col-md-6">
				<inputstuntextra item="stunts" :rows="25" :border="true" header="Stunts" />
			</div>
			<div class="col-12 col-md-6">
				<inputstuntextra item="extras" :rows="25" :border="true" header="Extras" />
			</div>
		</div>

		<div class="row">
			<!-- stress -->
			<div class="col-sm-6 col-md-4 fate-stress">
				<div class="form-group">
					<div for="" class="fate-header">Stress <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>
				</div>
				<div class="d-flex justify-content-between">
					<div v-for="stress in stresses" :key="stress.obj">
						<inputstress :stress="stress" />
					</div>
				</div>
			</div>

			<div class="col-sm-6 col-md-8 fate-consequences">
				<div class="form-group">
					<div class="fate-header col-12">Consequences <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></div>
				</div>

				<div v-for="consequence in consequences" :key="consequence.obj">
					<inputconsequence :consequence="consequence" />
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import InputSkillColumn from '../components/input-skill-column'
import InputAspect from '../components/input-aspect'
import InputConsequence from '../components/input-consequence'
import InputStress from '../components/input-stress'
import InputStuntExtra from '../components/input-stuntextra'
import InputFatePoints from '../components/input-fatepoints'
import { mapGetters } from 'vuex'

export default {
  name: 'SheetStarTrek',
    components: {
	"inputapproach": InputSkillColumn,    
	"inputaspect": InputAspect,
	"inputconsequence": InputConsequence,
	"inputstress": InputStress,
	"inputstuntextra": InputStuntExtra,
	"inputfatepoints": InputFatePoints,	
  },
  props: {    
    character: Object,
  },
  computed: {
 	...mapGetters([      
      'vttEnabled'
    ]),
  },
  mounted() {
   this.$parent.$parent.title = 'Star Trek (Character Sheet)';
  },
  data () {
    return {
		approaches:  [
			{placeholder:"Command", obj:"approaches.command"},
			{placeholder:"Security", obj:"approaches.security"},
			{placeholder:"Science", obj:"approaches.science"},
			{placeholder:"Conn", obj:"approaches.conn"},
			{placeholder:"Engineering", obj:"approaches.engineering"},
			{placeholder:"Medicine", obj:"approaches.medicine"},
		],
		aspects: [
			{label:"High Concept", obj:"aspects.highconcept"},
			{label:"Trouble", obj:"aspects.trouble"},
			{label:"Aspect", obj:"aspects.other1"},
			{label:"Aspect", obj:"aspects.other2"},
			{label:"Aspect", obj:"aspects.other3"},			
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
		]	
    }
  },
  methods: {  
    getVal(graphPath, defaultValue) {
    	return this.$parent.getVal(this.character, graphPath, defaultValue);
    },
    setVal(arr, val) {
    	this.$parent.setVal(this.character, arr, val);       
	},
	sendToVTT(type, label, obj, item, skillType) {		
		let characterName = this.character.name;
		switch(type)
		{
			case "fatepoint":
				this.$parent.sendToVTT(type, characterName, null, item);
				break;
			case "stress":
			case "consequence":
			case "stuntextra":
				this.$parent.sendToVTT(type, characterName, label, item);
				break;
			default:
				if (this.getVal(item)) {
					this.$parent.sendToVTT(type, characterName, label, this.getVal(item), skillType);
				}
				break;
		}
	},	
  }
}
</script>

<style lang="scss" scoped>
 @import url('https://fonts.googleapis.com/css?family=Teko:600');

	.fate-logo {
		margin-top: -27px;
		max-height: 130px;
	}

	.fate-ship-logo {
		max-height: 260px;
		margin-top: 25px;
	}

	/deep/ .fate-header {
        font-family: 'Teko', sans-serif;
        text-transform: uppercase;
		background-color: #000;
		color: white;
		font-weight: 700;
		padding: 3px;
		margin-top: 5px;
		font-size: 22px;
	}

	/deep/ .col-form-label {
        font-family: 'Teko', sans-serif;
        text-transform: uppercase;
		font-size: 22px;
		font-weight: 700;
	}

	/deep/ .fate-approaches .form-group {
		margin-bottom: 3px;
		margin-top: 3px;
	}

	/deep/ .fate-aspects .form-group {
		margin-bottom: 12px;
		margin-top: 0px;
	}

	/deep/ .fate-consequences .form-group {
		margin-bottom: 0px;
		margin-top: 1px;
	}

	/deep/ input[type=checkbox] {
		height: 50px;
		width: 50px;
	}

	/deep/ .fate-consequences label {
        font-family: 'Teko', sans-serif;
        text-transform: uppercase;
		font-weight: 700;
		font-size: 28px;
		padding-top: 0px;
		padding-bottom: 0px;		
	}

	/deep/ .fate-stress label {
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
