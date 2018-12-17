
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
