/***********************************
        DICE TRAY
***********************************/
(function (fs_dicetray, $, undefined) {


  /***********************************
          CONFIG
  ***********************************/
    fs_dicetray.config = {
        diceRoller: new DiceRoller(),
    }

    fs_dicetray.diceRoller = function () {

        $('.current-roll').removeClass('current-roll');

        var $diceTray = $('.modal-body', '#modalDiceRoller');
        var modifier = $('#rollModifier').val();
        // affixe a + on front of the modifier if it's missing
        modifier = (modifier !== '' && modifier.indexOf('-') === -1) ? "+" + modifier : modifier;

        fs_dicetray.config.diceRoller.roll('4dF.2' + modifier);

        // get the latest dice rolls from the log
        var latestRoll = fs_dicetray.config.diceRoller.getLog().shift();
        var displayDice = '';

        $.each(latestRoll.rolls[0], function (key, value) {
            switch (value) {
                case -1:
                    displayDice += '<span class="dice">-</span>';
                    break;
                case 1:
                    displayDice += '<span class="dice">+</span>';
                    break;
                default:
                    displayDice += '<span class="dice">0</span>';
                    break;
            }
        });

        var rollElem = "<p class='dice-roll current-roll'>" + displayDice + (modifier !== '' ? ' (' + modifier + ')' : '') + " = " + latestRoll.getTotal() + "</p>";
        $diceTray.prepend(rollElem);
    }

    fs_dicetray.clearDiceTray = function () {
        fs_dicetray.config.diceRoller.clearLog();
        var $diceTray = $('.modal-body', '#modalDiceRoller');
        $diceTray.empty();
    }

    function domEvents() {
        $(document).on('click', '.js-roll-dice', function (e) {
            fs_dicetray.diceRoller();
        });

        $(document).on('click', '.js-clear-dice', function (e) {
            fs_dicetray.clearDiceTray();
        });
    }

    fs_dicetray.init = function () {
        domEvents();
    }

})(window.fs_dicetray = window.fs_dicetray || {}, jQuery);

$(function () {
  fs_dicetray.init();
});
