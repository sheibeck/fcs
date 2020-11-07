<template>
	<div class="form-group d-flex flex-column">    
    <div class="d-flex" v-if="customlabel">
      <span v-if="vttEnabled" class="dice fo20 pt-1 pr-1" v-on:click="sendToVTT()">C</span>
      <!--custom labels-->
      <input v-if="!editlock" class="w-75 mr-auto inputlabel" type="text" 
        @change="$parent.setVal(`${consequence.label}`,  $event.target.value)" 
        :value="$parent.getVal(`${consequence.label}`)" :placeholder="consequence.placeholder" />
      <label v-if="editlock">{{getLabel}}</label>

      <button type="button" v-if="removable && !editlock" class="btn btn-link text-secondary m-0 p-0" v-on:click="removeConsequence(consequence.id)">
        <i title="Delete Consequence" class="fas d-print-none fa-minus-circle"></i>
      </button>
    </div>
          
    <div class="d-flex">
      <span v-if="!customlabel && vttEnabled" class="dice fo20 pt-1 pr-1" v-on:click="sendToVTT()">C</span>
      <input v-if="customlabel && editlock" style="width:40px;" class="mr-auto inputlabel text-center" type="text" 
        @change="$parent.setVal(`${consequence.value}`,  $event.target.value)" 
        :value="$parent.getVal(`${consequence.value}`)" :placeholder="consequence.valueplaceholder" />      
      <label v-else class="pr-3">{{getLabelValue}}</label>
      
      <input type="text" class="form-control" :id="consequence.obj" :name="consequence.obj" 
          @change="setVal(consequence.obj,  $event.target.value)" :value="$parent.getVal(consequence.obj)" :placeholder="getPlaceHolder"
          :disabled="!skillHasValue()" />    
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InputConsequence',
  props: {
    consequence: Object,
    customlabel: Boolean,
    removable: Boolean,
    editlock: Boolean
  },
  computed: {
 	  ...mapGetters([
      'isAuthenticated',      
      'vttEnabled'
    ]),   
    getPlaceHolder() {      
      if (this.customlabel) {
        let labelValue = this.$parent.getVal(this.consequence.label);
        if (labelValue) {
          return labelValue;
        }
        else {
          return this.consequence.placeholder;
        }
      }
      return this.consequence.label;
    },
    getLabel() {
      if (!this.customlabel) {
        return this.consequence.label;
      }
      else {
        let value = this.$parent.getVal(`${this.consequence.label}`);
        return (!value) ? this.consequence.placeholder : value;
      }
    },
    getLabelValue() {
      if (!this.customlabel) {
        return this.consequence.value;
      }
      else {
        let value = this.$parent.getVal(`${this.consequence.value}`);
        return (!value) ? this.consequence.valueplaceholder : value;
      }
    }
  },
  data () {
    return {
    }
  },
  methods: { 
    sendToVTT() {      
      if (!this.consequence || !this.consequence.label) return;
      let label = `consequence ${this.consequence.label}`;

      if (this.customlabel) {
        let label = this.$parent.getVal(`${this.consequence.label}`);
        if (label === "") {
          label = `consequence ${this.consequence.placeholder}`;
        }
        else {
          label = `consequence ${label}`;
        }        
      }

      this.$parent.sendToVTT('invoke', label, "consequences", this.consequence.obj);
    },
    setVal(arr, val) {
      if (this.vttEnabled) {
        let label = this.consequence.label;
        if (this.customlabel) {
          label = this.$parent.getVal(this.consequence.label);
          if (label === "") {
            label = this.consequence.placeholder;
          }          
        }
        label = `${label} consequence`;
        
        this.$parent.sendToVTT("consequence", label, arr, val);
        this.$parent.setVal(arr, val);
        this.$emit('save-character');
      } 
      else {
        this.$parent.setVal(arr, val);
        this.$emit('save-character');
      }
    },
    skillHasValue() {      
      if (!this.consequence.requirement) return true;      
      let hasVal = this.$parent.skillHasValue(this.consequence.requirement.obj, this.consequence.requirement.val);      
      return hasVal;
    },
    removeConsequence(id) {
      this.$emit('remove-consequence', id);
    }
  }
}
</script>

<style lang="scss" scoped>
  label {
    font-family: 'Archivo Black', sans-serif;
    text-transform: uppercase;
    font-size: 22px;
    font-weight: 700;
  }
</style>
