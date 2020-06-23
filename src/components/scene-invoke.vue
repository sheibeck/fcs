<template>
  <span class="d-flex">
    <input type="checkbox" class="mt-2" v-for="invoke in invokes" v-bind:key="invoke.id" :checked="invoke.used" @change="toggleInvoke($event, invoke.id)" />
    <button type="button" class="btn btn-link p-0 m-0" title="Add invoke" @click="addInvoke()"><i class="fas fas fa-plus-circle fa-xs"></i></button>
    <span>
      <button v-if="invokes.length > 0" type="button" class="btn btn-link p-0 m-0" title="Remove invoke" @click="removeInvoke()"><i class="fas fas fa-minus-circle fa-xs"></i></button>
    </span>
  </span>
</template>

<script>
import CommonService from '../assets/js/commonService';

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
      let invoke = {id:this.commonSvc.GenerateUUID(), used: false};
      this.invokes.push(invoke);
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
</style>
