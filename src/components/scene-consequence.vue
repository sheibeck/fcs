<template>
  <div class="pl-1 ml-1">
    <span title="Click to edit" v-if="!editing" @click="editing = true">{{consequence.name}}</span>

    <div class="input-group" v-if="editing">  
      <input class="form-control-sm" v-model="consequence.name"  />
      <div class="input-group-append">              
          <button type="button" class="input-group-text" @click="editing = false"><i class="fas fa-check-circle text-success"></i></button>
      </div>
    </div>
    
    <div class="d-flex">
      <label>{{consequence.label}}</label><input type="text" v-model="consequence.value" class="ml-1 form-control-sm w-100" />
    </div>
    <invoke :invokes="consequence.invokes" class="pt-0" />    
  </div>
</template>

<script>
import SceneInvoke from './scene-invoke';
import CommonService from '../assets/js/commonService';

export default {
  name: 'SceneConsequence',
  props: {
    consequence: Object,
  },  
  components: {
    invoke: SceneInvoke,
  },
  computed: {    
  },
  data () {
    return { 
      editing: false,
      commonSvc: new CommonService(),
    }
  },
  methods: {    
  }

}
</script>

<style lang="scss" scoped>
</style>
