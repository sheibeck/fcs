<template>
  <div class="d-md-flex">
    <label class="form-check-label col-form-label order-md-2 pr-2 pt-2 mt-1" v-if="!stress.placeholder">
      {{stress.label}}
    </label>

    <input v-if="stress.placeholder" class="order-md-2 fate-stress-label col-form-label" type="text" 
      :name="stress.label" :id="stress.label" @change="setVal(stress.label,  $event.target.value)" :value="$parent.getVal(stress.label)" :placeholder="stress.placeholder" />

    <div class="d-flex">       
      <span class="p-1 order-md-1 d-flex justify-content-between" v-for="box in stress.items" :key="box.obj">
        <label v-if="box.label" :for="box.obj">{{box.label}}</label>
        <input type="checkbox" :value="box.value" :name="box.obj" :id="box.obj" @change="setVal(box.obj, $event.target.checked)" :checked="$parent.getVal(box.obj)" />
      </span>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputStress',
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
        let label = this.$parent.getVal(this.stress.label) || this.stress.label;
        
        this.$parent.sendToRoll20("stress", label, arr, val);
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
