<template>
  <div class="pl-1 ml-1 small d-flex">
    <span class="dice fo20" v-on:click="sendToVTT()">+</span>    
    <span title="Click to edit" v-if="!editing" @click="editing = true">{{skill.name.toTitleCase()}}</span>   
    <div class="input-group" v-if="editing">  
      <input class="form-control-sm" v-model="skill.name"  />
      <div class="input-group-append">
          <button type="button" class="input-group-text" @click="editing = false"><i class="fas fa-check-circle text-success"></i></button>
      </div>
    </div>

    <label class="mr-auto" title="Click to edit" v-if="!editValue" @click="editValue = true">{{skill.value}}</label>
    <div class="input-group mr-auto" v-if="editValue">  
      <input class="form-control-sm" v-model="skill.value"  />
      <div class="input-group-append">
          <button type="button" class="input-group-text" @click="editValue = false"><i class="fas fa-check-circle text-success"></i></button>
      </div>
    </div>

    <button class="btn btn-link p-0 m-0 small" type="button"><i title="Remove skill" @click="removeSkill()" class="fas fa-trash-alt fa-xs"></i></button>
  </div>
</template>

<script>
import CommonService from '../assets/js/commonService';

export default {
  name: 'SceneSkill',
  props: {
    skill: Object,
  },  
  components: {    
  },
  computed: {    
  },  
  data () {
    return { 
      editing: false,
      editValue: false,
      commonSvc: new CommonService(),
    }
  },
  methods: { 
    sendToVTT() {      
      let characterName = this.$parent.objectdata.name;
      this.$parent.$parent.$parent.$parent.sendToVTT('diceroll',this.skill.name, this.skill.value, 'skill', characterName);
    },
    removeSkill() {
      this.$parent.objectdata.skills = this.$parent.objectdata.skills.filter( (obj) => {
        return obj.id !== this.skill.id;
      }); 
    }

  }

}
</script>

<style lang="scss" scoped>
  .input-group-append {
    height: 30px;
  }
</style>
