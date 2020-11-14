<template>
	<div class="d-flex">
    <!--custom labels-->
    <input v-if="customlabel && !editlock" style="width:30px;" class="mr-auto inputlabel text-center" :class="{ 'd-none' : labelHidden }" type="text" 
      @change="$parent.setVal(`${stress.label}`,  $event.target.value)" 
      :value="$parent.getVal(`${stress.label}`)" :placeholder="stress.placeholder" />
    <label v-else class="px-1 pt-1" :class="{ 'd-none' : labelHidden }" :for="stress.obj">{{getLabelValue}}</label>
    <input type="checkbox" :value="stress.value" :id="stress.obj" :name="stress.obj" @change="setVal(stress.obj,  $event.target.checked)" 
      :checked="$parent.getVal(stress.obj)" :disabled="!skillHasValue()" />      
    <button type="button" v-if="removable && !editlock" class="btn btn-link text-secondary m-0 p-0" v-on:click="removeStressBox(stress.id, parentid)">
        <i title="Delete Stress Box" class="fas d-print-none fa-minus-circle"></i>
    </button>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputStress',
  props: {
    stress: Object,
    stresstype: String,
    hidelabel: Boolean,
    removable: Boolean,
    parentid: Number,
    customlabel: Boolean,
    editlock: Boolean,
  },
  computed: {
 	  ...mapGetters([
      'isAuthenticated',      
      'vttEnabled'
    ]),   
    labelHidden() {      
      return this.hidelabel && this.hidelabel == "true" ? true : false;
    },
    getLabelValue() {
      if (!this.customlabel) {
        return this.stress.label;
      }
      else {
        let value = this.$parent.getVal(`${this.stress.label}`);
        return (!value) ? this.stress.placeholder : value;
      }
    }
  },
  data () {
    return {
    }
  },
  methods: {    
    setVal(arr, val) {
      this.$parent.setVal(arr, val);
     
      if (this.vttEnabled) {
        let label = null;
        if (this.customlabel) {
          let stressVal = this.$parent.getVal(this.stress.label) ? this.$parent.getVal(this.stress.label) : this.stress.placeholder;
          label = this.stresstype ? `${stressVal} ${this.stresstype}` : `${stressVal} Stress`;
        } else {
          label = this.stresstype ? `${this.stress.label} ${this.stresstype}` : this.stress.label;
        }
        this.$parent.sendToVTT("stress", label, arr, val);      
        this.$emit('save-character');
      } 
    },
    skillHasValue() {
      if (!this.stress.requirement) return true;      
      let hasVal = this.$parent.skillHasValue(this.stress.requirement.obj, this.stress.requirement.val);      
      return hasVal;
    },
    removeStressBox(id, parentid) {
      this.$emit('remove-stress-box', id, parentid);
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
