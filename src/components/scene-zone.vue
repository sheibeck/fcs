<template>
  <div :id="`SCENEZONE|${zone.id}`" class="p-1 m-1 d-flex border bg-white zone" :style="`z-index:${zone.zindex}`" v-draggable="getDraggable">
    <!-- drag handle -->
    <i class="fas fa-expand-arrows-alt p-1 mr-1 bg-dark text-white" :ref="`handle-zone-${zone.domId}`" :id="`handle-zone-${zone.domId}`"></i>    

    <!-- details -->
    <div class="mr-auto">
      <header>
        <!-- name -->        
        <label v-if="!editing" @click="editing=true">{{zone.name.toUpperCase()}}</label>
        <div class="input-group" v-if="editing">  
          <input class="form-control-sm" v-model="zone.name" />                    
          <div class="input-group-append">              
              <button type="button" class="input-group-text" @click="editing=false"><i class="fas fa-check-circle text-success"></i></button>
          </div>          
        </div>

        <span v-if="zone.aspects.length">&mdash; <em>Aspects</em></span>        
        <div v-for="aspect in zone.aspects" v-bind:key="aspect.id" class="pl-1 ml-1 badge badge-warning">      
          <span v-if="!aspect.editing" @click="aspect.editing = true">{{aspect.name}}</span>

          <div class="input-group" v-if="aspect.editing">  
            <input class="form-control-sm" v-model="aspect.name"  />
            <div class="input-group-append">              
                <button type="button" class="input-group-text" @click="aspect.editing = false"><i class="fas fa-check-circle text-success"></i></button>
            </div>          
          </div>
          

          <input type="checkbox" v-for="invoke in aspect.invokes" v-bind:key="invoke.id" :checked="invoke.used" />      
          <button type="button" class="btn btn-link p-0 m-0" @click="addInvoke(aspect.id)"><i class="fas fas fa-plus-circle fa-sm"></i></button>
          <button type="button" class="btn btn-link p-0 m-0" @click="removeInvoke(aspect.id)"><i class="fas fas fa-minus-circle fa-sm"></i></button>
          <button type="button" class="btn btn-link p-0 m-0" @click="removeAspect(aspect.id)"><i class="fas fa-trash-alt fa-sm"></i></button>
        </div>      
      </header>
      
      <draggable v-model="zone.sceneobjects" group="sceneobject" @start="drag=true" @end="drag=false" class="" handle=".handle">      
        <sceneobject :objectdata="obj" v-for="obj in zone.sceneobjects" v-bind:key="obj.domId"></sceneobject>          
      </draggable>      
    </div>

    <div class="d-flex flex-column bg-light pl-1">      
      <button type="button" class="btn btn-link p-0" data-toggle="tooltip" title="Add thing" @click="addZoneObject()"><i class="fas fa-plus-circle"></i></button>      
      <button type="button" class="btn btn-link p-0" @click="moveForward()" data-toggle="tooltip" title="Move zone forward"><i class="fas fa-chevron-circle-up"></i></button>
      <button type="button" class="btn btn-link p-0" @click="moveBackward()" data-toggle="tooltip" title="Move zone backward"><i class="fas fa-chevron-circle-down"></i></button>
      <button type="button" class="btn btn-link p-0" @click="removeZone()" data-toggle="tooltip" title="Delete zone"><i class="fas fa-trash-alt"></i></button>
    </div>
  </div>
</template>

<script>
import SceneObject from './scene-object';
import draggable from 'vuedraggable';
import { Draggable } from 'draggable-vue-directive';

export default {
  name: 'SceneObject',
  props: {
    zone: Object,
  },
  directives: {
    Draggable,
  },
  components: {
    draggable,
    sceneobject: SceneObject,
  },
  created() {    
  },
  computed: {  
    getDraggable() {
      let thing = {        
        boundingRect: document.getElementById('scene-canvas'),
        handle: this.$refs[`handle-zone-${this.zone.id}`],
      }    
    },  
  },
  data () {
    return {
      editing: false,   
    }
  },
  methods: {
    editZone() {
      this.editing = !this.editing;
    }, 
    moveForward() {      
      const maxArray = this.$parent.$parent.highestZone();
      const found = maxArray.find(element => element.id == this.zone.id);
      const max = parseInt(maxArray[0].zindex) ?? 1;

      let z = parseInt(this.zone.zindex) ?? 1;

      //if this item was not found to be at max OR
      // this item is not the only item at max then go up 1
      if (!found || (found && maxArray.length > 1)) z++;            
      this.zone.zindex = z;
    },
    moveBackward() {
      let z = parseInt(this.zone.zindex) ?? 1;
      if (z > 1) z--;
      this.zone.zindex = z;
    } 
  }

}
</script>

<style lang="scss" scoped>
  .zone {
    min-height: 300px;
    min-width: 400px;
  }
</style>
