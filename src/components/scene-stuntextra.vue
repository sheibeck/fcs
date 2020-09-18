<template>
  <div class="pl-1 ml-1 small">
    <div class="d-flex">
      <span class="dice fo20" v-on:click="sendToVTT()">C</span>       
      <editableinput :object="stuntextra" item="name" class="font-weight-bold pr-1 mr-auto" />
      <button class="btn btn-link p-0 m-0 small button-remove" type="button"><i title="Remove stunt/extra" @click="removeStunt()" class="fas fa-trash-alt fa-xs"></i></button>
    </div>
    <editableinput :object="stuntextra" type="textarea" item="value" class="px-2" />    
  </div>
</template>

<script>
import CommonService from '../assets/js/commonService';
import SceneEditableInput from './scene-editable-input';

export default {
  name: 'SceneStuntExtra',
  props: {
    stuntextra: Object,
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
      this.$parent.$parent.$parent.$parent.sendToVTT('stuntextra',this.stuntextra.name, this.stuntextra.value, 'stunt', characterName);
    },
    removeStunt() {
      this.$parent.objectdata.stuntextras = this.$parent.objectdata.stuntextras.filter( (obj) => {
        return obj.id !== this.stuntextra.id;
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
