<template>
  <div class="hello">
    <img src='../assets/kinect.png'/>
    <h1>{{ msg }}</h1>
    <h2>
      A quick, developmental front-end created with Vue.js
    </h2>
    <p>
      Built ugly on purpose, for debugging and quick development. 
    </p>
    <p>
      The real magic is happening in the Node.js server
    </p>
    <h3>Essential Links</h3>
    <a href='#' @click.prevent='logout'>Logout</a>
    <ul>
      <li><a href='https://developer.spotify.com/documentation/web-api/' target="_blank" rel="noopener">Spotify Web API Docs</a></li>
      <li><a href='https://developer.spotify.com/documentation/web-playback-sdk/quick-start/' target='_blank' rel="nooponer">Spotify Web Playback SDK</a></li>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">Vue.js Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">Vue.js Forum</a></li>
    </ul>
    <h3>Ecosystem</h3>
    <ul>
      <li><a href="https://nodejs.org/en/" target="_blank" rel="noopener">Node.js</a></li>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a></li>
      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a></li>
      <!--<li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a></li>-->
    </ul>
  </div>
</template>

<script>
import SpotifyService from '@/services/SpotifyService';

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods: {
    async login() {
      const response = await SpotifyService.login();
      location.href = (response.data.redirect);
    },
    logout() {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('username');
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
img {
  height:5%;
  width:5%;
  padding:none;
  color: #42b983;
}
h3 {
  margin: 35px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
button {
   background:none!important;
     border:none; 
     padding:0!important;
     font: inherit;
     color: #42b983;
     /*border is optional*/
     border-bottom:1px solid #42b983; 
     cursor: pointer;
}
button:focus {
  outline: 0;
}
li {
  display: inline-block;
  margin: 20px 10px;
}
a {
  color: #42b983;
}
</style>
