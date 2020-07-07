<template>
  <div class="pl-1 ml-1 small d-flex">
    <span class="dice fo20" v-on:click="sendToVTT()">+</span>    
   
    <editableinput :object="skill" item="name" class="w-75  font-weight-bold" />

    <editableinput :object="skill" item="value" class="w-25" />

    <button class="btn btn-link p-0 m-0 small button-remove" type="button"><i title="Remove skill" @click="removeSkill()" class="fas fa-trash-alt fa-xs"></i></button>
  </div>
</template>

<script>
import CommonService from '../assets/js/commonService';
import SceneEditableInput from './scene-editable-input';

export default {
  name: 'SceneSkill',
  props: {
    skill: Object,
  },  
  components: {
    editableinput: SceneEditableInput,    
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

  .button-remove{
    line-height: .8;
  }
</style>
