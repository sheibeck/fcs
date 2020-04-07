
/***********************************
        CHARACTERS & SHEETS
***********************************/
(function (fs_char, $, undefined) {
    fs_char.config = {
        charactersheettable: '',
        charactertable: '',
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
          case 'production':
              fs_char.config.charactersheettable = 'fate_charactersheet';
              fs_char.config.charactertable = 'fate_character';
              break;

          default:
              fs_char.config.charactersheettable = 'fate_charactersheet_dev';
              fs_char.config.charactertable = 'fate_character_dev';
      }
    }

    fs_char.init = function () {
        domEvents();
        configEnvironment(fatesheet.config.environment);
    }

})(window.fs_char = window.fs_char || {}, jQuery);
