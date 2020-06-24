<style lang="scss" scoped>
  label {
    font-weight: 700;
  }

  #scene-canvas {
    position:relative;
    height: 80vh;    
    border: solid 2px black;
    overflow: scroll;   
    cursor:grab; 
  }
   
   
  /deep/ a {
    text-decoration: none;
  }

  /deep/ .btn-link {
    color: #888;
  }

  footer {
    display: none;
  }
</style>

<template>
  <div class="m-2">
   
    <loading :loading="isLoading" />

    <div v-show="!isLoading">
      <div class="d-flex flex-column flex-sm-row">
        <div class="h4">{{scene.name}}</div>
        <div class="mr-auto ml-2">
          <em style="vertical-align: top;"><button type="button" class="btn btn-link p-0" title="Add Scene Aspect" @click="addAspect()"><i class="fas fa-sticky-note"></i></button> Aspects:</em>
          <sceneaspect :aspect="aspect" location="scene" v-for="aspect in scene.aspects" v-bind:key="aspect.id" />
        </div>
        <button type="button" class="btn-sm btn btn-primary" @click="addZone()">Add Zone</button>
        <button type="button" class="btn-sm btn btn-success ml-1" @click="saveScene()">Save Scene</button>
      </div>

      <div id="scene-canvas" v-dragscroll:nochilddrag class="bg-light mt-2">
        <!-- zones -->        
        <scenezone :zone="zone" v-for="zone in scene.zones" :key="zone.id" />        
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

    <!-- add scene object -->
    <div class="modal" id="modalSceneObject" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalLabel">Add Scene Object</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary">Save changes</button>
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
import SceneAspect from '../components/scene-aspect';
import { dragscroll } from 'vue-dragscroll';

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
  directives: {
    dragscroll
  },
  components: {
    draggable,      
    loading: Loading,
    scenezone: SceneZone,
    sceneaspect: SceneAspect,
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
            
      //hide the footer for a better game table experience
      document.getElementsByTagName("footer")[0].className += " d-none";
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
        zindex: "2",
        id: `ZONE|${id}`,
        name: "New Zone",
        x: 0,
        y: 0,
        aspects: [         
        ],
        sceneobjects : [          
        ]
      };
      this.scene.zones.push(zone);
      this.$forceUpdate();
    },
    addAspect() {
      let aspect = {id:commonSvc.GenerateUUID(), name: "Aspect Name", editing: true, invokes: [{id:commonSvc.GenerateUUID(), used: false}]};
      if (!this.scene.aspects) {        
        this.$set(this.scene, 'aspects', new Array());
      }
      this.scene.aspects.push(aspect);
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
