
/***********************************
        CHARACTERS & SHEETS
***********************************/
(function (fs_char, $, undefined) {
    fs_char.config = {
        charactersheettable: '',
        charactertable: '',
    }

    fs_char.navigation = {
        character: {
            auth: "<hr/><div class='row'><div class='col'>" +
                        "   <button type='button' class='btn btn-success js-save-character d-print-none'>Save Character <i class='fa fa-save'></i></button>" +
                        "   <button type='button' class='btn btn-secondary' onclick='hasher.setHash(\"/\");'>Close <i class='fa fa-times-circle'></i></button>" +
                        "   <button type='button' class='btn btn-default d-print-none' onclick='window.print();'>Print Character <i class='fa fa-print'></i></button>" +
                        "</div></div>",
            noauth: "<hr/><div class='row'><div class='col'>" +
            "   <button type='button' class='btn btn-secondary' onclick='hasher.setHash(\"/\");'>Close <i class='fa fa-times-circle'></i></button>" +
                        "    <button type='button' class='btn btn-default d-print-none' onclick='window.print();'>Print Character <i class='fa fa-print'></i></button>" +
                        "</div></div>",

        },
        sheet: {
            auth: "<hr/><div class='row'><div class='col'>" +
                   "    <button type='button' class='btn btn-success js-create-character d-print-none'>Save Character <i class='fa fa-user'></i></button>" +
                   "   <button type='button' class='btn btn-secondary' onclick='hasher.setHash(\"/\");'>Close <i class='fa fa-times-circle'></i></button>" +
                   "    <button type='button' class='btn btn-default d-print-none' onclick='window.print();'>Print Character <i class='fa fa-print'></i></button>" +
                   "</div></div>",
            noauth: "<hr/><div class='row'><div class='col'>" +
            "   <button type='button' class='btn btn-secondary' onclick='hasher.setHash(\"/\");'>Close <i class='fa fa-times-circle'></i></button>" +
                    "    <button type='button' class='btn btn-default d-print-none' onclick='window.print();'>Print Character <i class='fa fa-print'></i></button>" +
                    "</div></div>",
        }

    }

    function getDBClient()  {
      return fatesheet.getDBClient();
    }

    var fate_character_helpers = {
      slugify: function (val) {
          return fatesheet.slugify(val);
      },
      getCharacterValue: function(data, item) {
          var itemValue = eval('data.' + item);
          return itemValue;
      }
    };

    function getCharacterInfo(id) {
      // Create DynamoDB document client
      var docClient = getDBClient();

      var params = {
          TableName: fs_char.config.charactertable,
          Select: 'ALL_ATTRIBUTES',
          ExpressionAttributeValues: {':character_id' : id },
          FilterExpression: 'character_id = :character_id'
      }

      docClient.scan(params, function (err, data) {
          if (err) {
              console.log("Error", err);
          } else {
              var characterData = data.Items[0];
              console.log("Success", characterData);

              fatesheet.setTitle(characterData.name + ' (Character)')

              //if the viewer isn't the character owner then don't let them save it
              // it would just copy it to their account, but for now we'll just
              // remove the option
              if (characterData.character_owner_id !== fatesheet.config.userId)
              {
                $('.js-save-character').remove();
              }

              $('form').populate(characterData);

              //check if there is an autocalc function and runit
              if (typeof autocalc !== "undefined") {
                  autocalc();
              }
          }
      });
    }

    fs_char.listCharacters = function ($contentElem) {

        // Create DynamoDB document client
        var docClient = getDBClient();

        var params = {
            TableName: fs_char.config.charactertable,
            Select: 'ALL_ATTRIBUTES',
            ExpressionAttributeValues: {':owner_id' : fatesheet.config.userId },
            FilterExpression: 'character_owner_id = :owner_id'
        }

        docClient.scan(params, function (err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data.Items);

                return data.Items;
            }
        });
    }

    fs_char.saveCharacter = function () {
        if (fatesheet.config.isAuthenticated) {
            /// save a character
            var data = $('form').serializeJSON();
            var characterData = JSON.parse(data);

            // make sure we have a proper user id key
            characterData.character_owner_id = fatesheet.config.userId;

            //create a new characterId if we don't have one
            var isNew = false;
            if (!fs_char.config.characterId) {
                isNew = true;
                fs_char.config.characterId = fatesheet.generateUUID();
                fatesheet.logAnalyticEvent('createdACharacter' + characterData.sheetname);
            }
            characterData.character_id = fs_char.config.characterId;

            //dynamodb won't let us have empty attributes
            fatesheet.removeEmptyObjects(characterData);

            var docClient = getDBClient();

            // create/update a  character
            // we always use the put operation because the data can change depending on your character sheet
            var params = {
                TableName: fs_char.config.charactertable,
                Item: characterData
            };

            docClient.put(params, function (err, data) {
                if (err) {
                    fatesheet.notify(err.message || JSON.stringify(err));
                    console.error("Unable to save item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    fatesheet.notify('Character saved.', 'success', 2000);
                    console.log("Added item:", JSON.stringify(data, null, 2));
                }
            });
        }
        else {
            window.print();
        }
    }

    fs_char.deleteCharacter = function (characterId) {
      var docClient = getDBClient();

      var params = {
          TableName: fs_char.config.charactertable,
          Key: {
            'character_owner_id': fatesheet.config.userId,
            'character_id': characterId
          }
      };

      console.log("Deleting a character...");
      docClient.delete(params, function (err, data) {
          if (err) {
              fatesheet.notify(err.message || JSON.stringify(err));
              console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
          } else {
              $('#modalDeleteCharacterConfirm').modal('hide');
              fatesheet.notify('Character deleted.', 'success', 2000, function() { fs_char.listCharacters(fatesheet.config.content) });
              console.log("Added item:", JSON.stringify(data, null, 2));
          }
      });
    }

    fs_char.getShareUrl = function($obj) {
      var baseUrl = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      var shareUrl = baseUrl + $obj.prev().attr('href');

      var tempInput = document.createElement("input");
      tempInput.style = "position: absolute; left: -1000px; top: -1000px";
      tempInput.value = shareUrl;
      console.log(shareUrl);

      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);

      fatesheet.notify('Copied character url to clipboard', 'info', 2000);
    }

    function domEvents() {
        $(document).on('click', '.js-share-character', function (e) {
            e.preventDefault();

            fs_char.getShareUrl($(this));
        });

        $(document).on('click', '.js-delete-character', function (e) {
            e.preventDefault();

            var key = $(this).data('id');
            fs_char.deleteCharacter(key);
        });

        $(document).on('click', '.js-create-character', function (e) {
            e.preventDefault();
            fs_char.saveCharacter();
        });

        $(document).on('click', '.js-save-character', function (e) {
            e.preventDefault();
            fs_char.saveCharacter();
        });

        $(document).on('show.bs.modal', '#modalDeleteCharacterConfirm', function (event) {
            var button = $(event.relatedTarget) // Button that triggered the modal
            var characterId = button.data('id') // Extract info from data-* attributes
            // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
            // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
            var modal = $(this);
            $(modal.find('.js-delete-character')).data('id', characterId);
        });
    }

    function configEnvironment(env) {
      switch (env) {
          case 'develop':
          case 'beta':
              fs_char.config.charactersheettable = 'fate_charactersheet_dev';
              fs_char.config.charactertable = 'fate_character_dev';
              break;

          default:
              fs_char.config.charactersheettable = 'fate_charactersheet';
              fs_char.config.charactertable = 'fate_character';
      }
    }

    function configureRoutes() {
        //String rule with param:
        //match '/news/123' passing "123" as param to handler

        if (location.pathname === '/charactersheets.htm') {
            var csRoute1 = crossroads.addRoute('/{id}', function (id) {
                var title = id.replace(/-/g,' ').toTitleCase();
                fatesheet.setTitle(title);

                // update metadata based on the sheet
                var ogImage = 'https://fatecharactersheet.com/' + id + '/sheets/logo.png';

                $('meta[property="og:title"]').attr('content', title);
                $('meta[property="og:image"]').attr('content', ogImage);
                $('meta[property="og:url"]').attr('content', window.location.href);


                fs_char.showSheet(id, null, fatesheet.config.content);
            });

            var csRoute2 = crossroads.addRoute('/', function () {
                fatesheet.setTitle('Character Sheets');

                // update metadata based on the sheet
                var ogImage = "https://fatecharactersheet.com/big-logo.png";

                $('meta[property="og:title"]').attr('content', 'Character Sheets');
                $('meta[property="og:image"]').attr('content', ogImage);
                $('meta[property="og:url"]').attr('content', window.location.href);

                fs_char.listSheets(fatesheet.config.content);
            });
        }

        if (location.pathname === '/characters.htm') {
            var charRoute1 = crossroads.addRoute('/{sheetid}/{id}/{name}', function (sheetid, id) {
                fs_char.showSheet(sheetid, id, fatesheet.config.content)
            });

            var charRoute1 = crossroads.addRoute('/{sheetid}/{id}', function (sheetid, id) {
                fs_char.showSheet(sheetid, id, fatesheet.config.content)
            });

            var charRoute2 = crossroads.addRoute('/', function () {
                fs_char.listCharacters(fatesheet.config.content);
            });
        }
    }

    fs_char.init = function () {
        domEvents();
        configEnvironment(fatesheet.config.environment);
        configureRoutes();
    }

})(window.fs_char = window.fs_char || {}, jQuery);
