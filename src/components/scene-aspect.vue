<template>
  <div class="pl-1 ml-1" :class="getColor(aspect)" :id="`aspect-${commonSvc.GetId(aspect.id)}`">
    <div class="d-flex">
      <span class="dice fo20" v-on:click="sendToVTT()">C</span>     
      <editableinput :object="aspect" item="name" class="font-weight-bold pr-1 mr-auto" />
          
      <button type="button" class="btn btn-link p-0 m-0" title="Remove aspect" @click="removeAspect()"><i class="fas fa-trash-alt fa-xs"></i></button>
    </div>
    <invoke :invokes="aspect.invokes" class="mx-2 mr-auto" />
  </div>
</template>

<script>
import SceneInvoke from './scene-invoke';
import CommonService from '../assets/js/commonService';
import SceneEditableInput from './scene-editable-input';

export default {
  name: 'SceneAspect',
  props: {
    aspect: Object,
    location: String,        
  },
  components: {
    invoke: SceneInvoke,
    editableinput: SceneEditableInput, 
  },
  computed: {    
  },
  data () {
    return { 
      editing: false,
      commonSvc: new CommonService(),
    }
  },
  methods: {  
    getColor(aspect) { 
      switch(aspect.object_type) {
        case "CHARACTER":
        case "ADVERSARY":
        case "NPC":
          return "small";
        default:
          return "badge badge-warning";
      }
    },
    sendToVTT() {
      let characterName = this.$parent.objectdata.name;
      this.$parent.$parent.$parent.$parent.sendToVTT('aspect',this.aspect.name, this.aspect.value, 'aspect', characterName);
    },  
    removeAspect() {      
      let $component = this;      
      switch(this.location)
      {        
        case "scene":          
          this.$parent.$data.scene.aspects = this.$parent.$data.scene.aspects.filter(function( obj ) {
            return obj.id !== $component.aspect.id;
          });      
          break;
        case "zone":
          this.$parent.$parent.$props.zone.aspects = this.$parent.$parent.$props.zone.aspects.filter(function( obj ) {
            return obj.id !== $component.aspect.id;
          });      
          break;
        default:          
          //this means it's on the object and there are 2 places it might be
          //account for adding/removing from characters aspects instead of a ca/boost
          let isCaBoost = this.$parent.$props.objectdata.caAndBoost && this.$parent.$props.objectdata.caAndBoost.find(function( obj ) {
            return obj.id === $component.aspect.id;
          });
          if (isCaBoost) {
            this.$parent.$props.objectdata.caAndBoost = this.$parent.$props.objectdata.caAndBoost.filter(function( obj ) {
              return obj.id !== $component.aspect.id;
            });
          }

          //account for adding/removing from characters aspects instead of a ca/boost
          let isCharacterAspect = this.$parent.$props.objectdata.aspects && this.$parent.$props.objectdata.aspects.find(function( obj ) {
            return obj.id === $component.aspect.id;
          });
          if (isCharacterAspect) {
            this.$parent.$props.objectdata.aspects = this.$parent.$props.objectdata.aspects.filter(function( obj ) {
              return obj.id !== $component.aspect.id;
            });
          }
      }
    }
  }

}
</script>

<style lang="scss" scoped>
  .btn {
    vertical-align: inherit;
  }
  button{
    line-height: 0 !important;
  }
</style>
