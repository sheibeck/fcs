<template>  
  <vue-draggable-resizable :id="`zone-${commonSvc.GetId(zone.id)}`" class="p-1 m-1 d-flex border bg-white zone draggable-item" :style="`z-index:${zone.zindex}`" 
        drag-handle=".zoneHandle" :parent="true" :drag-cancel="'.cancelZoneDrag'"  :x="zone.x" :y="zone.y"
        :w="zone.width" :h="zone.height" @dragging="onDrag" @resizing="onResize">
    <!-- drag handle -->
    <i class="fas fa-expand-arrows-alt p-1 mr-1 bg-dark text-white zoneHandle"></i>

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

      <Container id="drag-container" :get-ghost-parent="getGhostParent" :get-child-payload="getChildPayload" 
        drag-handle-selector=".objectHandle" group-name="zone" @drop="onZoneDrop(commonSvc.GetId(zone.id), $event)"
        drag-class="card-ghost" drop-class="card-ghost-drop" :drop-placeholder="dropPlaceholderOptions">            
        <Draggable v-for="item in zone.sceneobjects" :key="item.id">
          <sceneobject :objectdata="item" />
        </Draggable>
      </Container>      
    </div>

    <div class="d-flex flex-column bg-light pl-1">
      <button type="button" class="btn btn-link p-0" title="Add Zone Aspect" @click="addZoneObject('aspect')"><i class="fas fa-sticky-note"></i></button>    
      <b-button :id="`add-adversary-${this.zone.id}`" type="button" variant="link" class="btn btn-link p-0" title="Add Adversary"><i class="fas fa-theater-masks"></i></b-button>
      <b-popover :target="`add-adversary-${this.zone.id}`" triggers="click blur">
        <template v-slot:title>Add Adversary</template>
        <autocomplete  :search="searchAdversaries"
          placeholder="Search Adversaries"
          aria-label="Search Adversaries"
          :get-result-value="getAdversaryResultValue"
          @submit="selectAdversaryResult"></autocomplete>
      </b-popover>
      <b-button :id="`add-character-${this.zone.id}`" type="button" variant="link" class="btn btn-link p-0" title="Add Character" @click="addZoneObject('character')"><i class="fas fa-user-circle"></i></b-button>  
      <b-popover :target="`add-character-${this.zone.id}`" triggers="click blur">
        <template v-slot:title>Add Character</template>
        <autocomplete  :search="searchCharacters"
          placeholder="Search Characters"
          aria-label="Search Characters"
          :get-result-value="getCharacterResultValue"
          @submit="selectCharacterResult"></autocomplete>
      </b-popover>    
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
import Autocomplete from '@trevoreyre/autocomplete-vue'
import DbService from '../assets/js/dbService';

let dbSvc = null;

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
    Draggable,
    Autocomplete
  },  
  created() {    
    dbSvc = new DbService(this.$root);
    this.init();
  },  
  data () {
    return {
      commonSvc: new CommonService(fcs),
      editing: false,
      loading: true,     
      dropPlaceholderOptions: {
        className: '.drop-preview',
        animationDuration: '150',
        showOnTop: true
      },
      adversarySearch: '',
      adversaries: [],      
      selectedAdversary: null,      
    }
  },
  methods: {
    init() {         
    },  

    /* adversary search */
    searchAdversaries(query) {      
      return new Promise((resolve) => {
        if (query.length < 3) {
          return resolve([])
        }

        dbSvc.ListObjects("ADVERSARY", null, query)          
          .then((data) => {            
            resolve(data)
          })
      })
    },
    getAdversaryResultValue(result) {
      return result.name;
    },    
    selectAdversaryResult(result) {
      result.aspects = this.convertThingToGameObject(result.aspects, "ADVERSARY", "ASPECT");
      result.stress = this.convertThingToGameObject(result.stress, "ADVERSARY", "STRESS");
      
      result.originalId = result.id; // note the original id so we have a link back to the adversary object in the db
      result.id = this.commonSvc.GenerateUUID(); // now make sure we hae a unique id in case we add multiples of the same
            
      this.zone.sceneobjects.push(result);
    },    
    /* end adversary search */

    /* character search */
    searchCharacters(query) {      
      return new Promise((resolve) => {
        if (query.length < 3) {
          return resolve([])
        }

        dbSvc.ListObjects("CHARACTER", this.$store.state.userId, query)          
          .then((data) => {            
            resolve(data)
          })
      })
    },
    getCharacterResultValue(result) {
      return result.name;
    },    
    selectCharacterResult(result) {
      result.aspects = this.convertThingToGameObject(result.aspects, "CHARACTER", "ASPECT");      
      this.zone.sceneobjects.push(result);
    },    
    /* end character search */

    convertThingToGameObject(array, thing, type) {
      let gameObject = new Array();

      switch(type) {
        case "ASPECT":
          for (let [key, value] of Object.entries(array)) {
            if (thing == "ADVERSARY") {
              var subAspects = value.split(";");
              subAspects.forEach( item => {
                let aspect = {editing: false, id: this.commonSvc.GenerateUUID(), invokes: [], name: item, label: key, object_type: thing };
                gameObject.push(aspect);
              });                        
            } else {              
              let aspect = {editing: false, id: this.commonSvc.GenerateUUID(), invokes: [], name: value, label: key, object_type: thing };
              gameObject.push(aspect);                            
            }
          }
          break;
        case "STRESS":
          for (let [key, value] of Object.entries(array)) {
            let stress = {editing: false, id: this.commonSvc.GenerateUUID(), boxes: [], name: key, object_type: type };
            for (let [skey, svalue] of Object.entries(value)) {
              stress.boxes.push({id: this.commonSvc.GenerateUUID(), used: false, label: svalue})
            }          
            gameObject.push(stress);
          }
      };

      return gameObject;
    },
    getChildPayload (index) {      
      return this.zone.sceneobjects[index];      
    },
    onZoneDrop (collection, dropResult) { 
      //get array      
      var zone = this.$parent.$data.scene.zones.find(obj => {
        return this.commonSvc.GetId(obj.id) === collection;
      });
      
      //if we re-ordered in the same container
      if (dropResult.addedIndex != null && dropResult.removedIndex != null) {        
        zone.sceneobjects.move(dropResult.removedIndex, dropResult.addedIndex);
      }
      else {
        if (dropResult.addedIndex != null) {
          zone.sceneobjects.splice(dropResult.addedIndex, 0, dropResult.payload)
        }
        
        if (dropResult.removedIndex != null) {
          zone.sceneobjects.splice(dropResult.removedIndex, 1);
        }
      }
    },  
    addZoneObject(type) {      
      switch(type) {
        case "aspect":
          let aspect = {id:this.commonSvc.GenerateUUID(), name: "Aspect Name", editing: true, invokes: []};
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
    getGhostParent() {
      return document.getElementById("scene-canvas");
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
    transform: rotateZ(5deg);    
  }

  .card-ghost-drop {
    transition: transform 0.18s ease-in-out;
    transform: rotateZ(0deg);
    z-index: 999;    
  }
</style>
