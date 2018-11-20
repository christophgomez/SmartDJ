<template>
  <div class="about">
    <!--<h1>Login {{this.$data.type}}</h1>
    <h2>This is the auth code: </h2><small><p>{{this.$route.query.code}}</p></small>
    <h3>Send it back to the server to exchange it for an auth key to start making requests</h3>
    <button @click='exchange'>Send</button>
    <p>(Note: In production, this page is completely bypassed and the user is simply redirected to their profile page. This is simply for debugging)</p>-->
  </div>
</template>

<script>
import SpotifyService from '@/services/SpotifyService';

export default {
  name: 'About',
  data () {
    return {
      type: 'Successful',
      code: null
    }
  },
  created() {
    window.onbeforeunload = function () {
      window.opener.checkTempToken();
    }
    this.code = this.$route.query.code;
    if(this.code == undefined) {
      this.type='Failed';
    }
    this.exchange();
  },
  methods: {
    async exchange() {
      var code = this.code;
      const response = await SpotifyService.exchange({code});
      window.close();
    }
  }
}
</script>

<style scoped>
.about{
  text-overflow: hidden;
}
a {
  color: #42b983;
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
</style>

