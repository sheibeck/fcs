import CommonService from "./commonService";
import UserService from "./userService";

/***********************************
        CHARACTERS & SHEETS
***********************************/
(function (fs_char, $, commonSvc, userSvc, undefined) {
    let fcs = null;

    fs_char.config = {
        charactersheettable: '',
        charactertable: '',
    }

    function domEvents() {      
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

    fs_char.init = function (vueInstance) {        
        fcs = vueInstance;
        domEvents();
        configEnvironment(fcs.$store.state.environment);
    }

})(window.fs_char = window.fs_char || {}, jQuery, new CommonService(), new UserService());
