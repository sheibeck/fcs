<template>
  <div class="container mt-2">
    <form id="adversaryForm" v-on:submit.prevent="upsertAdversary">
        <div class="row">
            <input type="hidden" name="adversary_id" id="adversary_id" />
            <input type="hidden" name="adversary_owner_id" id="adversary_owner_id" />
            <div class="col-sm-12 col-md-8">
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Name</label>
                    <div class="col-sm-12 col-md-10">
                        <input class="form-control" type="text" value="" id="adversary_name" v-on:change="slugifyName" name="adversary_name">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Slug</label>
                    <div class="col-sm-12 col-md-10">
                        <input class="form-control" type="text" value="" id="adversary_slug" name="adversary_slug" readonly>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">High Concept</label>
                    <div class="col-sm-12 col-md-10">
                        <input class="form-control" type="hidden" name="adversary_aspects[name]" id="adversary_aspects[name]" data-name="high_concept" value="high_concept" >
                        <input class="form-control" type="text" value="" name="adversary_aspects[value]" id="adversary_aspects[value]">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Trouble</label>
                    <div class="col-sm-12 col-md-10">
                        <input class="form-control" type="hidden" name="adversary_aspects[name]" id="adversary_aspects[name]" data-name="trouble" value="trouble" >
                        <input class="form-control" type="text" value="" name="adversary_aspects[value]" id="adversary_aspects[value]">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Other Aspects</label>
                    <div class="col-sm-12 col-md-10">
                        <input class="form-control" type="hidden" name="adversary_aspects[name]" id="adversary_aspects[name]" data-name="other_aspects" value="other_aspects" >
                        <input class="form-control" type="text" value="" name="adversary_aspects[value]" id="adversary_aspects[value]" placeholder="Aspect1; Aspect2; Aspect3">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Skills</label>
                    <div class="col-sm-12 col-md-10">
                        <div class="row js-adversary-skills">
                            <div class="col-md-7">
                                <input class="form-control" type="text" value="" name="adversary_skills[name]" id="adversary_skills[name]" placeholder="Skill Name (Average, Good OR Sneaky, Quickly)">
                            </div>
                            <div class="col-md-5">
                                <input class="form-control" type="text" value="" name="adversary_skills[value]" id="adversary_skills[value]" placeholder="Skill Value (Physique, Fight OR +1, +2)">
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
                        <div class="row js-adversary-stunts">
                            <div class="col-12">
                                <input class="form-control" type="text" value="" name="adversary_stunts[name]" id="adversary_stunts[name]" placeholder="Stunt/Extra/Gadget Name">
                            </div>
                            <div class="col-12">
                                <textarea class="form-control" type="text" value="" name="adversary_stunts[value]" id="adversary_stunts[value]" placeholder="Stunt/Extra/Gadget Description"></textarea>
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
                        <div class="row js-adversary-stress">
                            <div class="col-md-7">
                                <input class="form-control" type="text" value="" name="adversary_stress[name]" id="adversary_stress[name]" placeholder="Stress Name (Physical, Mental, etc)">
                            </div>
                            <div class="col-md-5">
                                <input class="form-control" type="text" value="" name="adversary_stress[value]" id="adversary_stress[value]" placeholder="Stress Values (1,1,1 OR 1,2,3,4)">
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
                        <div class="row js-adversary-consequences">
                            <div class="col-12">
                                <input class="form-control" type="text" value="" name="adversary_consequences[name]" id="adversary_consequences[name]" placeholder="Consequence Name (Mild, Serious, Exhausted)">
                            </div>
                            <div class="col-12">
                                <textarea class="form-control" type="text" value="" name="adversary_consequences[value]" id="adversary_consequences[value]" placeholder="Consequence Values (Recover, Condition, etc)"></textarea>
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
                    <label for="adversary_system" class="col-sm-12 col-md-2 col-form-label">Type</label>
                    <div class="col-sm-12 col-md-10">
                        <select class="form-control" name="adversary_system" id="adversary_system">
                            <option>Fate Core</option>
                            <option>Fate Accelerated</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="adversary_genre" class="col-sm-12 col-md-2 col-form-label">Genre</label>
                    <div class="col-sm-12 col-md-10">
                        <select class="form-control" name="adversary_genre" id="adversary_genre">
                            <option>Fantasy</option>
                            <option>Modern</option>
                            <option>Sci-Fi</option>
                            <option>Horror</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="adversary_type" class="col-sm-12 col-md-2 col-form-label">Type</label>
                    <div class="col-sm-12 col-md-10">
                        <select class="form-control" name="adversary_type" id="adversary_type">
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
        <a href='#' class='btn btn-danger'data-toggle='modal' data-target='#modalDeleteAdversaryConfirm'>Delete</i></a>
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
  created(){
    fs_adversary.init();
  },
  watch: {
    userId() {
      //wait for our authenticated user id
      this.editAdversary(this.userId, fcs.$route.params.id);
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
    editAdversary : function(ownerid, slug) {
      //we only edit if we have a valid slug for an id
      if (!slug) return;

      var $component = this;
      let adversaryList = [];

      $('#adversary_name').attr('readonly', true);

      // Create DynamoDB document client
      var docClient = fatesheet.getDBClient();

      let params = {
          TableName: fs_adversary.config.adversarytable,
          IndexName: "adversary_slug-index",
          KeyConditionExpression: 'adversary_slug = :slug',
          FilterExpression: 'adversary_owner_id = :owner_id',
          ExpressionAttributeValues: {
            ':slug': slug,
            ':owner_id': ownerid
          }
      }

      docClient.query(params, onQuery);
      function onQuery(err, data) {
        if (err) {
          console.log("Error", err);
        } else {

          Array.prototype.push.apply(adversaryList,data.Items);              

          if (typeof data.LastEvaluatedKey != "undefined") {
              console.log("Scanning for more...");                  
              params.ExclusiveStartKey = data.LastEvaluatedKey;
              docClient.query(params, onQuery);
          }
          else {

            if (adversaryList.length === 0)
            {
              location.href = '/error';
            }
            else {
              console.log("Success", adversaryList);
              $component.adversary = adversaryList[0];
              $component.clearAdversaryForm();
              $component.populateAdversaryForm($component.adversary);

              $component.title = $component.adversary.adversary_name + ' (Adversary)';
              $component.description = $component.adversary.adversary_type;
            }
          }
        }
      }
    },
    upsertAdversary : function() {
        var $component = this;

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

        if (result.adversary_stress) {
            //iterate over stress and make each value an array
            $.each(result.adversary_stress, function (key, value) {
                result.adversary_stress[key] = value.split(',');
            });
        }

        var isNew = false;
        if (!result.adversary_id)
        {
          // add a uniqueid
          result['adversary_id'] = fatesheet.generateUUID();
          result['adversary_owner_id'] = fatesheet.config.userId;
          isNew = true;
        }

        //adversary_name is a key field, we're going to force this to title case
        if(result.adversary_name)
        {
          result.adversary_name.toTitleCase();
        }

        // clear empty values
        fatesheet.removeEmptyObjects(result);

        if (isNew)
        {
          //create the adversary
          $component.insertAdversary(result);
        }
        else {
          $component.updateAdversary(result);
        }
    },

    insertAdversary: function(adversaryData) {

        var docClient = fatesheet.getDBClient();

        var params = {
            TableName: fs_adversary.config.adversarytable,
            Key: {
             'adversary_owner_id': adversaryData.adversary_owner_id,
             'adversary_name': adversaryData.adversary_name
            },
        }

        // if this adversary already exists then warn and don't overwrite
        docClient.get(params, function(err, data) {
            if (err) {
              console.log("Error", err);
            } else {
              if (data.Item)
              {
                fatesheet.notify('You already have an adversary with this name.', 'info', '2000');
              }
              else {
                  // create a new creature
                  var params = {
                      TableName: fs_adversary.config.adversarytable,
                      Item: adversaryData
                  };

                  console.log("Adding a new adversary...");
                  docClient.put(params, function (err, data) {
                      if (err) {
                          fatesheet.notify(err.message || JSON.stringify(err));
                          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                      } else {
                          console.log("Added item:", JSON.stringify(data, null, 2));
                          fatesheet.notify('Adversary added.', 'success', 2000, function() {
                            location.href = '/adversary/' + adversaryData.adversary_slug;
                          } );

                      }
                  });
              }
            }
        });
    },

    deleteAdversary : function() {
        if (!this.isOwner($(adversary_owner_id).val())) {
          fatesheet.notify('Permission Denied.', 'error', 2000);
        }
        else {
          var $component = this;
          var docClient = fatesheet.getDBClient();

          var params = {
              TableName: fs_adversary.config.adversarytable,
              Key: {
               'adversary_owner_id': $component.userId,
               'adversary_name': $('#adversary_name').val()
              }
          };

          console.log("Deleting an adversary...");
          docClient.delete(params, function (err, data) {
              if (err) {
                  fatesheet.notify(err.message || JSON.stringify(err));
                  console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
              } else {
                  $component.clearAdversaryForm();
                  $('#modalDeleteAdversaryConfirm').modal('hide');
                  console.log("Deleted item:", JSON.stringify(data, null, 2));

                  fatesheet.notify('Adversary deleted.', 'success', 2000, function() {
                    location.href = '/adversary'
                  });
              }
          });
      }
    },

    updateAdversary : function(data) {
        var docClient = fatesheet.getDBClient();

        var params = {
            TableName: fs_adversary.config.adversarytable,
            Key: {
             'adversary_owner_id': data.adversary_owner_id,
             'adversary_name': $('#adversary_name').val().toTitleCase() // it's disabled when we update so they don't try to change it.
            },
            UpdateExpression: "set adversary_aspects = :a, adversary_slug =:slg, adversary_consequences=:c, adversary_genre=:g, adversary_skills=:sk, adversary_stress=:str, adversary_stunts=:stn, adversary_system=:sys, adversary_type=:t",
            ExpressionAttributeValues:{
                ":a":data.adversary_aspects,
                ":slg": data.adversary_slug,
                ":c":data.adversary_consequences,
                ":g":data.adversary_genre,
                ":sk": data.adversary_skills,
                ":str": data.adversary_stress,
                ":stn": data.adversary_stunts,
                ":sys": data.adversary_system,
                ":t": data.adversary_type
            },
            ReturnValues:"UPDATED_NEW"
        };

        console.log("Updating adversary...");
        docClient.update(params, function (err, data) {
            if (err) {
                fatesheet.notify(err.message || JSON.stringify(err));
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                fatesheet.notify('Adversary updated.', 'success', 2000);
            }
        });
    },

    clearAdversaryForm : function() {
      //clear the form
      $('#adversaryForm').trigger("reset");
      $('.adversary-item-copy', '#adversaryForm').remove();

      $('#adversary_id').val('');
      $('#adversary_owner_id').val('');
    },

    populateAdversaryForm : function (data) {
      var $component = this;
      $.each(data, function(name, val){
          if (typeof val === 'object')
          {
            switch(name) {
              case 'adversary_aspects':
                $.each(val, function(n, t) {
                  $('input[name="adversary_aspects[name]"][data-name=' + n + ']').next().val(t);
                });
                break;
              default:
                var objName = name.replace('_', '-');
                for(var i=0;i<Object.keys(val).length-1;i++) {
                  $component.appendDeletableRow($(".js-" + objName + ":first").clone().addClass('adversary-item-copy').insertAfter(".js-" + objName +":last"));
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

      var slug = fatesheet.slugify(data.adversary_name);
      $('#adversary_slug').val(slug);
    },

    appendDeletableRow : function($elem) {
      $('div:first', $elem).addClass('input-group-prepend')
        .append('<div class="input-group-text btn btn-danger js-delete-adversary-item"><i class="fa fa-trash"><i></div>');
    },

    adversaryAddSkills : function(aSkills) {
      $('.js-adversary-skills.adversary-item-copy', '#adversaryForm').remove();
      $('.js-adversary-skills input', '#adversaryForm').val('');

      for( var i = 0; i < aSkills.length-1; i++) {
        this.appendDeletableRow($(".js-adversary-skills:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-skills:last"));
      };
      $.each($('.js-adversary-skills'), function(i, val) {
        $(this).find('input[name="adversary_skills[name]"]').val(aSkills[i]);
        $(this).find('input[name="adversary_skills[value]"]').val('');
      })
    },

    adversaryAddStress : function(aStress) {
      $('.js-adversary-stress.adversary-item-copy', '#adversaryForm').remove();
      $('.js-adversary-stress input', '#adversaryForm').val('');

      for( var i = 0; i < aStress.length-1; i++) {
        this.appendDeletableRow($(".js-adversary-stress:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-stress:last"));
      };
      $.each($('.js-adversary-stress'), function(i, val) {
        $(this).find('input[name="adversary_stress[name]"]').val(aStress[i][0]);
        $(this).find('input[name="adversary_stress[value]"]').val(aStress[i][1]);
      })
    },

    adversaryAddConsequences : function(aConsequences) {
      $('.js-adversary-consequences.adversary-item-copy', '#adversaryForm').remove();
      $('.js-adversary-consequences input', '#adversaryForm').val('');
      $('.js-adversary-consequences textarea', '#adversaryForm').val('');

      for( var i = 0; i < aConsequences.length-1; i++) {
        this.appendDeletableRow($(".js-adversary-consequences:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-consequences:last"));
      };
      $.each($('.js-adversary-consequences'), function(i, val) {
        $(this).find('input[name="adversary_consequences[name]"]').val(aConsequences[i][0]);
        $(this).find('textarea[name="adversary_consequences[value]"]').val(aConsequences[i][1]);
      })
    },

    addSkill : function() {
        this.appendDeletableRow($(".js-adversary-skills:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-skills:last"));
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
        this.appendDeletableRow($(".js-adversary-stunts:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-stunts:last"));
    },

    addStress : function() {
        this.appendDeletableRow($(".js-adversary-stress:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-stress:last"));
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
       var $item = $(".js-adversary-consequences:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-consequences:last")
          $('div:first', $item).addClass('input-group-prepend')
            .append('<div class="input-group-text btn btn-danger js-delete-adversary-item">X</div>');
    },

    addConsequenceDefault : function() {
        var aConsequences = [["Mild","-2"],["Moderate","-4"],["Severe","-6"]]
        this.adversaryAddConsequences(aConsequences);
    },
    isOwner : function(ownerId) {
      return this.userId === ownerId;
    },
    slugifyName : function(event) {
      var $elem = $(event.currentTarget);
      var slug = fatesheet.slugify($elem.val());
      $('#adversary_slug').val(slug);
    }
  }
}
</script>
