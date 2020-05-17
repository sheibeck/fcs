<template>
	<div class="px-2">
    <label :for="stress.obj">{{stress.label}}</label>
    <input type="checkbox" :value="stress.value" :id="`stress.${stress.obj}`" name="`stress.${stress.obj}`" @change="setVal(`stress.${stress.obj}`,  $event.target.checked)" :checked="$parent.getVal(`stress.${stress.obj}`)" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputStressAccelerated',
  props: {
    stress: Object,    
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
    setVal(arr, val) {       
      if (this.roll20Enabled) {
        this.$parent.sendToRoll20("stress", this.stress.label, arr, val);
        this.$parent.setVal(arr, val);
        this.$parent.$parent.$parent.save();
      } 
      else {
        this.$parent.setVal(arr, val);
      }
    },   
  }
}
</script>

<style lang="scss" scoped>
  label {
    font-family: 'Archivo Black', sans-serif;
    text-transform: uppercase;
    font-size: 1.75em;
    font-weight: 700;
  }

  input[type=checkbox] {
    height: 50px;
    width: 50px;
  }
</style>
