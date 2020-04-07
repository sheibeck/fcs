/***********************************
        ADVERSARY
***********************************/
(function (fs_adversary, $, undefined) {
    fs_adversary.config = {
        adversarytable: '',
    }

    function domEvents() {
      $(document).on('click', '.js-delete-adversary-item', function (e) {
          $(this).parent().parent().remove();
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
    }

    function configEnvironment(env) {
      switch (env) {
          case 'production':
              fs_adversary.config.adversarytable = 'fate_adversary';
              break;

          default:
              fs_adversary.config.adversarytable = 'fate_adversary_dev';
      }
    }

    fs_adversary.init = function () {
      domEvents();
      configEnvironment(fatesheet.config.environment);
    }

})(window.fs_adversary = window.fs_adversary || {}, jQuery);