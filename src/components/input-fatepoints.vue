<template>
	<div class="">
    <input type="number" class="form-control text-center" :class="inputclass" id="fatepoints" name="fatepoints"
       @change="setVal('fatepoints',  $event.target.value)" :value="$parent.getVal('fatepoints')" :placeholder="getPlaceHolder" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputFatePoints',
  props: {
    inputclass: String,
    placeholder: String   
  },
  computed: {
 	  ...mapGetters([
      'isAuthenticated',      
      'roll20Enabled'
    ]),
    hasRoll20() {
      return this.isAuthenticated && this.roll20Enabled;
    },
    getPlaceHolder() {
      return this.placeholder || "Fate Points";
    }
  },
  data () {
    return {
    }
  },
  methods: {    
    setVal(arr, val) {          
      if (this.roll20Enabled) {
        let oldVal = this.$parent.character[arr];
        if (!oldVal || (parseInt(oldVal) < parseInt(val))) {
          this.$parent.sendToRoll20("fatepoint", null, arr, "1");
        }
        else {
          this.$parent.sendToRoll20("fatepoint", null, arr, "-1");
        }
      }
     
      this.$parent.setVal(arr, val);
      this.$parent.$parent.$parent.save();    
    },   
  }
}
</script>

<style lang="scss" scoped>
</style>
