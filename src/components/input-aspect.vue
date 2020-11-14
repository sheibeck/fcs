<template>
  <div class="form-group">    
    <div v-if="showlabel" class="d-flex">
      <!--custom labels-->      
      <input v-if="customlabel && !editlock" class="w-100 mr-auto inputlabel" type="text" 
        @change="$parent.setVal(`${aspect.label}`,  $event.target.value)" 
        :value="$parent.getVal(`${aspect.label}`)" :placeholder="aspect.placeholder" />      
      <label v-else>{{getLabelValue}}</label>

      <button type="button" v-if="removable && !editlock" class="btn btn-link text-secondary m-0 p-0" v-on:click="removeAspect(aspect.id)">
        <i title="Delete Aspect" class="fas d-print-none fa-minus-circle pr-2"></i>
      </button>
    </div>
    <div class="d-flex">
      <span v-if="vttEnabled" class="dice fo20 pt-2 pr-1" v-on:click="sendToVTT('invoke', 'aspect', 'aspects', aspect.obj)">C</span>      
      <input type="text" class="form-control" :id="aspect.obj" :name="'aspects.' + aspect.obj" @change="$parent.setVal(aspect.obj,  $event.target.value)" 
        :value="$parent.getVal(aspect.obj)" :placeholder="getPlaceHolder" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InputAspect',
  props: {
    aspect: Object,    
    showlabel: Boolean,
    removable: Boolean,
    customlabel: Boolean,
    editlock: Boolean
  },
  computed: {
 	  ...mapGetters([
      'isAuthenticated',
      'vttEnabled'
    ]),   
    getPlaceHolder() {        
      if (this.customlabel) {
        let labelValue = this.$parent.getVal(this.aspect.label);
        if (labelValue) {
          return labelValue;
        }
        else {
          return this.aspect.placeholder;
        }
      }
      return this.aspect.label;
    },
    getLabelValue() {
      if (!this.customlabel) {
        return this.aspect.label;
      }
      else {
        let value = this.$parent.getVal(`${this.aspect.label}`);
        return (!value) ? this.aspect.placeholder : value;
      }
    }
  },
  data () {
    return {
    }
  },
  methods: { 
    sendToVTT() {   
      if (!this.aspect || !this.aspect.label) return;
      let label = `aspect ${this.aspect.label}`;
      this.$parent.sendToVTT('invoke', label, "aspects", this.aspect.obj);
    },
    removeAspect(id) {      
      this.$emit('remove-aspect', id);
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
