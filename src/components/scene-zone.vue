<template>  
  <vue-draggable-resizable :id="`SCENEZONE|${zone.id}`" class="p-1 m-1 d-flex border bg-white zone draggable-item" :style="`z-index:${zone.zindex}`" 
        drag-handle=".dragHandle" :parent="true" :drag-cancel="'.cancelZoneDrag'"  :x="zone.x" :y="zone.y"
        :w="zone.width" :h="zone.height" @dragging="onDrag" @resizing="onResize">
    <!-- drag handle -->
    <i class="fas fa-expand-arrows-alt p-1 mr-1 bg-dark text-white dragHandle" :id="`handle-zone-${zone.domId}`"></i>

    <!-- details -->
    <div class="mr-auto cancelZoneDrag">
      <header>
        <!-- name -->        
        <label title="Click to edit" v-if="!editing" @click="editing=true">{{zone.name.toUpperCase()}}</label>
        <div class="input-group" v-if="editing">  
          <input class="form-control-sm" v-model="zone.name" />                    
          <div class="input-group-append">              
              <button type="button" class="input-group-text" @click="editing=false"><i class="fas fa-check-circle text-success"></i></button>
          </div>
        </div>

        <span v-if="zone.aspects.length">&mdash; <em>Aspects</em></span>        
        <zoneaspect :aspect="aspect" location="zone" v-for="aspect in zone.aspects" v-bind:key="aspect.id" />
      </header>

      <Container :get-child-payload="getChildPayload" drag-handle-selector=".objectHandle" group-name="zone" @drop="onZoneDrop(zone.domId, $event)"
        drag-class="card-ghost" drop-class="card-ghost-drop" :drop-placeholder="dropPlaceholderOptions">            
        <Draggable v-for="item in zone.sceneobjects" :key="item.domId">
          <sceneobject :objectdata="item" />
        </Draggable>
      </Container>      
    </div>

    <div class="d-flex flex-column bg-light pl-1">      
      <button type="button" class="btn btn-link p-0" title="Add Zone Aspect" @click="addZoneObject('aspect')"><i class="fas fa-sticky-note"></i></button>
      <button type="button" class="btn btn-link p-0" title="Add Adversary" @click="addZoneObject('adversary')"><i class="fas fa-theater-masks"></i></button>
      <button type="button" class="btn btn-link p-0" title="Add Character" @click="addZoneObject('character')"><i class="fas fa-user-circle"></i></button>
      <hr/>
      <button type="button" class="btn btn-link p-0" @click="moveForward()" title="Move zone forward"><i class="fas fa-chevron-circle-up"></i></button>
      <button type="button" class="btn btn-link p-0" @click="moveBackward()" title="Move zone backward"><i class="fas fa-chevron-circle-down"></i></button>
      <button type="button" class="btn btn-link p-0" @click="removeZone()" title="Delete zone"><i class="fas fa-trash-alt"></i></button>
    </div>  
  </vue-draggable-resizable>
</template>

<script>
import SceneObject from './scene-object';
import SceneAspect from './scene-aspect';
import draggable from 'vuedraggable';
import VueDraggableResizable from 'vue-draggable-resizable';
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';
import { VueNestable, VueNestableHandle } from 'vue-nestable';
import { Container, Draggable } from "vue-smooth-dnd";
import CommonService from '../assets/js/commonService';

let commonSvc = null;

export default {
  name: 'SceneObject',
  props: {
    zone: Object,
  },
  components: {   
    draggable, 
    'vue-draggable-resizable': VueDraggableResizable,
    sceneobject: SceneObject,
    zoneaspect: SceneAspect,
    VueNestable,
    VueNestableHandle,
    Container,
    Draggable
  },
  mounted() {
    commonSvc = new CommonService(this.$$root);
  },  
  data () {
    return {
      editing: false,
      loading: true,     
      dropPlaceholderOptions: {
        className: 'drop-preview',
        animationDuration: '150',
        showOnTop: true
      } 
    }
  },
  methods: {
    getChildPayload (index) {      
      return this.zone.sceneobjects[index];      
    },
    onZoneDrop (collection, dropResult) { 
      //get array      
      var zone = this.$parent.zones.find(obj => {
        return obj.domId === collection;
      });
      
      if (dropResult.addedIndex != null) {        
        zone.sceneobjects.splice(dropResult.addedIndex, 0, dropResult.payload)
      }
      
      if (dropResult.removedIndex != null) {
        zone.sceneobjects.splice(dropResult.removedIndex, 1);
      }
    },  
    addZoneObject(type) {      
      switch(type) {
        case "aspect":
          let aspect = {id:commonSvc.GenerateUUID(), name: "Aspect Name", editing: true, invokes: [{id:commonSvc.GenerateUUID(), used: false}]};
          this.zone.aspects.push(aspect);
          break;
      }
    },
    editZone() {
      this.editing = !this.editing;
    }, 
    moveForward() {      
      const maxArray = this.$parent.highestZone();
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
    },
    onDrag: function (x, y) {
      this.zone.x = x;
      this.zone.y = y;
    },
    onResize: function (x, y, width, height) {      
      this.zone.x = x;
      this.zone.y = y;
      this.zone.width = width
      this.zone.height = height
    },
  }

}
</script>

<style lang="scss" scoped>
  .zone {
    min-height: 300px;
    min-width: 400px;    
  }

  .dragHandle {
    cursor: drag !important;
  }

  .cancelZoneDrag {
    cursor:default;
  }

  .drop-preview {
    background-color: rgba(150, 150, 200, 0.1) !important;
    border: 1px dashed #ccc !important;
    margin: 5px !important;
  }  
  
  .card-ghost {
    transition: transform 0.18s ease;
    transform: rotateZ(5deg)
  }

  .card-ghost-drop {
    transition: transform 0.18s ease-in-out;
    transform: rotateZ(0deg)
  }
</style>
