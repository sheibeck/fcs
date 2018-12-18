<template>
  <div class="container mt-2 text-center">
    <div class="row">
      <div class="col-sm-12 h1">
        Login
      </div>
      <div class="col-sm-12 h4">
        Login to save and manage your characters and adversaries.
      </div>
    </div>
    <div class="row m-4 justify-content-md-center">
      <div class="col-sm-12 col-md-4">
        <div class="form-group">
          <label for="email">Email address</label>
          <input type="email" class="form-control" id="email" aria-describedby="emailHelp" placeholder="Enter email">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" class="form-control" id="password" placeholder="Password">
        </div>
        <button id="LoginCognito" type="button" class="btn btn-primary col-sm-12 col-md-5 mt-1 mb-1">
            Login <i class="fas fa-sign-in-alt"></i>
        </button>
        <a href='/register.htm' type="button" role="button" class="btn btn-secondary col-sm-12 col-md-5 mt-1 mb-1 rounded-2">
            Register <i class="fas fa-user-plus"></i>
        </a>
        <a href='/recover.htm' class="col-sm-12 col-md-5 mt-1 mb-1">
            Recover Password
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Login',
  created(){
  },
  udpated() {

  },
  data () {
    return {
      title: "Login"
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
}
</script>
