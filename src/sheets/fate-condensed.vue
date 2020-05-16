<template>
<div class="sheet">
	<div class="row">		
		<div class="col-sm-6">
			<div class="form-group">
				<input type="text" class="form-control" id="name" name="name" @change="setVal('name',  $event.target.value)" :value="getVal('name')" placeholder="Name" />
			</div>
		</div>
		<div class="col-sm-6 text-center order-md-2 text-md-right pb-2 pb-md-0">
			<img alt="Fate Condensed" class="img-fluid fate-logo" :src="$parent.GetSheetImage()" />
		</div>
	</div>

	<div class="row">
		<!-- aspects -->
		<div class="col-sm-6 col-md-7 fate-aspects px-0" style="border-right: 2px solid #3A5224;">
			<div for="" class="fate-header">Aspects</div>
			<div class="px-3">
				<div class="form-group mb-0">
					<div class="row">
						<div class="col">
							<label>High Concept</label>
							<input type="text" class="form-control" id="aspects[highconcept]" name="aspects[highconcept]" @change="setVal('aspects.highconcept',  $event.target.value)" :value="getVal('aspects.highconcept')" placeholder="High Concept" />
						</div>						
					</div>
				</div>
				<div class="form-group">
					<div class="row">
						<div class="col">
							<label>Trouble</label>
							<input type="text" class="form-control" id="aspects[trouble]" name="aspects[trouble]" @change="setVal('aspects.trouble',  $event.target.value)" :value="getVal('aspects.trouble')" placeholder="Trouble" />
						</div>					
					</div>
				</div>
				<div class="form-group">
					<div class="row">
						<div class="col">
							<label>Relationship</label>
							<input type="text" class="form-control" id="aspects[relationship]" name="aspects[relationship]" @change="setVal('aspects.relationship',  $event.target.value)" :value="getVal('aspects.relationship')" placeholder="Relationship" />
						</div>						
					</div>
				</div>
				<div class="form-group">
					<div class="row">
						<div class="col">
							<label>Other Aspect</label>
							<input type="text" class="form-control" id="aspects[other1]" name="aspects[other1]" @change="setVal('aspects.other1',  $event.target.value)" :value="getVal('aspects.other1')" placeholder="Other Aspect" />
						</div>					
					</div>
				</div>
				<div class="form-group">
					<div class="row">
						<div class="col">
							<label>Other Aspect</label>
							<input type="text" class="form-control" id="aspects[other2]" name="aspects[other2]" @change="setVal('aspects.other2',  $event.target.value)" :value="getVal('aspects.other2')" placeholder="Other Aspect" />
						</div>						
					</div>
				</div>
			</div>

			<div for="" class="fate-header">Regular Stunts</div>

			<div class="px-3">
				<div class="form-group mb-0 pb-4">
					<div class="small text-muted font-italic">Start with three stunts for free. You may buy additional stunts for 1 Refresh each, so long as your Refresh remains at or above 1.</div>
					<textarea class="form-control" id="stunts" name="stunts" rows="14" @change="setVal('stunts',  $event.target.value)" :value="getVal('stunts')" placeholder="Regular Stunts"></textarea>
				</div>
			</div>		

			<div class="fate-header mb-5 mb-sm-0">
				<div class="d-flex">
					<input class="refresh center" id="refresh" name="refresh" @change="setVal('refresh',  $event.target.value)" :value="getVal('refresh')" placeholder="3" /> <div class="pt-0">Refresh</div>
				</div>
			</div>
		</div>

		<!-- Vitals and Skills -->
		<div class="col-sm-6 col-md-5 fate-skills px-0 mt-3 mt-sm-0">
			<div class="fate-header col-12">Vitals</div>

			<div class="px-3">				
				<!-- Stress -->
				<div class="form-group text-center font-weight-bold">
					<div class="col-12">STRESS</div>
				</div>

				<!-- physical stress -->
				<div class="d-flex flex-row ">
					<div class="form-group font-weight-bold  pr-2 pt-2 mr-auto">
						PHYSICAL
					</div>
					<input type="checkbox" value="1" id="stress[stress1]" name="stress[stress1]" @change="setVal('stress.stress1',  $event.target.checked)" :checked="getVal('stress.stress1')" />
					<input type="checkbox" value="1" id="stress[stress2]" name="stress[stress2]" @change="setVal('stress.stress2',  $event.target.checked)" :checked="getVal('stress.stress2')" />
					<input type="checkbox" value="1" id="stress[stress3]" name="stress[stress3]" @change="setVal('stress.stress3',  $event.target.checked)" :checked="getVal('stress.stress3')" />
					<input type="checkbox" value="1" id="stress[stress4]" name="stress[stress4]" @change="setVal('stress.stress4',  $event.target.checked)" :checked="getVal('stress.stress4')" :disabled="!skillHasValue('skill13', 1)" />
					<input type="checkbox" value="1" id="stress[stress5]" name="stress[stress5]" @change="setVal('stress.stress5',  $event.target.checked)" :checked="getVal('stress.stress5')" :disabled="!skillHasValue('skill13', 3)" />
					<input type="checkbox" value="1" id="stress[stress6]" name="stress[stress6]" @change="setVal('stress.stress6',  $event.target.checked)" :checked="getVal('stress.stress6')" :disabled="!skillHasValue('skill13', 3)" />
				</div>

				<!-- mental stress -->
				<div class="d-flex flex-row">
					<div class="form-group font-weight-bold pr-3 pt-2 mr-auto">
						MENTAL
					</div>
					<input type="checkbox" value="1" id="stress[mental1]" name="stress[mental1]" @change="setVal('stress.mental1',  $event.target.checked)" :checked="getVal('stress.mental1')" />
					<input type="checkbox" value="1" id="stress[mental2]" name="stress[mental2]" @change="setVal('stress.mental2',  $event.target.checked)" :checked="getVal('stress.mental2')" />
					<input type="checkbox" value="1" id="stress[mental3]" name="stress[mental3]" @change="setVal('stress.mental3',  $event.target.checked)" :checked="getVal('stress.mental3')" />
					<input type="checkbox" value="1" id="stress[mental4]" name="stress[mental4]" @change="setVal('stress.mental4',  $event.target.checked)" :checked="getVal('stress.mental4')" :disabled="!skillHasValue('skill19', 1)" />
					<input type="checkbox" value="1" id="stress[mental5]" name="stress[mental5]" @change="setVal('stress.mental5',  $event.target.checked)" :checked="getVal('stress.mental5')" :disabled="!skillHasValue('skill19', 3)" />
					<input type="checkbox" value="1" id="stress[mental6]" name="stress[mental6]" @change="setVal('stress.mental6',  $event.target.checked)" :checked="getVal('stress.mental6')" :disabled="!skillHasValue('skill19', 3)" />
				</div>

				<!-- consequences -->
				<div class="form-group text-center font-weight-bold">
					<div class="col-12">CONSEQUENCES</div>
				</div>

				<div class="form-group row">
					<label class="col-2 col-form-label">2</label>
					<div class="col-10">
						<input class="form-control" type="text" id="consequences[mild]" name="consequences[mild]" @change="setVal('consequences.mild',  $event.target.value)" :value="getVal('consequences.mild')" placeholder="Mild" />
					</div>
				</div>

				<div class="form-group row">
					<label class="col-2 col-form-label">4</label>
					<div class="col-10">
						<input class="form-control" type="text" id="consequences[moderate]" name="consequences[moderate]" @change="setVal('consequences.moderate',  $event.target.value)" :value="getVal('consequences.moderate')" placeholder="Moderate" />
					</div>
				</div>

				<div class="form-group row">
					<label class="col-2 col-form-label">6</label>
					<div class="col-10">
						<input class="form-control" type="text" id="consequences[severe]" name="consequences[severe]" @change="setVal('consequences.severe',  $event.target.value)" :value="getVal('consequences.severe')" placeholder="Severe" />
					</div>
				</div>

				<div class="form-group row">
					<label class="col-2 col-form-label stat-requirement">2</label>
					<div class="col-10">
						<input class="form-control" type="text" id="consequences[mild2]" name="consequences[mild2]" placeholder="Mild" @change="setVal('consequences.mild2',  $event.target.value)" :value="getVal('consequences.mild2')" :disabled="!skillHasValue('skill13|skill19', 5)" />
					</div>
				</div>
			</div>

			<!-- Skills -->
			<div class="fate-header col-12">Skills</div>

			<div class="px-3 skills">
				<div class="small text-muted font-italic">Click to edit skill names. Bonus stress is still calculated from value of physique/will slots even if you rename them.</div>
				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill1]" name="skills[skill1]" @change="setVal('skills.skill1',  $event.target.value)" :value="getVal('skills.skill1')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label1]" name="skills[label1]" @change="setVal('skills.label1',  $event.target.value)" :value="getVal('skills.label1')" placeholder="ACADEMICS" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill2]" name="skills[skill2]" @change="setVal('skills.skill2',  $event.target.value)" :value="getVal('skills.skill2')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label2]" name="skills[label2]" @change="setVal('skills.label2',  $event.target.value)" :value="getVal('skills.label2')" placeholder="ATHLETICS" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill3]" name="skills[skill3]" @change="setVal('skills.skill3',  $event.target.value)" :value="getVal('skills.skill3')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label3]" name="skills[label3]" @change="setVal('skills.label3',  $event.target.value)" :value="getVal('skills.label3')" placeholder="BURGLARY" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill4]" name="skills[skill4]" @change="setVal('skills.skill4',  $event.target.value)" :value="getVal('skills.skill4')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label4]" name="skills[label4]" @change="setVal('skills.label4',  $event.target.value)" :value="getVal('skills.label4')" placeholder="CONTACTS" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill5]" name="skills[skill5]" @change="setVal('skills.skill5',  $event.target.value)" :value="getVal('skills.skill5')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label5]" name="skills[label5]" @change="setVal('skills.label5',  $event.target.value)" :value="getVal('skills.label5')" placeholder="CRAFTS" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill6]" name="skills[skill6]" @change="setVal('skills.skill6',  $event.target.value)" :value="getVal('skills.skill6')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label6]" name="skills[label6]" @change="setVal('skills.label6',  $event.target.value)" :value="getVal('skills.label6')" placeholder="DECEIVE" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill7]" name="skills[skill7]" @change="setVal('skills.skill7',  $event.target.value)" :value="getVal('skills.skill7')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label7]" name="skills[label7]" @change="setVal('skills.label7',  $event.target.value)" :value="getVal('skills.label7')" placeholder="DRIVE" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill8]" name="skills[skill8]" @change="setVal('skills.skill8',  $event.target.value)" :value="getVal('skills.skill8')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label8]" name="skills[label8]" @change="setVal('skills.label8',  $event.target.value)" :value="getVal('skills.label8')" placeholder="EMPATHY" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill9]" name="skills[skill9]" @change="setVal('skills.skill9',  $event.target.value)" :value="getVal('skills.skill9')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label9]" name="skills[label9]" @change="setVal('skills.label9',  $event.target.value)" :value="getVal('skills.label9')" placeholder="FIGHT" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill10]" name="skills[skill10]" @change="setVal('skills.skill10',  $event.target.value)" :value="getVal('skills.skill10')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label10]" name="skills[label10]" @change="setVal('skills.label10',  $event.target.value)" :value="getVal('skills.label10')" placeholder="INVESTIGATE" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill11]" name="skills[skill11]" @change="setVal('skills.skill11',  $event.target.value)" :value="getVal('skills.skill11')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label11]" name="skills[label11]" @change="setVal('skills.label11',  $event.target.value)" :value="getVal('skills.label11')" placeholder="LORE" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill12]" name="skills[skill12]" @change="setVal('skills.skill12',  $event.target.value)" :value="getVal('skills.skill12')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label12]" name="skills[label12]" @change="setVal('skills.label12',  $event.target.value)" :value="getVal('skills.label12')" placeholder="NOTICE" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill13]" name="skills[skill13]" @change="setVal('skills.skill13',  $event.target.value)" :value="getVal('skills.skill13')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label13]" name="skills[label13]" @change="setVal('skills.label13',  $event.target.value)" :value="getVal('skills.label13')" placeholder="PHYSIQUE" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill14]" name="skills[skill14]" @change="setVal('skills.skill14',  $event.target.value)" :value="getVal('skills.skill14')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label14]" name="skills[label14]" @change="setVal('skills.label14',  $event.target.value)" :value="getVal('skills.label14')" placeholder="PROVOKE" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill15]" name="skills[skill15]" @change="setVal('skills.skill15',  $event.target.value)" :value="getVal('skills.skill15')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label15]" name="skills[label15]" @change="setVal('skills.label15',  $event.target.value)" :value="getVal('skills.label15')" placeholder="RAPPORT" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill16]" name="skills[skill16]" @change="setVal('skills.skill16',  $event.target.value)" :value="getVal('skills.skill16')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label16]" name="skills[label16]" @change="setVal('skills.label16',  $event.target.value)" :value="getVal('skills.label16')" placeholder="RESOURCES" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill17]" name="skills[skill17]" @change="setVal('skills.skill17',  $event.target.value)" :value="getVal('skills.skill17')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label17]" name="skills[label17]" @change="setVal('skills.label17',  $event.target.value)" :value="getVal('skills.label17')" placeholder="SHOOT" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill18]" name="skills[skill18]" @change="setVal('skills.skill18',  $event.target.value)" :value="getVal('skills.skill18')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label18]" name="skills[label18]" @change="setVal('skills.label18',  $event.target.value)" :value="getVal('skills.label18')" placeholder="STEALTH" />
				</div>

				<div class="form-group row">
					<div class="col-3">
						<input class="form-control text-center" type="text" id="skills[skill19]" name="skills[skill19]" @change="setVal('skills.skill19',  $event.target.value)" :value="getVal('skills.skill19')" placeholder="+" />
					</div>
					<input class="col-9" type="text" id="skills[label19]" name="skills[label19]" @change="setVal('skills.label19',  $event.target.value)" :value="getVal('skills.label19')" placeholder="WILL" />
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script>
export default {
  name: 'SheetFateCondensed',
  props: {    
    character: Object,
  },
  mounted() {
   this.$parent.$parent.title = 'Fate Condensed (Character Sheet)';
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
		max-height: 80px;
	}

	.fate-header {
		font-family: 'Open Sans', sans-serif;
		text-transform: uppercase;
		background-color: black;
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

	/* IMAGE STYLES */	
	textarea {
		border: 0 !important;
	}

	#stunts {
		height: 500px;		
		min-height: 500px;
	}

	.skills input {
		font-size: 22px;
		font-weight: 700;
		border-width: 0px;
		padding-top: 0px;
		text-transform: capitalize;
	}

	input.refresh {
		border: 4px solid black;
		border-radius: 50px 50px;
		width: 100px;
		height: 100px;
		text-align: center;
		font-size: 55px; 		
	}

	@media print {
		.sheet {
			margin: 20px;
			margin-top: 20px;
			max-width: 1024px;
		}
	}
</style>
