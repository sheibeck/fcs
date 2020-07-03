<template>
  <span class="p-0 m-0">
    <input type="checkbox" title="Use invoke" class="" v-for="invoke in invokes" v-bind:key="invoke.id" :checked="invoke.used" @change="toggleInvoke($event, invoke.id)" />
    <button type="button" class="btn btn-link p-0 m-0" title="Add invoke" @click="addInvoke()"><i class="fas fa-plus-circle fa-xs"></i></button>    
    <button v-if="invokes.length > 0" type="button" class="btn btn-link p-0 m-0" title="Remove invoke" @click="removeInvoke()"><i class="fas fa-minus-circle fa-xs"></i></button>    
  </span>
</template>

<script>
import CommonService from '../assets/js/commonService';
import Models from '../assets/js/models';

let models = new Models();

export default {
  name: 'SceneInvoke',
  props: {
    invokes: Array,
  },  
  computed: {    
  },
  data () {
    return { 
      commonSvc: new CommonService(),
    }
  },
  methods: {    
    addInvoke() {      
      this.invokes.push(models.SceneInvoke());
    },
    removeInvoke() {      
      this.invokes.pop();
    },   
    toggleInvoke(event, id) {      
      let idx = this.invokes.findIndex(x => x.id === id);
      this.invokes[idx].used = event.target.checked;
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
