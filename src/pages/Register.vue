<template>
  <div class="container mt-2 text-center">
    <div class="row">
      <div class="col-sm-12 h1">
        Register
      </div>
      <div class="col-sm-12">
        Register your account to get access to unlimited characters and campaigns. After you register, you can subscribe to get additional benefits!
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
        <div class="form-group">
          <label for="passwordConfirm">Confirm Password</label>
          <input type="password" class="form-control" id="passwordConfirm" placeholder="Confirm Password">
        </div>
        <div class="small">
          Password must be atleast 8 characters long and contain atleast one number, uppercase letter and lowercase letter.
        </div>
        <button type="button" class="btn btn-primary col-sm-12 col-md-5 mt-1 mb-1 mt-2 btn-register" v-on:click="register">
            Register <i class="fas fa-user-plus"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CommonService from "./../assets/js/commonService";
import UserService from "./../assets/js/userService";

export default {
  name: 'Login',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Register',
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
  methods: {
    validateEmail: function(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    },
    register: function() {
      let commonSvc = new CommonService(this.$root);

      if ($('#password').val() != $('#passwordConfirm').val())
      {
        commonSvc.Notify('Passwords do not match.');
        return false;
      }

      if (!this.validateEmail($('#email').val()))
      {
        commonSvc.Notify('Email is not valid.');
        return false;
      }

      let userSvc = new UserService(this.$root);
      userSvc.Register($('#email').val(), $('#password').val());
    }
  }
}
</script>
