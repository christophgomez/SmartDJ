<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/system_settings">System</router-link>
      <div id='sign-in'>
      <div v-if='username !== false'>
        <p>Signed in as {{ username }}</p>
      </div>
      <div v-if='username=== false'>
        Sign In
      </div>
    </div>
    </div>
    <router-view/>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import 'vue-material/dist/vue-material.min.css'

export default {
  name: 'App',
  data: function() {
    return {
      username: '',
    }
  },
  created() {
  },
  watch: {
    $route (to, from){
        if(localStorage.username) {
          this.username = localStorage.username;
        } else {
          this.username = false;
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
}
#nav {
  padding: 25px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
  margin: 30px;
}

#sign-in {
  margin-left:-100%;
  float: right;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
