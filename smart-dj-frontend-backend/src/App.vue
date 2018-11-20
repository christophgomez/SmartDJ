<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/system_settings">System</router-link>
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
    console.log(this.$route);
  },
  watch: {
    $route (to, from){
        if(localStorage.username) {
          this.username = localStorage.username;
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

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
