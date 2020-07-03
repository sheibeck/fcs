<template>
	<div class="form-group d-flex">
    <span v-if="vttEnabled" class="dice fo20 pt-1 pr-1" v-on:click="sendToVTT()">C</span>
    <label class="pr-3">{{consequence.value}}</label>
    <input type="text" class="form-control" :id="consequence.obj" :name="consequence.obj" 
      @change="setVal(consequence.obj,  $event.target.value)" :value="$parent.getVal(consequence.obj)" :placeholder="consequence.label"
      :disabled="!skillHasValue()" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InputConsequence',
  props: {
    consequence: Object,    
  },
  computed: {
 	  ...mapGetters([
      'isAuthenticated',      
      'vttEnabled'
    ]),   
  },
  data () {
    return {
    }
  },
  methods: { 
    sendToVTT() {      
      if (!this.consequence || !this.consequence.label) return;
      let label = `consequence ${this.consequence.label}`;
      this.$parent.sendToVTT('invoke', label, "consequences", this.consequence.obj);
    },
    setVal(arr, val) {       
      if (this.vttEnabled) {
        this.$parent.sendToVTT("consequence", this.consequence.label, arr, val);
        this.$parent.setVal(arr, val);
        this.$parent.$parent.$parent.save();
      } 
      else {
        this.$parent.setVal(arr, val);
      }
    },
    skillHasValue() {      
      if (!this.consequence.requirement) return true;      
      let hasVal = this.$parent.skillHasValue(this.consequence.requirement.obj, this.consequence.requirement.val);      
      return hasVal;
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
