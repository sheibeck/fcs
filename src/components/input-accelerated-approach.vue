<template>
  <div class="form-group d-flex">
      <span v-if="hasRoll20" class="dice fo20 pt-2" v-on:click="sendToRoll20()">+</span>
      <label class="p-1 mr-auto">{{item}}</label>
      <input class="form-control text-center w-25" type="text" :id="item" :name="item" 
        @change="$parent.setVal(`approaches.${item}`,  $event.target.value)" 
        :value="$parent.getVal(`approaches.${item}`)" placeholder="+">			  
    </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputAcceleratedApproach',
  props: {
    item: String,    
  },
  computed: {
 	  ...mapGetters([
      'isAuthenticated',      
      'roll20Enabled'
    ]),
    hasRoll20() {
      return this.isAuthenticated && this.roll20Enabled;
    }
  },
  data () {
    return {
    }
  },
  methods: { 
    sendToRoll20() {
      if (!this.item) return;      
      let label = `approach ${this.item.toTitleCase()}`;
      this.$parent.sendToRoll20('diceroll', label, "approaches", this.item);
    }
  }
}
</script>

<style lang="scss" scoped>
  label {
    font-family: 'Archivo Black', sans-serif;
    text-transform: uppercase;
    font-size: 22px;
    font-weight: 700;
  }
</style>
