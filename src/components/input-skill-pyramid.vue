<template>
  <div>
    <div class="fate-header d-flex">
      <span class="mr-auto">{{header}}</span>
      <a v-if="!isNewCharacter" v-on:click="toggleEdit()">
        <i class="fas d-print-none pr-2" :class="{ 'fa-check-circle' : editing, 'fa-edit' : !editing }"></i>
      </a>      
    </div>

    <div v-if="editing || isNewCharacter">
      <div v-for="skill in skills" :key="skill.obj">
        <div class="d-md-flex">
          <label class="pr-2 col-form-label mr-auto"><span class="d-md-none">{{skill.label}} </span>{{skill.value}}</label>
          <div v-for="item in skill.items" :key="item" class="d-flex justify-content-between py-1 px-1">
            <select v-if="skillList" class="form-control" :id="`${skill.obj}.${item}`" name="`${skill.obj}.${item}`" @change="$parent.setVal(`${skill.obj}.${item}`, $event.target.value)" :value="$parent.getVal(`${skill.obj}.${item}`)" placeholder="">
                <option v-for="thing in skillList" :value="thing" :key="thing">{{thing}}</option>                    
            </select>
            <input v-if="!skillList" class="form-control" :id="`${skill.obj}.${item}`" name="`${skill.obj}.${item}`" @change="$parent.setVal(`${skill.obj}.${item}`, $event.target.value)" :value="$parent.getVal(`${skill.obj}.${item}`)" placeholder="" />
          </div>
        </div>
      </div> 
    </div>  
    <div v-else>
      <div v-for="skill in skills" :key="skill.obj">
        <div class="d-md-flex py-1">
          <label class="pr-2 col-form-label">{{skill.label}} {{skill.value}}:</label>

          <span v-for="(item,index) in skill.items" :key="item" class="d-md-flex justify-content-between py-1 my-1">
            <span v-if="$parent.getVal(`${skill.obj}.${item}`)">
              <!--roll20-->
              <span v-if="index != 0">,</span>
              <span v-if="hasRoll20" class="dice fo20" v-on:click="sendToRoll20($parent.getVal(`${skill.obj}.${item}`), skill.value)">+</span>
              <span>{{$parent.getVal(`${skill.obj}.${item}`)}}</span>
            </span>
          </span>
        </div>
      </div> 
    </div>  
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputSkillColumn',
  props: {
    skills: Array, 
    skillList: Array, 
    header: String,   
  },  
  computed: {
 	  ...mapGetters([
      'isAuthenticated',      
      'roll20Enabled'
    ]),
    hasRoll20() {
      return this.isAuthenticated && this.roll20Enabled;
    },
    isNewCharacter() {      
      return this.$route.name == "Character Sheet Detail";
    }
  },
  data () {
    return { 
      editing: null,       
    }
  },
  methods: { 
    toggleEdit() {      
      this.editing = !this.editing;     
      if (!this.editing == true) {
        this.$parent.$parent.$parent.save();
      } 
    },
    sendToRoll20(skillName, modifier) {      
      if (!skillName) return;    
      let label = `skill ${skillName}`;
      this.$parent.sendToRoll20('skill', label, null, modifier);
    }
  }
}
</script>

<style lang="scss" scoped>
  .col-form-label {
    font-size: 1em !important;    
  }
</style>
