<template>
  <div class="pl-1 ml-1 small">
    <span class="dice fo20" v-on:click="sendToVTT()">C</span>
    <span title="Click to edit" v-if="!editing" @click="editing = true" class="font-weight-bold">{{consequence.name.toTitleCase()}}</span>
    <invoke :invokes="consequence.invokes" class="pt-0" />

    <div class="input-group" v-if="editing">  
      <input class="form-control-sm" v-model="consequence.name"  />
      <div class="input-group-append">
          <button type="button" class="input-group-text" @click="editing = false"><i class="fas fa-check-circle text-success"></i></button>
      </div>
    </div>
    
    <div class="d-flex mr-auto">      
      <editableinput v-if="consequence.label != true && consequence.label != false" :object="consequence" item="label" class="mt-1" />
      <input type="text" v-model="consequence.value" class="ml-1 form-control-sm" />
      <button v-if="!isCharacter" class="btn btn-link p-0 m-0 small" type="button"><i title="Remove consequence" @click="removeConsequence()" class="fas fa-trash-alt fa-xs"></i></button>
    </div>        
  </div>
</template>

<script>
import SceneInvoke from './scene-invoke';
import CommonService from '../assets/js/commonService';
import SceneEditableInput from './scene-editable-input';

export default {
  name: 'SceneConsequence',
  props: {
    consequence: Object,
    type: String,
  },  
  components: {
    invoke: SceneInvoke,
    editableinput: SceneEditableInput, 
  },
  computed: {
    isCharacter() {
      return this.type && this.type.toLowerCase() == "character";
    }
  }, 
  data () {
    return { 
      editing: false,
      commonSvc: new CommonService(),
    }
  },
  methods: {
    sendToVTT() {      
      let invokerName = this.$parent.$parent.$parent.$parent.getPlayer(this.$parent.$parent.$parent.$parent.userId).userName;
      let characterName = this.$parent.$props.objectdata.name;
      this.$parent.$parent.$parent.$parent.sendToVTT('invoke', this.consequence.name, `${this.consequence.value}`, characterName, characterName); 
    },  
    removeConsequence() {
      this.$parent.objectdata.consequences = this.$parent.objectdata.consequences.filter( (obj) => {
        return obj.id !== this.consequence.id;
      }); 
    }  
  }

}
</script>

<style lang="scss" scoped>
</style>
