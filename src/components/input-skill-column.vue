<template>
  <div class="form-group d-flex">
      <!--roll20-->
      <span v-if="hasRoll20" class="dice fo20 pt-2" v-on:click="sendToRoll20()">+</span>

      <!--non-custom labels-->
      <label v-if="!item.label" class="p-1 w-100 mr-auto inputlabel" :class="labelclass">{{item.placeholder}}</label>

      <!--custom labels-->
     	<input v-if="item.label" class="px-2 py-2 w-100 mr-auto inputlabel" :class="labelclass" type="text" :id="`${item.label}`" :name="`${item.label}`" 
        @change="$parent.setVal(`${item.label}`,  $event.target.value)" 
        :value="$parent.getVal(`${item.label}`)" :placeholder="item.placeholder" />
       
      <!--input-->
      <input class="form-control text-center col-3" :class="inputclass" type="text" :id="item.obj" :name="item.obj"  
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
    sendToRoll20() {      
      if (!this.item.obj) return;      
      let plural = this.item.obj.indexOf("skill") > -1 ? "skills" : "approaches";
      let singular = plural == "skills" ? "skill" : "approach";
      let label = `${singular} ${this.item.label ? this.$parent.getVal(`${this.item.label}`) : this.item.placeholder}`;
      this.$parent.sendToRoll20('diceroll', label, plural, this.item.obj);
    }
  }
}
</script>

<style lang="scss" scoped> 
</style>
