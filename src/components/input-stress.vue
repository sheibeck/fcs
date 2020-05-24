<template>
	<div class="px-1 d-flex">
    <label class="px-1 pt-1" :for="stress.obj">{{stress.label}}</label>
    <input type="checkbox" :value="stress.value" :id="`${stress.obj}`" name="${stress.obj}" @change="setVal(stress.obj,  $event.target.checked)" 
      :checked="$parent.getVal(stress.obj)" :disabled="!skillHasValue()" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputStress',
  props: {
    stress: Object,
    stresstype: String
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
        let label = this.stresstype ? `${this.stresstype} ${this.stress.label}` : this.stress.label;
        this.$parent.sendToRoll20("stress", label, arr, val);
        this.$parent.setVal(arr, val);
        this.$parent.$parent.$parent.save();
      } 
      else {
        this.$parent.setVal(arr, val);
      }
    },   
    skillHasValue() {
      if (!this.stress.requirement) return true;      
      let hasVal = this.$parent.skillHasValue(this.stress.requirement.obj, this.stress.requirement.val);      
      return hasVal;
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
