<template>
	<div class="px-1 d-flex justify-content-between">
    <label class="px-1" :for="stress.obj">{{stress.label}}</label>
    <input type="checkbox" :value="stress.value" :id="`${stress.obj}`" name="${stress.obj}" @change="setVal(stress.obj,  $event.target.checked)" :checked="$parent.getVal(stress.obj)" />
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
</style>
