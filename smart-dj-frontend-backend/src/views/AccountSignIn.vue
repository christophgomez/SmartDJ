<template>
  <div class='SignupSignin md-layout'>
    <div class='callout md-layout-item'>
      <b-jumbotron style='background-color:white' header="SmartDJ." lead="Sign in or create an account today to start using your device." >
        <p>Control playback, manage users and devices, view analytics</p>
        <hr>
          <router-link style='margin-right:10px; color:white;background-color:#42b983;border-color:#42b983' class='btn btn-primary' to="/signin/signup">Sign Up</router-link>
          <router-link style='margin-left:10px; color:white;background-color:#42b983;border-color:#42b983' class='btn btn-primary' to='/signin/'>Sign In</router-link>
      </b-jumbotron>
    </div>
		<router-view class='md-layout-item'></router-view>
  </div>

</template>

<script>
export default {
  name: "AccountCreation",
};
</script>

<style scoped>
.SignupSignin {
  margin-top:25px;
}
</style>
