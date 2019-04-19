<template>
  <div id="auth">
    <div v-if='success===true' class='success'>
      <div v-if='user===false'>
        <h1>Thank you for using SmartDJ!</h1>
        <h3>To control your Spotify using gestures and your webcam we need to take a few pictures of you</h3>
        <p>These pictures will be used by our machine learning algorithm to implement facial recognition</p>
        <p>Click the button below to take finish creating your an account</p>
        <md-button class="md-raised chr" @click='cont()'>Continue</md-button>
      </div>
    </div>
    <div v-if='success===false' class='fail'>
        <h1>Uh oh!</h1>
        <hr>
        <p>Something went wrong linking your Spotify Account</p><font-awesome-icon icon='frown' size="3x"/> <br><br><p>Please go back and try again</p>
    </div>
  </div>
</template>

<script>
import SpotifyService from '@/services/SpotifyService';
import UserService from '@/services/UserService';

export default {
  name: 'Auth',
  data () {
    return {
      success: Boolean,
      user: Boolean,
      code: null
    }
  },
  mounted() {
    /*window.onbeforeunload = function () {
      window.opener.checkToken();
    }*/
    if(this.$route.query.code) {
      this.code = this.$route.query.code;
      this.exchange();
    }
    if(this.$route.query.error) {
      this.success = false;
    }
  },
  methods: {
    async exchange() {
      var code = this.code;
      const response = await SpotifyService.exchange({code});
      if(response.data.success === true) {
        this.success = true;
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);

        // check if user exists in the database
        
        // get this user's email from spotify to check against
        const eRes = await SpotifyService.getProfile(response.data.access_token);

        // server returned an email
        if(eRes.data.success === true) {
          var email = eRes.data.email;
          localStorage.setItem('email', email);

          // check if that email is in the database
          const pRes = await UserService.getUser(email);

          // if true, continue to visualizer, start python script on backend
          if(pRes.data.success === true) {
            this.user = true;
            this.$router.replace({name: 'visualizer'});
          }
          
          // Create a new user
          else {
            this.user = false;
          }
        }

        // couldn't get a response from spotify, probably a bad access code, which is a big bug and shouldn't happen in this if  
        else {

        }
      } else {
        this.success = false;
      }
    },
    cont() {
      this.$router.replace({name: 'AccountCreation'});
    }
  }
}
</script>

<style scoped>
#auth {
  width:100%;
  height: 100%;
  margin: 0 auto;
  background: #13242f;
}
.chr {
  background-color:#0266C8;
  margin-top:1em;
  color:white;
}
hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #ccc;
    margin: 1em auto;
    padding: 0;
    width: 25%;
}
.fail {
  color: white;
  width: 100%;
  text-align:center;
  height: 100%;
  padding: 10px;
  position: relative;
}
.success {
  color: white;
  width: 100%;
  text-align:center;
  height: 100%;
  padding: 10px;
  position: relative;
}
#auth:before {
  background-size: 100%;
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY3g9IjUwJSIgY3k9IiIgcj0iOTUlIj48c3RvcCBvZmZzZXQ9IjIwJSIgc3RvcC1jb2xvcj0iIzAwMDAwMCIgc3RvcC1vcGFjaXR5PSIwLjAiLz48c3RvcCBvZmZzZXQ9Ijk1JSIgc3RvcC1jb2xvcj0iIzAwMDAwMCIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==');
  background-image: -moz-radial-gradient(center, ellipse cover, rgba(0, 0, 0, 0) 20%, #000000 95%);
  background-image: -webkit-radial-gradient(center, ellipse cover, rgba(0, 0, 0, 0) 20%, #000000 95%);
  background-image: radial-gradient(ellipse cover at center, rgba(0, 0, 0, 0) 20%, #000000 95%);
  position: absolute;
  content: "";
  z-index: 0;
  opacity: 0.9;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
}
#auth:after {
  	position: absolute;
  	content: "";
  	z-index: 0;
  	opacity: 0.8;
  	height: 100%;
  	width: 100%;
  	left: 0;
  	top: 0;
}
</style>

