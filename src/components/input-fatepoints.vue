<template>
	<div class="">
    <input type="number" class="form-control text-center pr-md-0 pl-3" :class="inputclass" id="fatepoints" name="fatepoints"
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
      'vttEnabled'
    ]),  
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
      if (this.vttEnabled) {        
        let oldVal = this.$parent.character[arr];
        if (!oldVal || (parseInt(oldVal) < parseInt(val))) {
          this.$parent.sendToVTT("fatepoint", null, arr, "1");
        }
        else {
          this.$parent.sendToVTT("fatepoint", null, arr, "-1");
        }
 
        this.$parent.setVal(arr, val);
        this.$emit('save-character');
      } 
      else 
      {
        this.$parent.setVal(arr, val);
      }   
    },   
  }
}
</script>

<style lang="scss" scoped>
</style>
