<style lang="scss" scoped>
  label {
    font-weight: 700;
  }

  #scene-canvas {
    min-height: 768px;    
  }
</style>

<template>
  <div class="container-fluid mt-2">
   
    <loading :loading="isLoading" />

    <div v-show="!isLoading">
      <div class="d-flex flex-column flex-sm-row">
        <h3 class="mr-auto">{{scene.name}} &mdash; Scene</h3> <button type="button" class="btn btn-primary" @click="addZone()">Add Zone</button>
      </div>

      <div id="scene-canvas">
        <!-- zones -->
        <draggable v-show="!isNewScene" v-model="scene.zones" group="zone" @start="drag=true" @end="drag=false" class="mt-2 d-flex">          
          <scenezone :zone="zone" v-for="zone in scene.zones" :key="zone.id" class="bg-white" />
        </draggable>        
      </div>

      <!-- properties -->
      <div id="accordion">
        <div class="card-header" id="sceneProperties">
          <button class="btn btn-link" data-toggle="collapse" data-target="#metadata" aria-expanded="true" aria-controls="metadata">
            Scene Properties
          </button>
        </div>
        <div id="metadata" class="collapse" v-bind:class="{ 'show': isNewScene }" aria-labelledby="sceneProperties" data-parent="#accordion">
          <div class="card-body">
            <div class="form-group">
              <label for="name">Name</label>
              <input class="form-control" type="text" id="name" name="name" placeholder="Scene name" v-model="scene.name" @change="slugify">
            </div>           
            <div class="form-group">
                <label for="description">Description</label>
                <textarea class="form-control" type="text" value="" id="description" name="description" placeholder="Scene description..." v-model="scene.description"></textarea>
            </div>
            <div class="form-group">
                <label for="imageUrl">Description</label>
                <input class="form-control" type="text" value="" id="imageUrl" name="imageUrl" placeholder="Image url" v-model="scene.image_url" />
            </div>

            <button type="button" class="btn btn-primary" v-on:click="saveScene">Save</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';
import Loading from '../components/loading';
import SceneZone from '../components/scene-zone';
import draggable from 'vuedraggable';

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'SceneDetail',
  metaInfo() {
    return {
       title: `${this.scene ? this.scene.name : this.title}`,
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  components: {
    draggable,  
    loading: Loading,
    scenezone: SceneZone    
  },
  mounted(){    
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);    
    this.init();    
  },  
  watch: {
    userId() {
      //wait for our authenticated user id
      this.sceneId = commonSvc.SetId("SCENE", fcs.$route.params.id);
      this.getScene(this.userId, this.sceneId);
    }
  },
  data () {
    return {
      name: "",
      description: "",
      loading: true,
      scene : {},
      id: this.$route.params.id,     
      zones: [
          {
            domId: "1",
            zindex: "1",
            id: "ZONE|1",
            name: "my zone",
            aspects: [
              {id:"1", name: "Bad", editing: false, invokes: [{id:1, used: false}, {id:2, used: false}]},
              {id:"2", name: "Rough", editing: false, invokes: [{id:1, used: true}]}
            ],
            sceneobjects : [
              {domId: '120', id: 'ADVERSARY|1', name: 'Obstacle', type: 'ADVERSARY'},
            ]
          },
          {
            domId: "2",
            zindex: "1",
            id: "ZONE|2",
            name: "this place",
              aspects: [
              {id:"1", name: "Watery", editing: false, invokes: []},
              {id:"2", name: "swampy", editing: false, invokes: []}
            ],
            sceneobjects : [
              {domId: '123', id: 'ADVERSARY|1', name: 'Adverasary', type: 'ADVERSARY'},
              {domId: '122', id: 'ADVERSARY|1', name: 'Adverasary', type: 'ADVERSARY'},
              {domId: '121', id: 'ADVERSARY|2', name: 'Adversary 2', type: 'ADVERSARY'},
            ]
          },
          {
            domId: "3",
            zindex: "1",
            id: "ZONE|3",
            name: "this place",
              aspects: [
              {id:"1", name: "This place is on fire", editing: false, invokes: []},
              {id:"2", name: "Billowy smoke", editing: false, invokes: []},
            ],
            sceneobjects : [
              {domId: '127', id: 'ADVERSARY|1', name: 'Bad Guy', type: 'ADVERSARY'},
              {domId: '126', id: 'ADVERSARY|1', name: 'Hord of Bad Guys', type: 'ADVERSARY'},              
            ]
          }
        ]
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId'
    ]),
    isNewScene : function() {
      return this.$route.params.id === "create";
    },

    isLoading : function() {
      return this.loading;
    },
    commonSvc() {
      return commonSvc;
    },

  },
  methods: {
    init() {
      $(document).on('show.bs.modal', '#modalDeleteSessionConfirm', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var id = button.data('id') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this);
        $(modal.find('.js-delete')).data('id', id);
      });
            
    },   
    getScene : function(ownerId, id) {
      var $component = this;

      if (this.id === "create") {
        this.create();
        return;
      }

      dbSvc.GetObject(id, ownerId).then ( (response) => {   
        if (!response)
        {
          commonSvc.Notify(`Could not find scene with id <b>${commonSvc.GetId(id)}</b>`, 'error', 2000, () => {
            document.location = '/scene';
          });
        }
        else {              

          $component.$set($component, 'scene', response);
          //draw scene objects

          $component.name = $component.scene.name + ' (SCENE)';
          $component.description = $component.scene.description || "";

          this.scene.zones = this.zones;          
        }

        $component.loading = false;    
      })
    },   
    create : function() {
      let c = {
        "description": "",
        "object_type": "SCENE",
        "id": null,
        "owner_id": this.userId,        
        "scale": "",
        "slug": "new-scene",
        "name": "New Scene",        
      };
      this.$set(this, 'scene', c);
      this.loading = false;
    },
    saveScene : function() {
      var $component = this;

      if (!this.scene.name) {
        commonSvc.Notify('You must enter a name', 'error');
        return;
      }

      // make sure we have a proper user id key
      $component.$set($component.scene, "owner_id", this.userId);

      //create a new scene Id if we don't have one
      let isNew = false;
      if (!$component.scene.id) {
          isNew = true;
          $component.$set($component.scene, "id", `SCENE|${commonSvc.GenerateUUID()}`);
      }
  
      dbSvc.SaveObject($component.scene).then( (response) => {
        if (response) {
          commonSvc.Notify('Scene saved.', 'success', null, () => {;
            if (isNew) {
              location.href = '/scene/' + commonSvc.GetId($component.scene.id) + '/' + $component.scene.slug;
            }
          });
        }
      });
    },      
    addZone() {
      let id = commonSvc.GenerateUUID();
      let zone = {
        domId: id,
        zindex: "2",
        id: `ZONE|${id}`,
        name: "New Zone",
        aspects: [         
        ],
        sceneobjects : [          
        ]
      };
      this.scene.zones.push(zone);
      this.$forceUpdate();
    },
    highestZone() {      
      var max = Math.max.apply(Math, this.scene.zones.map(function(o) { return o.zindex; }));
      const zonesAtMaxHeight = this.scene.zones.filter(z => z.zindex == max);
      return zonesAtMaxHeight;
    },
    slugify : function(event) {
      let $elem = $(event.currentTarget);
      let slug = commonSvc.Slugify($elem.val());
      this.$set(this.campaign, "slug", slug);
    }
  }
}
</script>
