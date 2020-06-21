<template>
  <div class="pl-1 ml-1 badge badge-warning" :id="aspect.id">
    <span v-if="!aspect.editing" @click="aspect.editing = true">{{aspect.name}}</span>

    <div class="input-group" v-if="aspect.editing">  
      <input class="form-control-sm" v-model="aspect.name"  />
      <div class="input-group-append">              
          <button type="button" class="input-group-text" @click="aspect.editing = false"><i class="fas fa-check-circle text-success"></i></button>
      </div>          
    </div>

    <input type="checkbox" v-for="invoke in aspect.invokes" v-bind:key="invoke.id" :checked="invoke.used" />
    <button type="button" class="btn btn-link p-0 m-0" title="Add invoke" @click="addInvoke()"><i class="fas fas fa-plus-circle fa-xs"></i></button>
    <button type="button" class="btn btn-link p-0 m-0" title="Remove invoke" @click="removeInvoke()"><i class="fas fas fa-minus-circle fa-xs"></i></button>
    <button type="button" class="btn btn-link p-0 m-0" title="Remove aspect" @click="removeAspect()"><i class="fas fa-trash-alt fa-xs"></i></button>
  </div>
</template>

<script>
import CommonService from '../assets/js/commonService';
let commonSvc = null;

export default {
  name: 'SceneAspect',
  props: {
    aspect: Object,
  },
  created() { 
    commonSvc = new CommonService(this.$root);   
  },
  computed: {    
  },
  data () {
    return {      
    }
  },
  methods: {   
    addInvoke() {
      let invoke = {id:commonSvc.GenerateUUID(), used: false};
      this.aspect.invokes.push(invoke);
    },
    removeInvoke() {      
      this.aspect.invokes.pop();
    },
    removeAspect() {
      let $component = this;
      this.$parent.$parent.$props.zone.aspects = this.$parent.$parent.$props.zone.aspects.filter(function( obj ) {
        return obj.id !== $component.aspect.id;
      });
      
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
