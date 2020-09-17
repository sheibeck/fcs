<style lang="scss" scoped>
  label {
    font-weight: 800;
  }

  #game-table {
    height: 85vh;

    #canvas-wrapper {
      position:relative;    
      border: solid 2px black; 
      overflow: scroll;
      cursor:grab;
    }

    #scene-canvas {
      position:relative;
      height: 3600px;
      width: 4800px;    

      background-size: 20px 20px;
      background-image:
        linear-gradient(to right, #F0F0F0 1px, transparent 1px),
        linear-gradient(to bottom, #F0F0F0 1px, transparent 1px);
    }   
  }

  #scene-toolbar {
    background-color: #ccc;
    button, a {
      padding: 3px !important;
    }
  }

  /deep/ #chat {
    width: 700px;

    #chat-log {
      height: 100%;
      overflow-y: scroll;             

      p {
        margin-bottom: 0;        
      }

      blockquote {        
        background-color: lightgoldenrodyellow;
        padding: 5px !important;
        margin-bottom: 5px;
      }     
    }
  }

  /deep/ #player-container {
    position: absolute;
    bottom: 0;
    
    video {      
      height: 100px;
    }
  }
   
  /deep/ a {
    text-decoration: none;
  }

  /deep/ .btn-link {
    color: #888;    
  }
</style>

<template>
  <div class="m-2">
   
    <loading :loading="isLoading" />

    <div v-if="!isLoading && isNewScene">
       <div class="form-group">
        <label for="name">Scene Name</label>
        <input type="text" class="form-control" id="name" v-model="scene.name" placeholder="Scene Name">
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea class="form-control" id="description" v-model="scene.description" rows="3"></textarea>
      </div>
      <button type="button" @click="saveScene()" class="btn btn-success">Create Scene</button>
    </div>

    <div v-show="!isLoading && !isNewScene">
      <div class="d-flex">  
        <div class="mr-auto">
          <em style="vertical-align: top;">Scene Aspects:</em>
          <sceneaspect :aspect="aspect" location="scene" v-for="aspect in scene.aspects" v-bind:key="aspect.id" />
        </div>

        <div v-if="isHost" class="mr-2" title="Storyteller Fate Points">
          <i class="fas fa-coins"></i>
          <input class="text-center" style="width: 50px;" id="fate-points" type="number" :value="scene.fatepoints" @change="spendFate($event)" />
        </div>
      
        <span v-if="isHost">
          <button type="button" class="btn-sm btn btn-success ml-1 d-none p-1" @click="saveScene()"><i class="fas fa-save"></i> Save Scene</button>
          <button v-if="!isSceneRunning" type="button" :disabled="waitingForGameStart" class="btn-sm btn btn-info" @click="startGame()"><i class="fas fa-play"></i> Start Game</button>
          <button v-if="isSceneRunning" type="button" class="btn-sm btn btn-danger" @click="stopGame()"><i class="fas fa-stop-circle"></i> Stop Game</button>          
        </span>

        <span v-if="(isSceneRunning && isHost) || !isHost">
          <button v-if="!isConnected" type="button" :disabled="waitingToJoin" class="btn-sm btn btn-secondary ml-1" @click="joinGame()"><i class="fas fa-sign-language"></i> Join Game</button>
          <button v-if="isConnected" type="button" class="btn-sm btn btn-secondary ml-1" @click="exitGame()"><i class="fas fa-sign-language"></i> Exit Game</button>
        </span>

        <span v-if="1==2">
          <button title="Fullscreen" v-if="!fullScreen" type="button" class="btn-sm btn btn-secondary ml-1" @click="toggleFullScreen(true)"><i class="fas fa-expand-alt"></i></button>
          <button title="Exit fullscreen" v-if="fullScreen" type="button" class="btn-sm btn btn-secondary ml-1" @click="toggleFullScreen(false)"><i class="fas fa-compress-alt"></i></button>
        </span>
      </div>

      <div id="game-table" class="d-flex">       
        <div id="canvas-wrapper" v-dragscroll:nochilddrag class="mr-auto">
          <div id="scene-canvas" class="bg-light mt-2" data-dragscroll>      
            <!-- zones -->        
            <scenezone :zone="zone" v-for="zone in scene.zones" :key="zone.id" class="panzoom-exclude"  />        
          </div>
        </div>        
        <div id="scene-toolbar" class="d-flex flex-column align-items-end">
          <div v-if="isHost" class="d-flex flex-column">
            <button type="button" title="New Round" class="btn btn-link" @click="startNewRound()"><i class="fas fa-undo"></i></button>
            <button type="button" class="btn btn-link" title="Add Scene Aspect" @click="addAspect()"><i class="fas fa-sticky-note"></i></button>
            <button type="button" title="Add Zone" class="btn btn-link" @click="addZone()"><i class="fas fa-shapes"></i></button>                      
            <b-button id="save-chatlog" type="button" variant="link" class="btn btn-link" title="Save chat to campaign"><i class="fas fa-book-open"></i></b-button>  
            <b-popover ref="popoverCampaign" triggers="click blur" target="save-chatlog">
              <template v-slot:title>Save chat log to campaign</template>
              <autocomplete title="Search Campaign" :search="searchCampaigns"
                placeholder="Select Campaign"
                aria-label="Select Campaign"
                :get-result-value="getCampaignResultValue"
                @submit="selectCampaignResult">
                <template #result="{ result, props }">
                <li v-bind="props">
                  <div class="p-0 m-0 h6">
                    {{result.name}}
                  </div>             
                </li>
              </template></autocomplete>
            </b-popover>            
          </div>
          <div class="d-flex flex-column mr-auto">
            <button type="button" title="Settings" class="btn btn-link" data-toggle="modal" data-target="#modalSettings"><i class="fas fa-cog"></i></button>
            <a :href="`/scene/${id}`" title="Copy scene link" class='btn btn-link' @click="shareUrl"><i class='fa fa-share'></i></a>
            <a href="https://github.com/sheibeck/fcs/wiki/Scene-Builder" target="_blank" class="btn btn-link" title="Help"><i class="fas fa-question"></i></a>
            <button v-if="showchat" title="Hide chat" @click="showchat = false" type="button" class="btn btn-link"><i class="fas fa-angle-double-right"></i></button>
            <button v-if="!showchat" title="Show chat" @click="showchat = true" type="button" class="btn btn-link"><i class="fas fa-angle-double-left"></i></button>            
          </div>
          <div v-if="isHost" class="d-flex flex-column mt-auto">
            <button type="button" class="btn btn-link" title="Clear chat log" @click="clearChatLog()"><i class="fas fa-comment-slash"></i></button>
            <button type="button" class="btn btn-link" title="Clear scene" @click="clearScene()"><i class="fas fa-broom"></i></button>
          </div>
        </div>
        <div v-if="showchat" id="chat" class="d-flex flex-column h-100">
          <VueShowdown id="chat-log" class="border mb-1 px-1" style="width:300px !important;overflow-wrap: break-word; word-wrap: break-word;" :options="{ emoji: false }" :markdown="chatLog" />          
          <textarea rows="3" id="chat-input" v-model="chatMessage" class="w-100 mr-1" v-on:keyup.enter="sendChatMessage()"></textarea>
          <div class="d-flex mt-1">
            <select v-model="selectedPlayer" class="form-control mr-1">
              <option value="everyone">Everyone</option>
              <option v-for="player in this.scene.players" :key="player.playerId" :value="player.playerId">{{player.userName}}</option>
            </select>
            <button type="button" class="btn btn-secondary btn-sm mr-1" @click="sendChatMessage()">Send</button>
            <button title="Roll 4df" type="button" class="btn btn-info btn-sm" @click="rollFateDice()"><span class="dice">+</span></button>
          </div>
        </div>
      </div>
    </div>

    <div id="player-container" class="" :class="{'d-none': !isConnected, 'd-flex': isConnected}">     
     
    </div>

    <!-- add scene object -->
    <div class="modal" id="modalSettings" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalLabel">Scene Settings</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div id="Host-Settings" v-if="isHost">
              <editableinput v-if="isHost" :object="scene" item="name" :canedit="isHost" class="" label="Scene Name:" />            
              <label>Scene Description:</label>
              <textarea rows=3 class="form-control" v-model="scene.description"></textarea>
              <hr />
            </div>
            <editableinput v-if="getPlayer(userId)" :object="getPlayer(userId)" item="userName" label="Username:" showEditIcon=true />
            <div>
              <input type="checkbox" id="usevideo" v-model="mediaSettings.useVideo" 
                  @change="updateOnlineSettings($event)" /> Use video when playing online
            </div>
            <div>
              <input type="checkbox" id="useaudio" v-model="mediaSettings.useAudio" 
                  @change="updateOnlineSettings($event)" /> Use audio when playing online
            </div>
            <div>
              <label>Video Device</label>
              <select :value="getSelectedVideoDevice" @change="selectMediaDevice($event, 'video')" class="form-control">
                <option value="default">System Default</option>
                <option v-for="device in this.videoDevices" :key="device.id" :value="device.deviceId">{{device.label}}</option>
              </select>
            </div>            
            <div>
              <label>Microphone</label>
              <select :value="getSelectedMicrophoneDevice" @change="selectMediaDevice($event, 'microphone')" class="form-control">
                <option value="default">System Default</option>              
                <option v-for="device in this.microphoneDevices" :key="device.id" :value="device.deviceId">{{device.label}}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>            
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
import SceneEditableInput from '../components/scene-editable-input';
import draggable from 'vuedraggable';
import SceneAspect from '../components/scene-aspect';
import { dragscroll } from 'vue-dragscroll';
import Panzoom from '@panzoom/panzoom';
import VueShowdown, { showdown } from 'vue-showdown';
import Autocomplete from '@trevoreyre/autocomplete-vue'

import Peer from 'peerjs';
import bootbox from 'bootbox';

import GameServer from "./../assets/js/gameServer";
import GameClient from "./../assets/js/gameClient";
import FCSVTTClient from "./../assets/js/fcsVTTClient";
import FCSVTT from '../assets/js/fcsVTT'
import Models from '../assets/js/models';

import { isEqual } from 'lodash-es';
import { debounce } from 'vue-debounce';

let models = new Models();

let commonSvc = null;
let dbSvc = null;
let vttClient = null;
let fcsVtt = null;

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
    loading: Loading,
    scenezone: SceneZone,
    sceneaspect: SceneAspect,
    editableinput: SceneEditableInput,
    Autocomplete,
  },
  created() {
    vttClient = new FCSVTTClient();
    fcsVtt = new FCSVTT();
  },
  mounted(){    
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);       
  },  
  watch: {
    userId() {
      //wait for our authenticated user before we setup the scene
      this.setupScene(this.userId);                
    },
    chatLog() {
      setTimeout( () => {
        this.ScrollChatToBottom();
      }, 300);
    },
    scene: {
      // This will let Vue know to look inside the array
      deep: true,
      
      //give some delay to account for users typing and such before we broadcast scene changes
      handler: debounce( async function(scene) {
        if (this.isLoading || this.isNewScene) return;

        if (this.hasSceneChanged()) {
          if (this.scene) {
            this.broadCastSceneChange();
          }

          //only the hose can save changes, so when it receives a broacast, save the scene
          if (this.isHost) {
            await this.saveScene(true);
            this.broadCastSceneChange();
          }
        }
      }, 300)
      //}
    },
  },
  updated() {
    if (this.loading) {
      this.init();
    }
  },
  data () {
    return {   
      loading: true,
      savingScene: false,
      scene : {},
      //keep the old values so we know when to save. Trying to prevent
      //infinite loops when saving/broadcasting scene changes
      previousSceneData : {},
      id: this.$route.params.id,
      canvas: null,     
      showchat: true,
      chatMessage: "",
      gameServer: null,
      gameClient: null,  
      saveInProgress: false,
      fullScreen: false,
      editingScene: false,
      isUpdating: false,      
      selectedPlayer: "everyone",
      connectedPlayers: null,
      mediaSettings: {
        useVideo: localStorage.getItem('fcs_useVideo') ? (localStorage.getItem('fcs_useVideo') == "true" ? true : false) : true,
        useAudio: localStorage.getItem('fcs_useAudio') ? (localStorage.getItem('fcs_useAudio') == "true" ? true : false) : true,
        videoDevice: localStorage.getItem('fcs_videoDevice') ?? null,        
        microphoneDevice: localStorage.getItem('fcs_microphoneDevice') ?? null,
      },
      videoDevices: new Array(),      
      microphoneDevices: new Array(),      
      chatLog: "",
      waitingForGameStart: false,
      waitingToJoin: false,
      isrunning: false,      
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'currentUser'
    ]),
    isNewScene() {
      return this.$route.params.id === "create";
    },   
    isLoading() {
      return this.loading;
    },
    commonSvc() {
      return commonSvc;
    },
    getUserName() {      
      if (this.getPlayer(this.userId)) {
        return this.getPlayer(this.userId).userName;
      }
      else return this.$store.state.userSession.getIdToken().payload.email.split("@")[0];
    },
    isHost() {      
      //TODO: look for IsSubscribed here, as the host must be a subscriber
      return this.scene.owner_id == this.userId;
    },
    isSceneRunning() {
      return this.isrunning;
    },
    isConnected() {      
      return this.gameClient && this.gameClient.peer && this.gameClient.peer.open;
    },
    getSelectedVideoDevice() {      
      return this.mediaSettings.videoDevice ?? "default";
    },    
    getSelectedMicrophoneDevice() {
      return this.mediaSettings.microphoneDevice ?? "default";
    }
  },
  methods: {
    hasSceneChanged() {
      //ditch the vue js junk from these objects so we can compare them vanilla
      let vscene = commonSvc.DeepCopy(this.scene);
      let voldscene = this.previousSceneData;
      let isChanged = this.getObjectDiff(vscene, voldscene);
      return isChanged.length > 0;
    },
    getObjectDiff(obj1, obj2) {
        const diff = Object.keys(obj1).reduce((result, key) => {
            if (!obj2.hasOwnProperty(key)) {
                result.push(key);
            } else if (isEqual(obj1[key], obj2[key])) {
                const resultKeyIndex = result.indexOf(key);
                result.splice(resultKeyIndex, 1);
            }
            return result;
        }, Object.keys(obj2));

        return diff;
    },
    init() {
      //panzoom the canvas
      const panElem = document.getElementById('scene-canvas')
      const panzoom = Panzoom(panElem, {
        maxScale: 5,
        overflow: scroll,
      });
            
      panElem.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);     
      this.canvas = panzoom;
      this.loading = false;

      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        this.commonSvc.Notify("enumerateDevices() not supported.");
        return;
      }

      navigator.mediaDevices.enumerateDevices()
      .then( (devices) => {        
        devices.forEach( (device) => {
          if (device.kind == "audioinput") {
            this.microphoneDevices.push(device);
          }

          if (device.kind == "videoinput") {
            this.videoDevices.push(device);
          }
        });
      })
      .catch(function(err) {
        this.commonSvc.Notify(err.name + ": " + err.message);
      });
    },      
    setupScene(userId) {
      if (this.userId == "public") {
        commonSvc.Notify("You must be logged in to use this feature.", "error", 2000, () => { document.location.href = `/login?redirect=${document.location.href}` });
        return;
      };

      this.sceneId = commonSvc.SetId("SCENE", fcs.$route.params.id);
      
      this.getScene(this.userId, this.sceneId);     
            
      //hide the footer for a better game table experience
      document.getElementsByTagName("footer")[0].className += " d-none";

      this.attachListeners();
    },
    attachListeners() {
      document.addEventListener('clienterror', (e) => {        
       this.exitGame();
       this.commonSvc.Notify("Game may not be running. Please make sure the game was started by the host and try again.");
      }, false);

      document.addEventListener('gameserver', (e) => {        
        //if the gameserver is running then setup the game
        switch(e.detail.type) {
          case "connected":
            this.sendSystemMessage("Game server is running. Waiting for players...");
            this.setupGameServer(e);
            break;
          case "scene":
            //if the host isn't connected as a user, make sure we still update the server
            // when others make changes
            if (!this.isConnected) {              
              this.scene = e.detail.message;
            }
            break;          
          case "disconnected":
            //server disconnected
            this.sendSystemMessage("Game server disconnected!");
            this.exitGame();
            break;
        }
      }, false);

      document.addEventListener('mediacontrol', (e) => {        
        let playerId = e.detail.playerId;
        let action = e.detail.type;

        switch(action) { 
          case "mute":       
            this.gameClient.myStream.getAudioTracks()[0].enabled = false;
            break;
          case "unmute":
            this.gameClient.myStream.getAudioTracks()[0].enabled = true;
            break;
          case "pause":            
            this.gameClient.myStream.getVideoTracks()[0].enabled = false;
            break;
          case "play":
            this.gameClient.myStream.getVideoTracks()[0].enabled = true;
            break;
        }          
      });

      document.addEventListener('userconnected', (e) => {        
        this.gameClient.join(this.getUserName, this.mediaSettings);
      }, false);

      document.addEventListener('userjoined', (e) => {
        this.updatePlayer("peerId", this.gameClient.peer.id);
      }, false);

      document.addEventListener('userdisconnected', (e) => {
        if (this.gameClient) {
          this.gameClient.displayChatMessage({ "userName": "System", "message": `${e.detail.player.userName} disconnected...` });

          if (e.detail.player.playerId) {
            const playerVidDomId = this.commonSvc.GetPlayerIdForDom(e.detail.player.playerId);
            let playerContainer = document.getElementById(playerVidDomId);
            if (playerContainer) {
                playerContainer.parentNode.removeChild(playerContainer);
            }
          }
        }
      }, false);
      
      document.addEventListener('sceneupdate',  (e) => {        
        if (e) {
          this.isUpdating = true;
          this.$set(this, 'scene', e.detail.scene);          
        }
      }, false);

      document.addEventListener('gameend',  (e) => {
        this.isrunning = false;        
        this.exitGame();
      }, false);

      document.addEventListener('gameerror',  (e) => {
        this.commonSvc.Notify(e.detail.message);
        this.isrunning = false;        
      }, false); 
     
      window.addEventListener("message",  (e) => {
        this.sendFormattedChat(e);
      }, false);

      document.addEventListener("playerupdate", (e) => {        
        this.scene.players = e.detail;
      }, false);

      document.addEventListener("displaychatmessage", (e) => {
        this.updateChatLog(e.detail.userName, e.detail.message);
      });
      
      window.addEventListener("beforeunload", (e) => {                
        if (this.isSceneRunning) {
          e.returnValue = 'Your scene is still running! You should shut it down before you exit this page. Do you still want to leave?';          
        }        
      });
    },
    startGame() {
      this.waitingForGameStart = true;
      this.gameServer = new GameServer();      
      this.gameServer.initialize(this.scene.gamePeerId);      
    },
    stopGame() {
      if (this.isHost)
      {
        this.gameServer.endScene();
        this.waitingForGameStart = false;
      }
    },
    joinGame() {      
      this.toggleFullScreen(true);
      this.waitingToJoin = true;
      const gameServerId = this.scene.gamePeerId;
      this.gameClient = new GameClient(gameServerId, this.userId, this.getUserName, this.isHost);
      this.gameClient.initialize();      
    },
    exitGame() {
      this.toggleFullScreen(false);
      this.waitingForGameStart = false;
      this.waitingToJoin = false;
      
      if (!this.gameClient) return;

      for (let conn = 0; conn < this.gameClient.mediaConnections.length; conn++) {
          let mediaStream = this.gameClient.mediaConnections[conn];                      
          mediaStream.close();
      }

      for (let conn = 0; conn < this.gameClient.connections.length; conn++) {
          let chatConnection = this.gameClient.connections[conn];
          chatConnection.close();
      }
      
      this.gameClient.cleanupConnections();

      //remove all the player media containers
      document.getElementById("player-container").innerHTML = "";

      //stop my stream
      try {
        this.gameClient.myStream.getAudioTracks()[0].stop();        
      }catch(e) {
        console.log(e.message);
      }
      try {
        this.gameClient.myStream.getVideoTracks()[0].stop();
      }catch(e) {
        console.log(e.message);
      }
         
      //close all streams      
      if (this.gameClient.peer) this.gameClient.peer.destroy();
      this.gameClient.peer = null;
      this.gameClient.myStream = null;      
    },
    updatePlayer(key, value)
    {
      var idx = this.scene.players.findIndex(obj => {
        return obj.playerId === this.userId
      })
      
      this.scene.players[idx][key] = value;
    },
    startNewRound() {
      bootbox.confirm({
        title: "Start a New Round?",
        message: "This will update the action icon on all objects. Start a new round?",
        buttons: {
            confirm: {
              label: 'Yes',
              className: 'btn-success'
            },
            cancel: {
              label: 'No',
              className: 'btn-secondary'
            }
        },
        callback: (result) => {
          if (result) {
            commonSvc.Notify("Starting a new round...", "info");
            for (let zoneIdx in this.scene.zones) {
              for (let objIdx in this.scene.zones[zoneIdx].sceneobjects) {
                this.scene.zones[zoneIdx].sceneobjects[objIdx].hasOwnProperty('acted')
                  this.scene.zones[zoneIdx].sceneobjects[objIdx].acted = false;  
              }
            };
          }
        }
      });      
    },
    async getScene(ownerId, id) {
      var $component = this;

      if (this.id === "create") {
        this.create();
        return;
      }

      this.scene = await dbSvc.GetObject(id);
      this.previousSceneData = commonSvc.DeepCopy(this.scene);
      
      if (!this.scene)
      {
        commonSvc.Notify(`Could not find scene with id <b>${commonSvc.GetId(id)}</b>`, 'error', 2000, () => {
          document.location = '/scene';
        });
      }      

      this.configureUser();      
    },   
    configureUser() {      
      //add this user to the scenes user list. We'll use this to let users configure things
      //about themselves like their userName.            
      if (!this.scene.players) {
        this.scene.players = new Array();
      }

      let player = this.getPlayer(this.userId);
      if (!player) {        
        let player = {
          "playerId": this.userId,
          "userName": this.$store.state.userSession.getIdToken().payload.email.split("@")[0],
          "peerId": null,
        }
        this.scene.players.push(player);
        player = this.getPlayer(player.playerId);
      }      
    },
    getPlayer(id) {       
      if (!this.scene.players) return null;
      var player = this.scene.players.find(obj => {
        return obj.playerId === id
      })

      return player;
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
        "gamePeerId": null,        
      };
      this.$set(this, 'scene', c);
      this.loading = false;
    },
    saveScene : async function(suppressMessage) {      
      if (this.isHost) {        
        var $component = this;

        if (!this.scene.name) {
          commonSvc.Notify('You must enter a name', 'error');
          this.savingScene = false;
          return;
        }

        //create a new scene Id if we don't have one
        let isNew = false;
        if (!$component.scene.id) {
            isNew = true;
            $component.$set($component.scene, "id", `SCENE|${commonSvc.GenerateUUID()}`);
            $component.$set($component.scene, "owner_id", this.userId);
        }

        //make a searchable list of players
        if (!this.scene.players) this.scene.players = new Array();        
        this.scene.playerList = this.scene.players.map(p => p.playerId);
        this.scene.playerList = this.scene.playerList.filter(p => p !== this.userId);
            
        let response = await dbSvc.SaveObject($component.scene);
        this.previousSceneData = this.previousSceneData = commonSvc.DeepCopy(this.scene);
        
        if (response) {
          if (suppressMessage !== true || isNew) {
            commonSvc.Notify('Scene saved.', 'success', null, () => {;
              if (isNew) {
                location.href = '/scene/' + commonSvc.GetId($component.scene.id);
              }
            });
          }      
        }
      }
    },
    broadCastSceneChange() {
      //don't broadcast when you are the receiver of an update
      if (this.isUpdating) {
        this.isUpdating = false;
        return;
      }

      if (!this.isLoading && this.gameClient && this.gameClient.peer && this.gameClient.peer.open) {
        this.gameClient.updateScene(this.scene);
      }      
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
      if (!this.scene.zones) {
        this.$set(this.scene, 'zones', new Array());
      }
      this.scene.zones.push(zone);
      this.$forceUpdate();
    },
    addAspect() {
      let aspect = models.SceneAspect("", "", "scene");
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
    },
    sendSystemMessage(message) {
      this.gameServer.displayChatMessage(message);     
    },
    sendChatMessage() {
      if (!this.chatMessage) return;      
      
      let userName = this.getUserName;
      if (this.gameClient) {        
        if (this.selectedPlayer !== "everyone") {
          let player = this.scene.players.find(obj => {
            return obj.playerId === this.selectedPlayer
          });
          this.gameClient.sendPrivateMessage(userName, player, this.chatMessage); 
          this.updateChatLog(`${userName} (pm ${player.userName})`, this.chatMessage);                   
        }
        else {
          this.gameClient.sendChatMessage(userName, this.chatMessage);          
        }        
      }
      else {
        this.updateChatLog(userName, this.chatMessage);
      }
      
      this.chatMessage = "";
    }, 
    updateChatLog(userName, msg) {      
      this.chatLog += `\n
**${userName}**:
${msg}`;      
    },  
    sendFormattedChat(e) {
      if (e.data.type !== "charactersheet") return;
      let msg = e.data.data;
      if (this.gameClient) {
        this.gameClient.sendChatMessage(this.getUserName, msg);
      } else {
        this.updateChatLog(this.getUserName, msg);
      }      
    },
    toggleFullScreen(goFullScreen) {
      this.fullScreen = goFullScreen;
      if (this.fullScreen) {
        document.getElementsByClassName("navbar")[0].classList.add("d-none");        
        document.getElementById("game-table").style.height = "82vh";      
      }
      else {
        document.getElementsByClassName("navbar")[0].classList.remove("d-none");         
        document.getElementById("game-table").style.height = "85vh";        
      }
    },   
    setupGameServer(e) {      
      this.isrunning = true;      
      this.waitingForGameStart = false;
      
      if (this.isHost) {
        if (this.scene.gamePeerId !== e.detail.peerid)
        {
          this.scene.gamePeerId = e.detail.peerid;                
        }
      }
    },
    sendToVTT(type, description, data, data2, character) {
      let msg=null;            
      switch(type) {
        case "diceroll":               
          let rollModifier = parseInt(data);  //try to match it straight up
          let desc2 = description;
          if (isNaN(rollModifier))
          {
            var findModifier = data.match(/(\d)/);
            if (findModifier) {
              rollModifier = findModifier[0];              
            }
            else {
              findModifier = description.match(/(\d)/);
              if(findModifier) {
                rollModifier = findModifier[0];
              }
              desc2 = data;
            }
          }

          msg = models.MsgDiceRoll(character, description, desc2, rollModifier);
          break;
        case "invoke":
          if (!data) return;
          msg = models.MsgInvoke(character, data2, data);
          break;
        case "stuntextra":          
          msg = models.MsgStuntExtra(character, `${description}: ${data}`);
          break;
        case "fatepoint":          
          msg = models.MsgFatePoint(character, description, data);
          break;
        case "stress":
        case "condition":
          msg = models.MsgStress(character, description, data);
          break;        
        case "consequence":
          //when dealing with consequences, we'll give them a temporary space for 
          // the value of the consequence so we can invoke it         
          this.consequences[data2] = data;
          msg = models.MsgConsequence(character, description, data);
          break;
      }
      window.postMessage({type: "fcsVTT", data: msg});      
    },
    rollFateDice() {      
      let msg =  {
          character: this.getUserName,
          action: `Rolled: _4df_`,
          roll: { 
              modifier: `0`,
          }
      };    
      vttClient.chatMessage(msg);
    },
    shareUrl : function(event) {
      event.preventDefault();
      commonSvc.CopyTextToClipboard(event.currentTarget.href);
    },
    clearChatLog() {
      bootbox.confirm({
        title: "Clear Chat?",
        message: "Are you sure you want to clear the chat log? This cannot be undone.",
        buttons: {
            confirm: {
              label: 'Yes',
              className: 'btn-danger'
            },
            cancel: {
              label: 'No',
              className: 'btn-secondary'
            }
        },
        callback: (result) => {
          if (result) {
            this.chatLog = "";
          }
        }
      });      
    },
    clearScene() {
      bootbox.confirm({
        title: "Clear Scene?",
        message: "Are you sure you want to clear the scene? This cannot be undone.",
        buttons: {
            confirm: {
              label: 'Yes',
              className: 'btn-danger'
            },
            cancel: {
              label: 'No',
              className: 'btn-secondary'
            }
        },
        callback: (result) => {
          if (result) {
            this.scene.zones = [];
            this.scene.aspects = [];
          }
        }
      });
    },
    spendFate(event){      
      let newValue = event.target.value;
      let msg = parseInt(newValue) > (parseInt(this.scene.fatepoints || 0)) ? "Gained" : "Spent";      
      this.sendToVTT("fatepoint", `${msg} a fate point`, msg == "Gained" ? 1 : 0, null, "The Storyteller");
      this.scene.fatepoints = newValue;
    },
    updateOnlineSettings(event) {      
      //users can't save the scene, so store some settings
      localStorage.setItem('fcs_useAudio', this.mediaSettings.useAudio);
      localStorage.setItem('fcs_useVideo', this.mediaSettings.useVideo);
    },
    selectMediaDevice(event, type) {
      let selectedValue = event.target.value;
            
      switch(type) {
        case "video":
          localStorage.setItem('fcs_videoDevice', selectedValue);  
          this.mediaSettings.videoDevice = selectedValue;
          break;       
        case "microphone":         
          localStorage.setItem('fcs_microphoneDevice', selectedValue);  
          this.mediaSettings.microphoneDevice = selectedValue;          
          break;
      }
      
    },
    ScrollChatToBottom() {          
      var chatLogContainer = this.$el.querySelector("#chat-log");
      chatLogContainer.scrollTop = chatLogContainer.scrollHeight;    
    },
     /* campaign search */
    searchCampaigns(query) {      
      return new Promise((resolve) => {
        if (query.length < 3) {
          return resolve([])
        }
        
        dbSvc.ListObjects("CAMPAIGN", this.userId, query)
          .then((data) => {
            resolve(data)
          })
      })
    },
    getCampaignResultValue(result) {
      return result;
    },    
    selectCampaignResult(result) {
      this.copyChatToCampaign(result);      
      this.$refs.popoverCampaign.$emit('close');   
    },   
    copyChatToCampaign(campaign) {
      let session = {
        id: commonSvc.SetId("LOG", commonSvc.GenerateUUID()),
        object_type: "LOG",
        date: commonSvc.GetFormattedDate(new Date()),
        description: this.chatLog,
        related_id: campaign.id,
        owner_id: this.userId,
      };
      
      dbSvc.SaveObject(session).then( (response) => {  
        if (response) {      
          commonSvc.Notify(`Chat saved to campaign ${campaign.name}.`, 'success');
        }
      });
      
      this.clearChatLog();
    }
    /* end character search */
  },
}
</script>
