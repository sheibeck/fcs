/***********************************
        ADVERSARY
***********************************/
(function (fs_adversary, $, undefined) {
    fs_adversary.config = {
        adversarytable: '',
    }

    function getDBClient()  {
      return fatesheet.getDBClient();
    }


    function upsertAdversary() {
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
          insertAdversary(result);
        }
        else {
          updateAdversary(result);
        }
    }

    function insertAdversary(adversaryData) {

        var docClient = getDBClient();

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
                          fatesheet.notify('Adversary added.', 'success', 2000, function() {
                            fs_adversary.listAdversaries($('#search-text').val())
                          } );
                          console.log("Added item:", JSON.stringify(data, null, 2));

                          fs_adversary.clearAdversaryForm();
                      }
                  });
              }
            }
        });


    }

    fs_adversary.deleteAdversary = function(key) {
        var docClient = getDBClient();

        var params = {
            TableName: fs_adversary.config.adversarytable,
            Key: key
        };

        console.log("Deleting an adversary...");
        docClient.delete(params, function (err, data) {
            if (err) {
                fatesheet.notify(err.message || JSON.stringify(err));
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                $('#modalDeleteAdversaryConfirm').modal('hide');
                fatesheet.notify('Adversary deleted.', 'success', 2000, function() {
                  fs_adversary.listAdversaries($('#search-text').val());
                } );
                fs_adversary.clearAdversaryForm();
                console.log("Added item:", JSON.stringify(data, null, 2));
            }
        });
    }

    function updateAdversary(data) {
        var docClient = getDBClient();

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
                fatesheet.notify('Adversary updated.', 'success', 2000, function() { fs_adversary.listAdversaries($('#search-text').val()) } );
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            }
        });
    }

    fs_adversary.clearAdversaryForm = function() {
      //clear the form
      $('#adversaryForm').trigger("reset");
      $('.adversary-item-copy', '#adversaryForm').remove();

      $('#adversary_id').val('');
      $('#adversary_owner_id').val('');
    }

    var fate_adversary_helpers = {
        stress: function (stressValue) {
            var stressboxes = '';
            $.each(stressValue, function (i, val) {
                stressboxes += "<input type='checkbox' value='" + val + "'>" + val + "&nbsp;";
            });
            return stressboxes;
        },
        fixLabel: function (val) {
            return val.replace(/_/g, ' ').replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });;
        },
        showOwnerControls: function(ownerid, name) {
          // if this is the owner then let them edit it
          if (fatesheet.config.userId == ownerid) {
            return "<small><a href='#' class='js-edit-adversary d-print-none' data-owner-id='" + ownerid + "' data-adversary-name='" + name + "'><i class='fa fa-edit'></i></a></small>";
          }
        },
        isEmpty: function(obj) {
          for(var key in obj) {
              if(obj.hasOwnProperty(key))
                  return false;
          }
          return true;
        }
    };

    fs_adversary.listAdversaries = function (searchText) {
      $('.js-adversary-list').removeClass('hidden');
      $('#adversaryForm').addClass('hidden');

      //make sure the search text is up to snuff
      $('#search-text').val(searchText).change();

      $.views.helpers(fate_adversary_helpers);

      // Create DynamoDB document client
      var docClient = getDBClient();

      var params = {
          TableName: fs_adversary.config.adversarytable,
          Select: 'ALL_ATTRIBUTES'
      }

      //search
      if (searchText && searchText.length > 0) {
        params.ExpressionAttributeValues= {
          ':an': searchText,
          ':anl': searchText.toLowerCase(),
          ':anu': searchText.toUpperCase(),
          ':ant': searchText.toTitleCase(),
        };

        params.FilterExpression = '( contains (adversary_name, :an)';
        params.FilterExpression += ' OR contains (adversary_name, :anl)';
        params.FilterExpression += ' OR contains (adversary_name, :anu)';
        params.FilterExpression += ' OR contains (adversary_name, :ant)';

        params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :an)';
        params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :anl)';
        params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :anu)';
        params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :ant)';

        params.FilterExpression += ' OR contains (adversary_aspects.trouble, :an)';
        params.FilterExpression += ' OR contains (adversary_aspects.trouble, :anl)';
        params.FilterExpression += ' OR contains (adversary_aspects.trouble, :anu)';
        params.FilterExpression += ' OR contains (adversary_aspects.trouble, :ant)';

        params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :an)';
        params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :anl)';
        params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :anu)';
        params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :ant)';

        params.FilterExpression += ' OR contains (adversary_system, :an)';
        params.FilterExpression += ' OR contains (adversary_system, :anl)';
        params.FilterExpression += ' OR contains (adversary_system, :anu)';
        params.FilterExpression += ' OR contains (adversary_system, :ant)';

        params.FilterExpression += ' OR contains (adversary_type, :an)';
        params.FilterExpression += ' OR contains (adversary_type, :anl)';
        params.FilterExpression += ' OR contains (adversary_type, :anu)';
        params.FilterExpression += ' OR contains (adversary_type, :ant)';

        params.FilterExpression += ' OR contains (adversary_genre, :an)';
        params.FilterExpression += ' OR contains (adversary_genre, :anl)';
        params.FilterExpression += ' OR contains (adversary_genre, :anu)';
        params.FilterExpression += ' OR contains (adversary_genre, :ant)';

        params.FilterExpression += ' OR adversary_slug = :anl )';
      }

      //show only the current users adversaries if the box is checked
      if ($('#my_adversaries').is(':checked'))
      {
        if (!params.FilterExpression)
        {
          params.ExpressionAttributeValues = {':owner_id' : fatesheet.config.userId };
          params.FilterExpression = 'adversary_owner_id = :owner_id';
        }
        else {
          params.ExpressionAttributeValues[':owner_id'] = fatesheet.config.userId;
          params.FilterExpression += ' AND (adversary_owner_id = :owner_id)';
        }

      }

      docClient.scan(params, function (err, data) {
          if (err) {
              console.log("Error", err);
          } else {
              console.log("Success", data.Items);

              //https://www.jsviews.com/
              var template = $.templates("#tmpladversaryDetail");

              //dynamodb doesn't order items, it's a NODB. WE'll manually tweak a few
              // things to try and make them consistent
              var adversaries = data.Items.sort(function(a,b) {return (a["adversary_name"] > b["adversary_name"]) ? 1 : ((b["adversary_name"] > a["adversary_name"]) ? -1 : 0);} );
              $.each(adversaries, function(i, v) {
                if (v.adversary_aspects)
                {
                  const orderedAspects = {};
                  if (v.adversary_aspects["high_concept"])
                    orderedAspects["high_concept"] = v.adversary_aspects["high_concept"];
                  if (v.adversary_aspects["trouble"])
                    orderedAspects["trouble"] = v.adversary_aspects["trouble"];
                  if (v.adversary_aspects["other_aspects"])
                    orderedAspects["other_aspects"] = v.adversary_aspects["other_aspects"];

                  v.adversary_aspects = orderedAspects;
                }

                const orderedSkills = {};
                Object.keys(v.adversary_skills).sort().forEach(function(key) {
                  orderedSkills[key] = v.adversary_skills[key];
                });
                v.adversary_skills = orderedSkills;

                const orderedConsequences = {};
                Object.keys(v.adversary_consequences).sort().forEach(function(key) {
                  orderedConsequences[key] = v.adversary_consequences[key];
                });
                v.adversary_consequences = orderedConsequences;
              });
              var htmlOutput = template.render(adversaries, fate_adversary_helpers);
              $("#adversaryDetail").html(htmlOutput);

              //make the display wider if we only have 1 adversary
              if ($('.card').length === 1)
              {
                $('#adversaryDetail').removeClass('card-columns');
              }
              else {
                $('#adversaryDetail').addClass('card-columns');
              }
          }
      });
    }

    fs_adversary.editAdversary = function(ownerid, name) {
      $('#adversary_name').attr('disabled', true);

      $('.js-adversary-list').addClass('hidden');
      $('#adversaryForm').removeClass('hidden');

      // Create DynamoDB document client
      var docClient = getDBClient();

      var params = {
          TableName: fs_adversary.config.adversarytable,
          Key: {
           'adversary_owner_id': ownerid.toString(),
           'adversary_name': name
          },
      }

      docClient.get(params, function(err, data) {
          if (err) {
            console.log("Error", err);
          } else {
            console.log("Success", data.Item);

            fs_adversary.clearAdversaryForm();
            populateAdversaryForm(data.Item);
          }
      });
    }

    function populateAdversaryForm(data) {
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
                  fs_adversary.appendDeletableRow($(".js-" + objName + ":first").clone().addClass('adversary-item-copy').insertAfter(".js-" + objName +":last"));
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
    }


    fs_adversary.appendDeletableRow = function($elem) {
      $('div:first', $elem).addClass('input-group-prepend')
        .append('<div class="input-group-text btn btn-danger js-delete-adversary-item"><i class="fa fa-trash"><i></div>');
    }

    fs_adversary.adversaryAddSkills = function(aSkills) {
      $('.js-adversary-skills.adversary-item-copy', '#adversaryForm').remove();
      $('.js-adversary-skills input', '#adversaryForm').val('');

      for( var i = 0; i < aSkills.length-1; i++) {
        fs_adversary.appendDeletableRow($(".js-adversary-skills:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-skills:last"));
      };
      $.each($('.js-adversary-skills'), function(i, val) {
        $(this).find('input[name="adversary_skills[name]"]').val(aSkills[i]);
        $(this).find('input[name="adversary_skills[value]"]').val('');
      })
    }


    fs_adversary.adversaryAddStress = function(aStress) {
      $('.js-adversary-stress.adversary-item-copy', '#adversaryForm').remove();
      $('.js-adversary-stress input', '#adversaryForm').val('');

      for( var i = 0; i < aStress.length-1; i++) {
        fs_adversary.appendDeletableRow($(".js-adversary-stress:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-stress:last"));
      };
      $.each($('.js-adversary-stress'), function(i, val) {
        $(this).find('input[name="adversary_stress[name]"]').val(aStress[i][0]);
        $(this).find('input[name="adversary_stress[value]"]').val(aStress[i][1]);
      })
    }

    fs_adversary.adversaryAddConsequences = function(aConsequences) {
      $('.js-adversary-consequences.adversary-item-copy', '#adversaryForm').remove();
      $('.js-adversary-consequences input', '#adversaryForm').val('');
      $('.js-adversary-consequences textarea', '#adversaryForm').val('');

      for( var i = 0; i < aConsequences.length-1; i++) {
        fs_adversary.appendDeletableRow($(".js-adversary-consequences:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-consequences:last"));
      };
      $.each($('.js-adversary-consequences'), function(i, val) {
        $(this).find('input[name="adversary_consequences[name]"]').val(aConsequences[i][0]);
        $(this).find('textarea[name="adversary_consequences[value]"]').val(aConsequences[i][1]);
      })
    }

    function domEvents() {
      // ADVERSARY
      $(document).on('click', '.js-delete-adversary', function (e) {
          e.preventDefault();

          var key = {
           'adversary_owner_id': fatesheet.config.userId,
           'adversary_name': $('#adversary_name').val()
          }
          fs_adversary.deleteAdversary(key);
      });

      $(document).on('click', '.js-edit-adversary', function (e) {
          e.preventDefault();
          fs_adversary.editAdversary($(this).data('owner-id'), $(this).data('adversary-name'));
      });


      $(document).on('click', '.js-add-skill', function (e) {
          fs_adversary.appendDeletableRow($(".js-adversary-skills:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-skills:last"));
      });

      $(document).on('click', '.js-add-skill-fae', function (e) {
          var aSkills = ['Careful','Clever','Flashy','Forceful','Quick','Sneaky'];
          fs_adversary.adversaryAddSkills(aSkills);
      });

      $(document).on('click', '.js-add-skill-core', function (e) {
          var aSkills = ['(+1) Average','(+2) Fair','(+3) Good','(+4) Great','(+5) Superb', '(+6) Fantastic'];
          fs_adversary.adversaryAddSkills(aSkills);
      });

      $(document).on('click', '.js-add-stunt', function (e) {
          fs_adversary.appendDeletableRow($(".js-adversary-stunts:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-stunts:last"));
      });

      $(document).on('click', '.js-add-stress', function (e) {
          fs_adversary.appendDeletableRow($(".js-adversary-stress:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-stress:last"));
      });

      $(document).on('click', '.js-add-stress-core', function (e) {
        var aStress = [["Physical","1,2,3"],["Mental","1,2,3"]]
        fs_adversary.adversaryAddStress(aStress);
      });

      $(document).on('click', '.js-add-stress-fae', function (e) {
        var aStress = [["Stress","1,2,3"]]
        fs_adversary.adversaryAddStress(aStress);
      });

      $(document).on('click', '.js-add-consequence', function (e) {
         var $item = $(".js-adversary-consequences:first").clone().addClass('adversary-item-copy').insertAfter(".js-adversary-consequences:last")
            $('div:first', $item).addClass('input-group-prepend')
              .append('<div class="input-group-text btn btn-danger js-delete-adversary-item">X</div>');
      });

      $(document).on('click', '.js-add-consequence-default', function (e) {
          var aConsequences = [["Mild","-2"],["Moderate","-4"],["Severe","-6"]]
          fs_adversary.adversaryAddConsequences(aConsequences);
      });

      $(document).on('click', '.js-delete-adversary-item', function (e) {
          $(this).parent().parent().remove();
      });

      $(document).on('click', '.js-close-adversary-edit', function (e) {
        $('.js-adversary-list').removeClass('hidden');
        $('#adversaryForm').addClass('hidden');
      });

      $(document).on('click', '.js-create-adversary', function (e) {
        fs_adversary.clearAdversaryForm();
        $('.js-adversary-list').addClass('hidden');
        $('#adversaryForm').removeClass('hidden');
        $('#adversary_name').attr('disabled', false);
      });

      $(document).on('click', '.js-adversary-tag', function (e) {
        $('#search-text').val($(this).data('search-text'));
        $("#search-button").click();
      });

      $(document).on('change', '#my_adversaries', function (e) {
        //this resets the whole results so clear the search text if it's not empty
        $('#search-text').val('');
        //refresh the adversary list
        fs_adversary.listAdversaries($('#search-text').val());
      });

      $(document).on('change', '#adversary_name', function (e) {
        var slug = fatesheet.slugify($(this).val());
        $('#adversary_slug').val(slug);
      });

      $(document).on('change', '#search-text', function (e) {
        var $this = $(this);
        if ($this.val() !== '') {
          $('.fs-tools').removeClass('hidden');
        }
        else {
          $('.fs-tools').addClass('hidden');
        }
      });

      $(document).on('submit', '#adversaryForm', function (e) {
          e.preventDefault();
          upsertAdversary();
      });

      $(document).on('show.bs.modal', '#modalDeleteAdversaryConfirm', function (event) {
          var modal = $(this);
      })
    }

    function configEnvironment(env) {
      switch (env) {
          case 'develop':
          case 'beta':
              fs_adversary.config.adversarytable = 'fate_adversary_dev';
              break;

          default:
              fs_adversary.config.adversarytable = 'fate_adversary';
      }
    }

    function configureRoutes() {
        //String rule with param:
        var advRoute1 = crossroads.addRoute('/', function () {
            fatesheet.setTitle('Fate Adversary');
            fs_adversary.listAdversaries();
        });

        var advRoute2 = crossroads.addRoute('/{slug}', function (slug) {
            var title = slug.replace(/-/g,' ').toTitleCase();
            fatesheet.setTitle(title, 'Fate Adversary');
            fs_adversary.listAdversaries(slug);
        });
    }

    fs_adversary.init = function () {
      domEvents();
      configEnvironment(fatesheet.config.environment);
      configureRoutes();
    }

})(window.fs_adversary = window.fs_adversary || {}, jQuery);

$(function () {
  fs_adversary.init();
});
