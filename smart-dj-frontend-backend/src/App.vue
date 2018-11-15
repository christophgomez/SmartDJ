<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/account">Account</router-link>
      <router-link to="/system_settings">Settings</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang='scss'>
@import "~vue-material/dist/theme/engine"; // Import the theme engine

@include md-register-theme("default", (
  primary: #42b983,
  accent: #FFC2AB,
));
@import "~vue-material/dist/theme/all"; // Apply the theme

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

button {
  color: white;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
