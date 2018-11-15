<template>
	<md-card class="md-size-50 md-small-size-100 md-layout-item">
		<md-card-header>
			<div class="md-title">Create an Account</div>
		</md-card-header>
		
		<md-card-content>
			<md-field :class="getValidationClass('userName')">
				<label for="user-name">Username</label>
				<md-input type="user-name" name="user-name" autocomplete="user-name" v-model.lazy="$v.form.userName.$model" :disabled="sending" />
				<span class="md-error" v-if="!$v.form.userName.required">The username is required</span>
				<span class="md-error" v-else-if="!$v.form.userName.minLength">Invalid userName</span>
			</md-field>
      <md-field :class="getValidationClass('password')">
        <label for="password">Password</label>
        <md-input type="password" name="password" v-model.lazy="$v.form.password.$model" :disabled="sending"/>
        <span class="md-error" v-if="!$v.form.password.required">The password is required</span>
        <span class="md-error" v-else-if="!$v.form.password.minLength">Invalid password</span>
      </md-field>
      <md-field :class="getValidationClass('repeatPassword')">
        <label for="repeatPassword">Repeat Password</label>
        <md-input type="password" name="repeatPassword" v-model.lazy="$v.form.repeatPassword.$model" :disabled="sending"/>
        <span class="md-error" v-if="!$v.form.repeatPassword.sameAsPassword">Passwords do not match!</span>
      </md-field>
      <md-button @click='openWindow()' class="md-raised md-primary" style='color:white'>Link Spotify</md-button>
      <span class="md-error" v-if="spotify===false"><br><br>There was an error linking your spotify account</span>
      <div class="md-layout md-gutter">
        <div class="md-layout-item md-small-size-100">
          <md-button class="md-raised md-primary" @click='validateUser' style='margin-top:20px;color:white'>Submit</md-button>
        </div>
      </div>
    </md-card-content>
  </md-card>
</template>

<script>
/* eslint-disable */
import { required, minLength, sameAs } from "vuelidate/lib/validators";
import SpotifyService from '@/services/SpotifyService';
import UserService from '@/services/UserService';

export default {
  name: "SignUp",
  components: {},
  data: () => ({
    form: {
      password: '',
      userName: '',
      repeatPassword: ''
    },
    access_token: '',
    refresh_token: '',
    userSaved: false,
    sending: false,
    lastUser: null,
    spotify: true,
  }),
  validations: {
    form: {
      password: {
        required,
        minLength: minLength(3)
      },
      repeatPassword: {
        sameAsPassword: sameAs('password')
      },
      userName: {
        required,
        minLength: minLength(3)
      },
    }
  },
  methods: {
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName];
      if (field) {
        return {
          "md-invalid": field.$invalid && field.$dirty
        };
      }
    },
    clearForm() {
      this.$v.form.userName.$model = '';
      this.$v.form.password.$model = '';
      this.$v.form.repeatPassword.$model = '';
      this.$v.$reset();
    },
    async saveUser() {
      this.sending = true;
      // Instead of this timeout, here you can call your API
      const response = await SpotifyService.checkAccessToken();
      if(response.status === 200) {
        this.spotify = true;
        this.access_token = response.data.access_token;
        this.refresh_token = response.data.refresh_token;
      } else {
        this.spotify = false;
        console.log('spotify false');
        return;
      }
      this.sending = true;
      //console.log(this.$v.form.userName.$model);
      const response2 = await UserService.createUser({
        username: this.$v.form.userName.$model,
        password: this.$v.form.password.$model,
        access_token: this.access_token,
        refresh_token: this.refresh_token
      });
      if(response2.status === 200) {
        this.userSaved = true;
        this.$router.push({ name: 'profile'});
      } else {
        window.setTimeout(() => {
          this.sending = false;
          this.clearForm();
        }, 1000);
      }
    },
    validateUser() {
      this.$v.$touch();
      if(!this.$v.invalid) {
        this.saveUser();
      }
    },
    async openWindow() {
      const response = await SpotifyService.login();
      var url = (response.data.redirect);
      var myWindow = window.open(url, '_blank', "height=500,width=500,toolbar=no,menubar=no,scrollbars=no,location=no,status=no left=300 top=200");
    },
  }
};
</script>

<style>
.md-card {
  z-index:1;
  margin-right:10px;
}
.md-card-content {
  padding: 50px;
}
</style>
