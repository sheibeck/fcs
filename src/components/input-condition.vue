<template>
  <div class="d-md-flex">
    <label class="form-check-label col-form-label order-md-2 pr-2 pt-2 mt-1" v-if="!condition.placeholder">
      {{condition.label}}
    </label>

    <input v-if="condition.placeholder" class="order-md-2 fate-condition-label col-form-label" type="text" 
      :name="condition.label" :id="condition.label" @change="setVal('conditions.condition1',  $event.target.value)" :value="$parent.getVal(condition.label)" :placeholder="condition.placeholder" />

    <div class="d-flex">       
      <span class="p-1 order-md-1 d-flex justify-content-between" v-for="box in condition.items" :key="box.obj">
        <label v-if="box.label" :for="box.obj">{{box.label}}</label>
        <input type="checkbox" :value="box.value" :name="box.obj" :id="box.obj" @change="setVal(box.obj, $event.target.checked)" :checked="$parent.getVal(box.obj)" />
      </span>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputCondition',
  props: {
    condition: Object,    
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
        let label = this.$parent.getVal(this.condition.label) || this.condition.label;
        
        this.$parent.sendToRoll20("condition", label, arr, val);
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
