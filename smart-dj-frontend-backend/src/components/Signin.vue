<template>
	<md-card class="md-size-50 md-small-size-100 md-layout-item">
		<md-card-header>
			<div class="md-title">Sign into your Account</div>
		</md-card-header>
		
		<md-card-content>
			<div class="md-layout md-gutter">
				<div class="md-layout-item md-small-size-100">
					<md-field :class="getValidationClass('userName')">
						<label for="user-name">Username</label>
						<md-input type="user-name" name="user-name" id="user-name" autocomplete="user-name" v-model="form.userName" :disabled="sending" />
						<span class="md-error" v-if="!$v.form.userName.required">The username is required</span>
						<span class="md-error" v-else-if="!$v.form.userName.minLength">Invalid userName</span>
					</md-field>
				</div>
      </div>
      <div class="md-layout md-gutter">
      	<div class="md-layout-item md-small-size-100">
        	<md-field :class="getValidationClass('password')">
          	<label for="password">Password</label>
          	<md-input type="password" name="password" id="password" autocomplete="password" v-model="form.password" :disabled="sending" />
          	<span class="md-error" v-if="!$v.form.password.required">The password is required</span>
            <span class="md-error" v-else-if="!$v.form.password.minLength">Invalid password</span>
          </md-field>
        </div>
      </div>
      <div class="md-layout md-gutter">
        <div class="md-layout-item md-small-size-100">
          <md-button class="md-raised" @click='validateUser()' style='margin-top:20px;background-color:#42b983;'>Sign In</md-button>
        </div>
      </div>
    </md-card-content>
  </md-card>
</template>

<script>
/* eslint-disable */
import { required, minLength } from "vuelidate/lib/validators";

export default {
  name: "SignIn",
  components: {},
  data: () => ({
    form: {
      password: null,
      userName: null
    },
    userSaved: false,
    sending: false,
    lastUser: null
  }),
  validations: {
    form: {
      password: {
        required,
        minLength: minLength(3)
      },
      userName: {
        required,
        minLength: minLength(3)
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
    saveUser() {
      this.sending = true;
      // Instead of this timeout, here you can call your API
      window.setTimeout(() => {
        this.userSaved = true;
        this.sending = false;
        this.clearForm();
      }, 1500);
    },
    validateUser() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.saveUser();
      }
    }
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
