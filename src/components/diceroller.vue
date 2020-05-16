<template>
      <!-- dice tray -->
    <div class="modal fade" id="modalDiceRoller" tabindex="-1" role="dialog" aria-labelledby="diceRollerLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
      <div class="modal-dialog" role="document">
          <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title" id="diceRollerLabel"> <span class="dice">+</span> Fate Dice Roller <span class="dice">-</span></h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                  </button>
              </div>
              <div class="row px-0 mx-0 pt-1 pb-1 roll-modifier">
                  <label class="col-4 h5 pt-2">Roll Modifier</label> <input class="form-control col-2 text-center" type="number" id="rollModifier">
              </div>
              <div class="modal-body">
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-primary" v-on:click="DiceRoller()">Roll</button>
                  <button type="button" class="btn btn-warning" v-on:click="ClearDiceTray()">Clear</button>
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
          </div>
      </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { DiceRoller } from 'rpg-dice-roller';

export default {
  name: 'DiceRoller',
  mounted() {    
  },
  computed: {
   
  },
  data () {
    return {
      diceRoller: null,
    }
  },
  methods: {

    DiceRoller() {    
      if (!this.diceRoller)
      {      
        const roller = new DiceRoller();
        this.diceRoller = roller;
      }
            
      $('.current-roll').removeClass('current-roll');

      var $diceTray = $('.modal-body', '#modalDiceRoller');
      var modifier = $('#rollModifier').val();
      // affixe a + on front of the modifier if it's missing
      modifier = (modifier !== '' && modifier.indexOf('-') === -1) ? "+" + modifier : modifier;

      this.diceRoller.roll('4dF.2' + modifier);

      // get the latest dice rolls from the log
      var latestRoll = this.diceRoller.log.shift();
      var displayDice = '';

      $.each(latestRoll.rolls[0].rolls, function (key, value) {
          switch (value.value) {
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

      var rollElem = "<p class='dice-roll current-roll'>" + displayDice + (modifier !== '' ? ' (' + modifier + ')' : '') + " = " + latestRoll.total + "</p>";
      $diceTray.prepend(rollElem);
    },

    ClearDiceTray() {
        this.diceRoller.clearLog();
        var $diceTray = $('.modal-body', '#modalDiceRoller');
        $diceTray.empty();
    }
  }

}
</script>

<style lang="scss" scoped>

</style>
