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
          <input v-model="email" type="email" class="form-control" id="email" aria-describedby="emailHelp" placeholder="Enter email" @keyup.enter="login">          
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input v-model="password" type="password" class="form-control" id="password" placeholder="Password" @keyup.enter="login">
        </div>
        <button v-on:click="login" type="button" class="btn btn-primary col-sm-12 col-md-5 mt-1 mb-1">
            Login <i class="fas fa-sign-in-alt"></i>
        </button>
        <a href='/register' type="button" role="button" class="btn btn-secondary col-sm-12 col-md-5 mt-1 mb-1 rounded-2">
            Register <i class="fas fa-user-plus"></i>
        </a>
        <a href='/recover' class="col-sm-12 col-md-5 mt-1 mb-1">
            Forgot your password?
        </a>
        <br />
        <a href="#" @click="resendConfirmationCode" class="col-sm-12 col-md-5 mt-1 mb-1">
            Resend your confirmation email?            
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserService from "./../assets/js/userService";

export default {
  name: 'Login',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Login'     
  },
  data () {
    return {
      title: "Login",
      email: "",     
      password: "",
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
  methods: {
    login: function() {
      let userSvc = new UserService(this.$root);
      userSvc.Login(this.$data.email, this.$data.password);
    },
    
    resendConfirmationCode: function(e) {
      e.preventDefault();
      let userSvc = new UserService(this.$root);
      userSvc.ResendConfirmationCode(this.$data.email);
    }
  }
}
</script>
