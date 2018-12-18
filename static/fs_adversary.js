/***********************************
        ADVERSARY
***********************************/
(function (fs_adversary, $, undefined) {
    fs_adversary.config = {
        adversarytable: '',
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

      $(document).on('click', '.js-delete-adversary-item', function (e) {
          $(this).parent().parent().remove();
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

    fs_adversary.init = function () {
      domEvents();
      configEnvironment(fatesheet.config.environment);
    }

})(window.fs_adversary = window.fs_adversary || {}, jQuery);

$(function () {
  fs_adversary.init();
});
