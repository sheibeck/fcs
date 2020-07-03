<template>
  <div class="pl-1 ml-1 badge" :class="getColor(aspect)" :id="`aspect-${commonSvc.GetId(aspect.id)}`">     
    <button type="button" class="btn btn-link p-0 m-0" title="Remove aspect" @click="removeAspect()"><i class="fas fa-trash-alt fa-xs"></i></button>      
    <span title="Click to edit" v-if="!editing" @click="editing = true" style="white-space: pre-wrap" class="text-left">{{aspect.name}}</span>

    <div v-if="editing">
      <div class="input-group">  
        <textarea class="form-control-sm" v-model="aspect.name"></textarea>
        <div class="input-group-append">
            <button type="button" class="input-group-text" @click="editing = false"><i class="fas fa-check-circle text-success"></i></button>
        </div>
      </div>    
    </div>

    <invoke :invokes="aspect.invokes" />
  </div>
</template>

<script>
import SceneInvoke from './scene-invoke';
import CommonService from '../assets/js/commonService';

export default {
  name: 'SceneAspect',
  props: {
    aspect: Object,
    location: String,        
  },
  components: {
    invoke: SceneInvoke,
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
          return "badge-light";
        default:
          return "badge-warning";
      }
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
