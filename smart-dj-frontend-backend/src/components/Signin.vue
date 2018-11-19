<template>
	<md-card class="md-size-50 md-small-size-100">
		<md-card-header>
			<div class="md-title">Sign into your Account</div>
		</md-card-header>
		
		<md-card-content>
			<div class="md-layout md-gutter">
				<div class="md-layout-item md-small-size-100">
					<md-field :class="getValidationClass('userName')">
						<label for="user-name">Username</label>
						<md-input type="user-name" name="user-name" id="user-name" v-model.lazy="$v.form.userName.$model"/>
						<span class="md-error" v-if="!$v.form.userName.required">The username is required</span>
					</md-field>
				</div>
      </div>
      <div class="md-layout md-gutter">
      	<div class="md-layout-item md-small-size-100">
        	<md-field :class="getValidationClass('password')">
          	<label for="password">Password</label>
          	<md-input type="password" name="password" id="password" v-model.lazy="$v.form.password.$model"/>
          	<span class="md-error" v-if="!$v.form.password.required">The password is required</span>
          </md-field>
        </div>
      </div>
      <div class="md-layout md-gutter">
        <div class="md-layout-item md-small-size-100">
          <md-button class="md-raised" @click='login()' style='margin-top:20px'>Sign In</md-button>
        </div>
      </div>
    </md-card-content>
  </md-card>
</template>

<script>
/* eslint-disable */
import { required, minLength } from "vuelidate/lib/validators";
import UserService from '@/services/UserService';

export default {
  name: "SignIn",
  components: {},
  data() {
    return {
      form: {
        password: null,
        userName: null
      },
      userSaved: false,
      sending: false,
      lastUser: null
    }
  },
  validations: {
    form: {
      password: {
        required,
      },
      userName: {
        required,
      }
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
      this.$v.$reset();
      this.form.password = null;
      this.form.userName = null;
      this.form.email = null;
    },
    async login() {
      const response = await UserService.loginUser({
        username: this.$v.form.userName.$model,
        password: this.$v.form.password.$model
      });
      if(response.data.success === true) {
        localStorage.setItem('jwtToken', response.data.token);
        console.log('username: '+this.$v.form.userName.$model);
        localStorage.setItem('username', this.$v.form.userName.$model);
        this.$router.go(-1);
      } else {
        alert(response.data.msg);
        this.clearForm();
      }
    },
    clearForm() {
      this.$v.form.userName.$model = '';
      this.$v.form.password.$model = '';
      this.$v.$reset();
    },
  }
};
</script>

<style scoped>
.md-card {
  z-index:1;
  margin-right:10px;
}
.md-card-content {
  padding: 50px;
}
.md-button {
  background-color:#42b983;
  color:white;
}
</style>
