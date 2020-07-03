<template>
	<div class="px-1 d-flex">
    <label class="px-1 pt-1" :class="{ 'd-none' : labelHidden }" :for="stress.obj">{{stress.label}}</label>
    <input type="checkbox" :value="stress.value" :id="stress.obj" :name="stress.obj" @change="setVal(stress.obj,  $event.target.checked)" 
      :checked="$parent.getVal(stress.obj)" :disabled="!skillHasValue()" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputStress',
  props: {
    stress: Object,
    stresstype: String,
    hidelabel: String,
  },
  computed: {
 	  ...mapGetters([
      'isAuthenticated',      
      'vttEnabled'
    ]),   
    labelHidden() {      
      return this.hidelabel && this.hidelabel == "true" ? true : false;
    }
  },
  data () {
    return {
    }
  },
  methods: {    
    setVal(arr, val) {
      if (this.vttEnabled) {      
        let label = this.stresstype ? `${this.stress.label} ${this.stresstype}` : this.stress.label;
        this.$parent.sendToVTT("stress", label, arr, val);
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
