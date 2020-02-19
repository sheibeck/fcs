
/***********************************
        CAMPAIGNS
***********************************/
(function (fs_camp, $, undefined) {
    fs_camp.config = {
        campaigntable: '',        
    }

    fs_camp.getShareUrl = function($obj) {
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

      fatesheet.notify('Copied campaign url to clipboard', 'info', 2000);
    }

    function domEvents() {
        $(document).on('click', '.js-share', function (e) {
            e.preventDefault();

            fs_camp.getShareUrl($(this));
        });

        $(document).on('show.bs.modal', '#modalDeleteConfirm', function (event) {
            var button = $(event.relatedTarget) // Button that triggered the modal
            var id = button.data('id') // Extract info from data-* attributes
            // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
            // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
            var modal = $(this);
            $(modal.find('.js-delete')).data('id', id);
        });
    }

    function configEnvironment(env) {
      switch (env) {
          case 'develop':
          case 'beta':
              fs_camp.config.campaigntable = 'fate_campaign_dev';              
              break;

          default:
              fs_camp.config.campaigntable = 'fate_campaign';              
      }
    }

    fs_camp.init = function () {
        domEvents();
        configEnvironment(fatesheet.config.environment);
    }

})(window.fs_camp = window.fs_camp || {}, jQuery);
