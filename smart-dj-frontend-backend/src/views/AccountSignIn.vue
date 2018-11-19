<template>
  <div class='SignupSignin md-layout'>
    <div class='callout md-layout-item'>
      <b-jumbotron style='background-color:white' header="SmartDJ." lead="Sign in or create an account today to start using your device." >
        <p>Control playback, manage users and devices, view analytics</p>
        <hr>
          <b-button @click="changeView('signup')">Sign Up</b-button>
          <b-button @click="changeView('signin')">Sign In</b-button>
      </b-jumbotron>
    </div>
		<!--<router-view class='md-layout-item'></router-view>-->
    <div class='md-layout-item' style='margin-right:20px'>
      <div v-if='signin===true'>
        <SignIn/>
      </div>
      <div v-if='signup===true'>
        <SignUp/>
      </div>
    </div>
  </div>

</template>

<script>
import SignIn from '@/components/Signin';
import SignUp from '@/components/Signup';

export default {
  name: "AccountCreation",
  data() {
    return {
      signin: true,
      signup: false
    }
  },
  components: {
    SignIn,
    SignUp,
  },
  methods: {
    changeView(view) {
      console.log('changing view');
      switch(view) {
        case 'signin':
          this.signin = true;
          this.signup = false;
          break;
        case 'signup':
          this.signup = true;
          this.signin = false;
          break;
      }
    }
  }
};
</script>

<style scoped>
.SignupSignin {
  margin-top:25px;
}
.SignupSignin >>> .btn {
  margin-right:10px;
  color: white;
  background-color:#42b983 !important;
  border-color:#42b983
}
</style>
