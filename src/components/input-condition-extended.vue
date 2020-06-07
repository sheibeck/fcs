<template>
  <div class="d-md-flex">
    <label class="form-check-label col-form-label order-md-2 pr-2 pt-2 mt-1" v-if="!condition.placeholder">
      {{condition.label}}
    </label>
    
    <div class="w-100">
      <div class="p-1 order-md-1 d-flex justify-content-between" v-for="box in condition.items" :key="box.obj">
        <div class="pr-1 px-0 mr-auto">
          <label v-if="box.label" :for="box.obj">{{box.label}}</label><br/>
          <div class="help-text" v-if="box.description">{{box.description}}</div>
        </div>
        <div class="py-0 px-0 d-flex">
          <label class="px-1 pt-1" :class="{ 'd-none' : !showValue }" :for="box.obj">{{box.value}}</label>
          <input type="checkbox" :value="box.value" :name="box.obj" :id="box.obj" @change="setVal(box.label, box.obj, $event.target.checked)" :checked="getVal(box.obj, box.defaultValue)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputConditionExtended',
  props: {
    condition: Object,
    vertical: String,
    showvalue: String,      
  },
  computed: {
 	  ...mapGetters([
      'isAuthenticated',      
      'roll20Enabled'
    ]),
    hasRoll20() {
      return this.isAuthenticated && this.roll20Enabled;
    },
    isVertical() {
      return this.vertical == "true" || false;
    },
    showValue() {
       return this.showvalue == "true" || false;
    }
  },
  data () {
    return {
    }
  },
  methods: {   
    getVal(graphPath, defaultValue) {      
      return this.$parent.getVal(graphPath, defaultValue);
    },
    setVal(label, arr, val) {             
      if (this.roll20Enabled) {        
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
