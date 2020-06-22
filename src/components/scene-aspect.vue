<template>
  <div class="pl-1 ml-1 badge" :class="getColor(aspect)" :id="`aspect-${commonSvc.GetId(aspect.id)}`">
    <span title="Click to edit" v-if="!aspect.editing" @click="aspect.editing = true">{{aspect.name}}</span>

    <div class="input-group" v-if="aspect.editing">  
      <input class="form-control-sm" v-model="aspect.name"  />
      <div class="input-group-append">              
          <button type="button" class="input-group-text" @click="aspect.editing = false"><i class="fas fa-check-circle text-success"></i></button>
      </div>
    </div>

    <input type="checkbox" v-for="invoke in aspect.invokes" v-bind:key="invoke.id" :checked="invoke.used" @change="invokeAspect($event, invoke.id)" />
    <button type="button" class="btn btn-link p-0 m-0" title="Add invoke" @click="addInvoke()"><i class="fas fas fa-plus-circle fa-xs"></i></button>
    <button v-if="aspect.invokes.length > 0" type="button" class="btn btn-link p-0 m-0" title="Remove invoke" @click="removeInvoke()"><i class="fas fas fa-minus-circle fa-xs"></i></button>
    <button v-if="!aspect.object_type" type="button" class="btn btn-link p-0 m-0" title="Remove aspect" @click="removeAspect()"><i class="fas fa-trash-alt fa-xs"></i></button>
  </div>
</template>

<script>
import CommonService from '../assets/js/commonService';

export default {
  name: 'SceneAspect',
  props: {
    aspect: Object,
    location: String,    
  },  
  computed: {    
  },
  data () {
    return { 
      commonSvc: new CommonService(),
    }
  },
  methods: {  
    getColor(aspect) {  
      switch(aspect.object_type) {
        case "CHARACTER":
        case "ADVERSARY":
          return "badge-light";
        default:
          return "badge-warning";
      }
    },
    addInvoke() {
      let invoke = {id:this.commonSvc.GenerateUUID(), used: false};
      this.aspect.invokes.push(invoke);
    },
    removeInvoke() {      
      this.aspect.invokes.pop();
    },
    removeAspect() {      
      let $component = this;
      switch(this.location)
      {        
        case "scene":          
          this.$parent.$data.aspects = this.$parent.$data.aspects.filter(function( obj ) {
            return obj.id !== $component.aspect.id;
          });      
          break;
        case "zone":
          this.$parent.$parent.$props.zone.aspects = this.$parent.$parent.$props.zone.aspects.filter(function( obj ) {
            return obj.id !== $component.aspect.id;
          });      
          break;
        default:
          this.$parent.$props.objectdata.caAndBoost = this.$parent.$props.objectdata.caAndBoost.filter(function( obj ) {
            return obj.id !== $component.aspect.id;
          });
      }
    },
    invokeAspect(event, id) {      
      let idx = this.aspect.invokes.findIndex(x => x.id === id);
      this.aspect.invokes[idx].used = event.target.checked;
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
