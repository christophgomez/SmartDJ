<template>
  <div id="app">
    <form novalidate class="md-layout" @submit.prevent="validateUser">
      
       <md-card class="md-layout-item md-size-50 md-small-size-100">
        <md-card-header>
          <div class="md-title">Create an Account</div>
        </md-card-header>

        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
             <md-field :class="getValidationClass('userName')">
               <label for="user-name">User Name</label>
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
          <md-button class="md-raised md-primary">Link Spotify</md-button>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-button class="md-raised md-primary">Submit</md-button>
            </div>
          </div>

        </md-card-content>
       </md-card>
    </form>
  </div>

</template>

<script>
import HelloWorld from './components/HelloWorld'

 import { validationMixin } from 'vuelidate'
  import {
    required,
    minLength,
    maxLength,
    password,
    userName,
  } from 'vuelidate/lib/validators'

export default {
  name: 'App',
  mixins: [validationMixin],
  components: {
    
  },
  data: () => ({
      form: {
        password: null,
        userName: null,
      },
      userSaved: false,
      sending: false,
      lastUser: null
   }),
   validations: {
      form: {
        password: {
          required,
          maxLength: maxLength(3)
        },
        userName: {
          required,
          minLength: maxLength(3)
        },
      }
    },
      methods: {
      getValidationClass (fieldName) {
        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty
          }
        }
      },
      clearForm () {
        this.$v.$reset()
        this.form.password = null
        this.form.userName = null
        this.form.email = null
      },
      saveUser () {
        this.sending = true

        // Instead of this timeout, here you can call your API
        window.setTimeout(() => {
          this.userSaved = true
          this.sending = false
          this.clearForm()
        }, 1500)
      },
      validateUser () {
        this.$v.$touch()

        if (!this.$v.$invalid) {
          this.saveUser()
        }
      }
    }
  }

</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
