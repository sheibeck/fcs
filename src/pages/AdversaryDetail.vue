<template>
  <div class="container mt-2">
    <form id="adversaryForm" v-on:submit.prevent="save">
        <div class="row">
            <input type="hidden" name="id" id="id" />
            <input type="hidden" name="owner_id" id="owner_id" />
            <div class="col-sm-12 col-md-8">
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Name</label>
                    <div class="col-sm-12 col-md-10">
                        <input class="form-control" type="text" value="" id="name" name="name">
                    </div>
                </div>                
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">High Concept</label>
                    <div class="col-sm-12 col-md-10">
                        <input class="form-control" type="hidden" name="aspects[name]" id="aspects[name]" data-name="high_concept" value="high_concept" >
                        <input class="form-control" type="text" value="" name="aspects[value]" id="aspects[value]">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Trouble</label>
                    <div class="col-sm-12 col-md-10">
                        <input class="form-control" type="hidden" name="aspects[name]" id="aspects[name]" data-name="trouble" value="trouble" >
                        <input class="form-control" type="text" value="" name="aspects[value]" id="aspects[value]">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Other Aspects</label>
                    <div class="col-sm-12 col-md-10">
                        <input class="form-control" type="hidden" name="aspects[name]" id="aspects[name]" data-name="other_aspects" value="other_aspects" >
                        <input class="form-control" type="text" value="" name="aspects[value]" id="aspects[value]" placeholder="Aspect1; Aspect2; Aspect3">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Skills</label>
                    <div class="col-sm-12 col-md-10">
                        <div class="row js-skills">
                            <div class="col-md-7">
                                <input class="form-control" type="text" value="" name="skills[name]" id="skills[name]" placeholder="Skill Name (Average, Good OR Sneaky, Quickly)">
                            </div>
                            <div class="col-md-5">
                                <input class="form-control" type="text" value="" name="skills[value]" id="skills[value]" placeholder="Skill Value (Physique, Fight OR +1, +2)">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-md-12 text-right">
                        <button type="button" class="btn btn-primary" v-on:click="addSkill">Add Skill <i class='fa fa-plus'></i></button>
                        <button type="button" class="btn btn-primary" v-on:click="addSkillFAE">Add FAE Approaches <i class='fa fa-plus'></i></button>
                        <button type="button" class="btn btn-primary" v-on:click="addSkillCore">Add Core Skills <i class='fa fa-plus'></i></button>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Stunts & Extras</label>
                    <div class="col-sm-12 col-md-10">
                        <div class="row js-stunts">
                            <div class="col-12">
                                <input class="form-control" type="text" value="" name="stunts[name]" id="stunts[name]" placeholder="Stunt/Extra/Gadget Name">
                            </div>
                            <div class="col-12">
                                <textarea class="form-control" type="text" value="" name="stunts[value]" id="stunts[value]" placeholder="Stunt/Extra/Gadget Description"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-md-12 text-right">
                        <button type="button" class="btn btn-primary" v-on:click="addStunt">Add Stunt/Extra <i class='fa fa-plus'></i></button>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Stress</label>
                    <div class="col-sm-12 col-md-10">
                        <div class="row js-stress">
                            <div class="col-md-7">
                                <input class="form-control" type="text" value="" name="stress[name]" id="stress[name]" placeholder="Stress Name (Physical, Mental, etc)">
                            </div>
                            <div class="col-md-5">
                                <input class="form-control" type="text" value="" name="stress[value]" id="stress[value]" placeholder="Stress Values (1,1,1 OR 1,2,3,4)">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-md-12 text-right">
                        <button type="button" class="btn btn-primary" v-on:click="addStress">Add Stress <i class='fa fa-plus'></i></button>
                        <button type="button" class="btn btn-primary" v-on:click="addStressFAE">Add FAE Stress <i class='fa fa-plus'></i></button>
                        <button type="button" class="btn btn-primary" v-on:click="addStressCore">Add Core Stress <i class='fa fa-plus'></i></button>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Consequences</label>
                    <div class="col-sm-12 col-md-10">
                        <div class="row js-consequences">
                            <div class="col-12">
                                <input class="form-control" type="text" value="" name="consequences[name]" id="consequences[name]" placeholder="Consequence Name (Mild, Serious, Exhausted)">
                            </div>
                            <div class="col-12">
                                <textarea class="form-control" type="text" value="" name="consequences[value]" id="consequences[value]" placeholder="Consequence Values (Recover, Condition, etc)"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-md-12 text-right">
                        <button type="button" class="btn btn-primary" v-on:click="addConsequence">Add Consequence <i class='fa fa-plus'></i></button>
                        <button type="button" class="btn btn-primary" v-on:click="addConsequenceDefault">Add Default Consequences <i class='fa fa-plus'></i></button>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="system" class="col-sm-12 col-md-2 col-form-label">Type</label>
                    <div class="col-sm-12 col-md-10">
                        <select class="form-control" name="system" id="system">
                            <option>Fate Core</option>
                            <option>Fate Accelerated</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="genre" class="col-sm-12 col-md-2 col-form-label">Genre</label>
                    <div class="col-sm-12 col-md-10">
                        <select class="form-control" name="genre" id="genre">
                            <option>Fantasy</option>
                            <option>Modern</option>
                            <option>Sci-Fi</option>
                            <option>Horror</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="type" class="col-sm-12 col-md-2 col-form-label">Type</label>
                    <div class="col-sm-12 col-md-10">
                        <select class="form-control" name="type" id="type">
                            <option>Enemy</option>
                            <option>Obstacle</option>
                            <option>Constraint</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <button class="btn btn-primary">Save Adversary <i class='fa fa-plus'></i></button>
        <a href='/adversary' role="button" class="btn btn-secondary">Close <i class='fa fa-times-circle'></i></a>
        <a href='#' class='btn btn-danger' data-toggle='modal' data-target='#modalDeleteAdversaryConfirm'> Delete <i class='fa fa-trash'></i></a>
    </form>


    <!-- delete confirmation modal-->
    <div class="modal fade" id="modalDeleteAdversaryConfirm" tabindex="-1" role="dialog" aria-labelledby="deleteLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteLabel">Confirm Adversary Delete</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this adversary?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" v-on:click="deleteAdversary">Delete <i class='fa fa-trash'></i></button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'AdversaryDetail',
  metaInfo() {
    return {
       title: this.title,
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  mounted(){
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);    
  },
  watch: {
    userId() {
      //wait for our authenticated user id
      this.init();     
    }
  },
  data () {
    return {
      adversary: {},
      title: "",
      description: "",
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
  methods: {
    init : function() {      
      $(document).on('click', '.js-delete-item', function (eve) {
          $(this).parent().parent().remove();
      });

      this.adversaryId = commonSvc.SetId("ADVERSARY", this.$route.params.id);

      this.editAdversary();
    },
    editAdversary : function() {                
      //we only edit if we have a valid slug for an id
      if (!this.adversaryId) return;
      
      let adversary = dbSvc.GetObject(this.adversaryId, this.userId).then( (data) => {
        this.adversary = data;
        //if we find an adversary, then we're editing, otherwise we are creating
        if (this.adversary) {
          this.clearAdversaryForm();
          this.populateAdversaryForm(this.adversary);

          this.title = this.adversary.name + ' (Adversary)';
          this.description = this.adversary.type;
        }    
      });     
    },
    save : async function() {
      if (!$("#name").val())
      {
        commonSvc.Notify('You must enter a name', 'error');
        return;
      }

      var data = $('#adversaryForm').serializeArray();

      var result = {};
      var currentKey;
      $.each(data, function () {
          if (this.name !== '') {
              if (this.name.indexOf('[name]') > -1)
              {
                  var label = this.name.replace('[name]',''); //get the name of the parent property
                  if (!result[label]) {
                      result[label] = {};
                  }
                  currentKey = this.value; //get the value that needs to be appened to the parent
                  result[label][this.value] = null;
              }

              else if (this.name.indexOf('[value]') > -1)
              {
                  var label = this.name.replace('[value]', '');//get the name of the parent property
                  result[label][currentKey] = this.value; //get the last name we stored, should be in order so we assume the previous name is paired with this
                  currentKey = '';
              }

              else {
                  result[this.name] = this.value;
              }
          }
      });

      if (result.stress) {
          //iterate over stress and make each value an array
          $.each(result.stress, function (key, value) {
              result.stress[key] = value.split(',');
          });
      }

      var isNew = false;
      if (!result.id)
      {        
        // add a uniqueid
        result['id'] = commonSvc.SetId("ADVERSARY", commonSvc.GenerateUUID());
        result['owner_id'] = this.$store.state.userId;
        isNew = true;
      }

      //name is a key field, we're going to force this to title case
      result.name = result.name.toTitleCase();
      result.slug = commonSvc.Slugify(result.name); //update the url slug
      result.object_type = "ADVERSARY";      

      // clear empty values
      commonSvc.RemoveEmptyObjects(result);

      // if this adversary already exists then warn and don't overwrite
      let existingAdversaries = await dbSvc.ListObjects("ADVERSARY", null, result.name);
      let foundAdversayWithName = existingAdversaries.filter(obj => {
        return obj.name.toLowerCase() === result.name.toLowerCase() && obj.id !== result.id;
      })

      if (foundAdversayWithName.length > 0)
      {
        commonSvc.Notify('There is already an adversary with this name. Please choose a different name', 'error');
      }
      else {        
        console.log("Saving adversary...");

        let response = await dbSvc.SaveObject(result).then((response) => {    
          if (response) {
            commonSvc.Notify('Adversary saved.', 'success', null, () => {
              if (isNew)
              {
                location.href = `${location.href}/${commonSvc.GetId(result['id'])}`;
              }
            });
          }          
        });
      }
    },

    deleteAdversary : async function() {
      if (!this.isOwner($(owner_id).val())) {
        commonSvc.Notify('You are not the owner of this Adversary', 'error');
      }
      else {
        await dbSvc.DeleteObject( this.userId, $('#id').val() ).then( (response) => { 
          if (response) {
            this.clearAdversaryForm();
            $('#modalDeleteAdversaryConfirm').modal('hide');
            commonSvc.Notify('Adversary deleted.', 'success', null, () => {
              location.href = '/adversary'
            });
          }
        });
      }
    },

    clearAdversaryForm : function() {
      //clear the form
      $('#adversaryForm').trigger("reset");
      $('.adversary-item-copy', '#adversaryForm').remove();

      $('#id').val('');
      $('#owner_id').val('');
    },

    populateAdversaryForm : function (data) {      
      $.each(data, (name, val) =>{
          if (typeof val === 'object')
          {
            switch(name) {
              case 'aspects':
                $.each(val, function(n, t) {
                  $('input[name="aspects[name]"][data-name=' + n + ']').next().val(t);
                });
                break;
              default:
                var objName = name.replace('_', '-');
                for(var i=0;i<Object.keys(val).length-1;i++) {
                  this.appendDeletableRow($(".js-" + objName + ":first").clone().addClass('adversary-item-copy').insertAfter(".js-" + objName +":last"));
                }
                $(".js-"+objName).each(function(i) {
                  $(this).find('input[name="'+ name +'[name]"]').val(Object.keys(val)[i]);
                  $(this).find('input[name="'+ name +'[value]"]').val(Object.values(val)[i]);
                  $(this).find('textarea[name="'+ name +'[value]"]').val(Object.values(val)[i]);
                });
                break;
            }
          }
          else {
            var $el = $('[name="'+name+'"]', '#adversaryForm');
            var type = $el.attr('type');

            switch(type){
                default:
                    $el.val(val);
            }
          }
      });      
    },

    appendDeletableRow : function($elem) {
      $('div:first', $elem).addClass('input-group-prepend')
        .append('<div class="input-group-text btn btn-danger js-delete-item"><i class="fa fa-trash"><i></div>');
    },

    adversaryAddSkills : function(aSkills) {
      $('.js-skills.adversary-item-copy', '#adversaryForm').remove();
      $('.js-skills input', '#adversaryForm').val('');

      for( var i = 0; i < aSkills.length-1; i++) {
        this.appendDeletableRow($(".js-skills:first").clone().addClass('adversary-item-copy').insertAfter(".js-skills:last"));
      };
      $.each($('.js-skills'), function(i, val) {
        $(this).find('input[name="skills[name]"]').val(aSkills[i]);
        $(this).find('input[name="skills[value]"]').val('');
      })
    },

    adversaryAddStress : function(aStress) {
      $('.js-stress.adversary-item-copy', '#adversaryForm').remove();
      $('.js-stress input', '#adversaryForm').val('');

      for( var i = 0; i < aStress.length-1; i++) {
        this.appendDeletableRow($(".js-stress:first").clone().addClass('adversary-item-copy').insertAfter(".js-stress:last"));
      };
      $.each($('.js-stress'), function(i, val) {
        $(this).find('input[name="stress[name]"]').val(aStress[i][0]);
        $(this).find('input[name="stress[value]"]').val(aStress[i][1]);
      })
    },

    adversaryAddConsequences : function(aConsequences) {
      $('.js-consequences.adversary-item-copy', '#adversaryForm').remove();
      $('.js-consequences input', '#adversaryForm').val('');
      $('.js-consequences textarea', '#adversaryForm').val('');

      for( var i = 0; i < aConsequences.length-1; i++) {
        this.appendDeletableRow($(".js-consequences:first").clone().addClass('adversary-item-copy').insertAfter(".js-consequences:last"));
      };
      $.each($('.js-consequences'), function(i, val) {
        $(this).find('input[name="consequences[name]"]').val(aConsequences[i][0]);
        $(this).find('textarea[name="consequences[value]"]').val(aConsequences[i][1]);
      })
    },

    addSkill : function() {
        this.appendDeletableRow($(".js-skills:first").clone().addClass('adversary-item-copy').insertAfter(".js-skills:last"));
    },

    addSkillFAE : function() {
        var aSkills = ['Careful','Clever','Flashy','Forceful','Quick','Sneaky'];
        this.adversaryAddSkills(aSkills);
    },

    addSkillCore : function() {
        var aSkills = ['(+1) Average','(+2) Fair','(+3) Good','(+4) Great','(+5) Superb', '(+6) Fantastic'];
        this.adversaryAddSkills(aSkills);
    },

    addStunt : function() {
        this.appendDeletableRow($(".js-stunts:first").clone().addClass('adversary-item-copy').insertAfter(".js-stunts:last"));
    },

    addStress : function() {
        this.appendDeletableRow($(".js-stress:first").clone().addClass('adversary-item-copy').insertAfter(".js-stress:last"));
    },

    addStressCore : function() {
      var aStress = [["Physical","1,2,3"],["Mental","1,2,3"]]
      this.adversaryAddStress(aStress);
    },

    addStressFAE : function() {
      var aStress = [["Stress","1,2,3"]]
      this.adversaryAddStress(aStress);
    },

    addConsequence : function() {
       var $item = $(".js-consequences:first").clone().addClass('adversary-item-copy').insertAfter(".js-consequences:last")
          $('div:first', $item).addClass('input-group-prepend')
            .append('<div class="input-group-text btn btn-danger js-delete-item">X</div>');
    },

    addConsequenceDefault : function() {
        var aConsequences = [["Mild","-2"],["Moderate","-4"],["Severe","-6"]]
        this.adversaryAddConsequences(aConsequences);
    },
    isOwner : function(ownerId) {
      return this.userId === ownerId;
    }   
  }
}
</script>
