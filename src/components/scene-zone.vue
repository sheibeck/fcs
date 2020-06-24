<template>  
  <vue-draggable-resizable :id="`zone-${commonSvc.GetId(zone.id)}`" class="p-1 m-1 d-flex border bg-white zone draggable-item" 
        drag-handle=".zoneHandle" :parent="true" :drag-cancel="'.cancelZoneDrag'"  :x="zone.x" :y="zone.y"
        :w="zone.width" :h="zone.height" @dragging="onDrag" @resizing="onResize" :style="`z-index:${this.zone.zindex};`">
    
    <!-- zone background image and editor -->
    <img v-if="zone.backgroundImage && !zoneImageEdit" :src="zone.backgroundImage" class="img-fluid zone-image" />
    
    <div v-if="zoneImageEdit">      
      <label class="control-label">Zone Image Url</label><br/>    
      <div class="input-group">      
        <input v-model="zone.backgroundImage" class="form-control" />
        <div class="input-group-append" style="height: 38px;">
          <button type="button" class="input-group-text" @click="toggleZoneImageEdit()"><i class="fas fa-check-circle text-success"></i></button>
        </div>
      </div>
    </div>
    <!-- drag handle -->
    <i class="fas fa-expand-arrows-alt p-1 mr-1 bg-dark text-white zoneHandle"></i>

    <!-- details -->
    <div class="mr-auto cancelZoneDrag w-100">
      <header>
        <!-- name -->        
        <label title="Click to edit" v-if="!editing" @click="editing=true" style="vertical-align: top;">{{zone.name.toUpperCase()}}</label>
        <div class="input-group" v-if="editing">  
          <input class="form-control-sm" v-model="zone.name" />                    
          <div class="input-group-append">              
              <button type="button" class="input-group-text" @click="editing=false"><i class="fas fa-check-circle text-success"></i></button>
          </div>
        </div>

        <span v-if="zone.aspects.length" style="vertical-align: top;">&mdash; <em>Aspects</em></span>        
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
      <button type="button" class="btn btn-link p-0" @click="toggleZoneImageEdit()" title="Edit zone image"><i class="fas fa-image"></i></button>
      <hr />
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
  computed: {
    hasZoneImage() {
      return this.zone.backgroundImage;
    }
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
      zoneImageEdit: false,
                  
    }
  },
  methods: {
    init() {         
    },    
    makeGameObject(result, type) {
      if (!result) return;
       
      result.aspects = this.convertThingToGameObject(result.aspects, type, "ASPECT");
      result.consequences = this.convertThingToGameObject(result.consequences, type, "CONSEQUENCE");      
      result.stress = this.convertThingToGameObject(result.stress, type, "STRESS");            
      result.conditions = this.convertThingToGameObject(result.conditions, type, "CONDITION");    
      
      this.$set(result, 'show', {
        aspects: true,
        stress: true,
        conditions: true,
        consequences: true,
      });

      this.zone.sceneobjects.push(result);
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
      this.makeGameObject(result, "ADVERSARY");
    },    
    /* end adversary search */

    /* character search */
    searchCharacters(query) {      
      return new Promise((resolve) => {
        if (query.length < 3) {
          return resolve([])
        }

        //dbSvc.ListObjects("CHARACTER", this.$store.state.userId, query)
        dbSvc.ListObjects("CHARACTER", null, query)
          .then((data) => {            
            resolve(data)
          })
      })
    },
    getCharacterResultValue(result) {
      return result.name;
    },    
    selectCharacterResult(result) {
      this.makeGameObject(result, "CHARACTER");    
    },    
    /* end character search */

    convertThingToGameObject(array, thing, type) {
      if (!array) return;

      let gameObject = new Array();

      switch(type) {        
        case "ASPECT":
          for (let [key, value] of Object.entries(array)) {
            if (thing == "ADVERSARY") {
              var subAspects = value.split(";");
              subAspects.forEach( item => {
                let aspect = {id: this.commonSvc.GenerateUUID(), invokes: [], name: item, label: key, object_type: thing };
                gameObject.push(aspect);
              });                        
            } else {              
              let aspect = {id: this.commonSvc.GenerateUUID(), invokes: [], name: value, label: key, object_type: thing };
              gameObject.push(aspect);
            }
          }
          break;
        case "STRESS":
          for (let [key, value] of Object.entries(array)) {
            let stress = {id: this.commonSvc.GenerateUUID(), boxes: [], name: key, object_type: type };                      
            for (let [skey, svalue] of Object.entries(value)) {
              stress.boxes.push({id: this.commonSvc.GenerateUUID(), used: false, label: svalue})
            }          
            gameObject.push(stress);
          }
          break;
        case "CONDITION":          
          for (let [key, value] of Object.entries(array)) {            
            let condition = {id: this.commonSvc.GenerateUUID(), boxes: [], name: key, object_type: type };            
            condition.boxes.push({id: this.commonSvc.GenerateUUID(), used: false, label: value})     
            gameObject.push(condition);
          }
          gameObject = gameObject.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "CONSEQUENCE":          
          for (let [key, value] of Object.entries(array)) {            
            let consequence = {id: this.commonSvc.GenerateUUID(), invokes: [], name: key, label: (thing == "ADVERSARY" ? value : ''), value:(thing == "CHARACTER" ? value : ''), object_type: type };            
            gameObject.push(consequence);
          }
          break;
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
    toggleZoneImageEdit() {      
      this.zoneImageEdit = !this.zoneImageEdit;
    }
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

  .zone-image {
    content: "";    
    opacity: 0.5;    
    width: 98%;
    height: 98%;
    position: absolute;
    z-index: -100;   
  }
  
</style>
