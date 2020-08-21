<template>
  <div class="form-group d-flex">
    <!--roll20-->
    <span v-if="vttEnabled" class="dice fo20 pt-2" v-on:click="sendToVTT()">+</span>

    <!--non-custom labels-->
    <div v-if="!item.label" class="w-100 mr-auto d-flex flex-column" :class="{ 'pt-1' : item.description }">
      <label class="col-form-label inputlabel p-1" :class="labelclass">{{item.placeholder}}</label>
      <small v-if="item.description" class="skill-desc">{{item.description}}</small>
    </div>

    <!--custom labels-->
    <input v-if="item.label" class="w-100 mr-auto inputlabel" :class="labelclass" type="text" :id="`${item.label}`" :name="`${item.label}`" 
      @change="$parent.setVal(`${item.label}`,  $event.target.value)" 
      :value="$parent.getVal(`${item.label}`)" :placeholder="item.placeholder" />
      
    <!--input-->
    <input class="form-control text-center col-3 pr-3 pr-md-0" :class="inputclass" type="number" :id="item.obj" :name="item.obj"  
      @change="$parent.setVal(`${item.obj}`,  $event.target.value)" 
      :value="$parent.getVal(`${item.obj}`)" :placeholder="'+'">			  
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
      if (!this.item.obj) return;      
      let plural = this.item.obj.indexOf("skill") > -1 ? "skills" : "approaches";
      let singular = plural == "skills" ? "skill" : "approach";
      let label = `${this.$parent.getVal(`${this.item.label}`) ? this.$parent.getVal(`${this.item.label}`) : this.item.placeholder}`;
      this.$parent.sendToVTT("diceroll", label, plural, this.item.obj, singular);
    }
  }
}
</script>

<style lang="scss" scoped> 
  .skill-desc {
      margin-top:-12px;
  }
</style>
