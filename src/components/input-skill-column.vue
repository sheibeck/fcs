<template>
  <div class="form-group d-flex">
    <!--roll20-->
    <span v-if="vttEnabled" class="dice fo20 pt-2" v-on:click="sendToVTT()">+</span>

    <!--non-custom labels-->
    <div v-if="(!item.label && !customlabel) || (customlabel && editlock)" class="w-100 mr-auto d-flex flex-column" :class="{ 'mt-1' : item.description }">
      <label class="col-form-label inputlabel" :class="labelclass">{{getLabel}}</label>
      <small v-if="item.description" class="skill-desc">{{item.description}}</small>
    </div>

    <!--custom labels-->
    <input v-if="(item.label || customlabel) && !editlock" class="w-100 mr-auto inputlabel" :class="labelclass" type="text" :id="`${item.label}`" :name="`${item.label}`" 
      @change="$parent.setVal(`${item.label}`,  $event.target.value)" 
      :value="$parent.getVal(`${item.label}`)" :placeholder="item.placeholder" />

    <!--input-->
    <input class="form-control text-center col-3 pr-3 pr-md-0" :class="inputclass" type="number" :id="item.obj" :name="item.obj"  
      @change="$parent.setVal(`${item.obj}`,  $event.target.value)" 
      :value="$parent.getVal(`${item.obj}`)" :placeholder="'+'" />		

    <button type="button" v-if="removable && !editlock" class="btn btn-link text-secondary m-0 p-0" v-on:click="removeSkill(item.id)">
      <i title="Delete Aspect" class="fas d-print-none fa-minus-circle pr-2"></i>
    </button>	  
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputSkillColumn',
  props: {
    item: Object, 
    inputclass: String,
    labelclass: String,  
    removable: Boolean,
    customlabel: Boolean, 
    editlock: Boolean,
  },  
  computed: {
 	  ...mapGetters([
      'isAuthenticated',      
      'vttEnabled'
    ]),  
    getLabel() {
      if (!this.item.label) {
        return this.item.placeholder;
      }
      else {
        let value = this.$parent.getVal(`${this.item.label}`);
        return (!value) ? this.item.placeholder : value;
      }
    }, 
  },
  data () {
    return {
    }
  },
  methods: { 
    sendToVTT() {      
      if (!this.item.obj) return;      
      let plural = this.item.obj.indexOf("skill") > -1 ? "skills" : "approaches";
      let singular = plural == "skills" ? "skill" : "approach";
      let label = `${this.$parent.getVal(`${this.item.label}`) ? this.$parent.getVal(`${this.item.label}`) : this.item.placeholder}`;
      this.$parent.sendToVTT("diceroll", label, plural, this.item.obj, singular);
    },
    removeSkill(id) {
      this.$emit('remove-skill', id);
    }
  }
}
</script>

<style lang="scss" scoped> 
  .skill-desc {
      margin-top:-12px;
  }
</style>
