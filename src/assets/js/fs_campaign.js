import CommonService from "./commonService";

/***********************************
        CAMPAIGNS
***********************************/
(function (fs_camp, $, commonSvc, undefined) {
    let fcs = null;

    fs_camp.config = {
        campaigntable: '',
    } 

    function domEvents() {
        $(document).on('click', '.js-share', function (e) {
            e.preventDefault();
            commonSvc.GetShareUrl($(this));
        });

        $(document).on('show.bs.modal', '#modalDeleteConfirm', function (event) {
            var button = $(event.relatedTarget) // Button that triggered the modal
            var id = button.data('id') // Extract info from data-* attributes
            // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
            // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
            var modal = $(this);
            $(modal.find('.js-delete')).data('id', id);
        });

        $(document).on('show.bs.modal', '#modalDeleteSessionConfirm', function (event) {
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
          case 'production':
              fs_camp.config.campaigntable = 'fate_campaign';
              break;

          default:
              fs_camp.config.campaigntable = 'fate_campaign_dev';
      }
    }

    fs_camp.init = function (vueInstance) {
        fcs = vueInstance;  
        domEvents();
        configEnvironment(fcs.$store.state.environment);
    }

})(window.fs_camp = window.fs_camp || {}, jQuery, new CommonService());
