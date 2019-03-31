<template>
	<div id="menu">
		<input type="checkbox" id="menuToggler" class="input-toggler" @click='active=!active'/>
  		<label for="menuToggler" class="menu-toggler">
    		<span class="menu-toggler__line"></span>
    		<span class="menu-toggler__line"></span>
    		<span class="menu-toggler__line"></span>
  		</label>
    <vs-sidebar parent='body' default-index="1" color="dark" class="sidebarx" spacer v-model="active">

      <div class="header-sidebar" slot="header" style='text-align:center'>
        <h3><img src="../assets/logo.png" alt="Logo" height="32" width="32">
        </h3>
      </div>
      <vs-sidebar-group :index='"1"' title="Music">

        <div @click='getRecent()'>
        <vs-sidebar-group index=1.1 title='Recently Played'>
          <div v-for='(track, index) in recentlyPlayed' :key='index'>
            <vs-sidebar-item :index='"1.1."+(index+1)'>{{track.name}}</vs-sidebar-item>
          </div>
        </vs-sidebar-group>
        </div>

        <vs-sidebar-group index=1.2 title='Your Music'>
          <vs-sidebar-group index=1.2 title='Playlists'>
            <vs-sidebar-item index=1.2.1 v-if='lessPlaylists===true' @click='getLessPlaylists()' icon='arrow_drop_up'>Previous</vs-sidebar-item>
            <div v-for='(item, index) in playlists' :key='index' style='text-align:left;font-size:.9em; font-weight: 300;'>
              <vs-sidebar-item icon='album' :index='"1.2."+(index+3)' @click='playPlaylist(item.uri)'>{{item.name}}</vs-sidebar-item>
            </div>
            <vs-sidebar-item index=1.2.99 v-if='morePlaylists===true' @click='getMorePlaylists()' icon='arrow_drop_down'>More</vs-sidebar-item>
          </vs-sidebar-group>
          <vs-sidebar-group index=1.2.2 title='Library'>
          <vs-sidebar-group title='Saved Albums'></vs-sidebar-group>
          <vs-sidebar-group title='Saved Tracks'></vs-sidebar-group>
          </vs-sidebar-group>
        </vs-sidebar-group>

        <!--<vs-sidebar-group index=1.3 title='Browse'>
          <vs-sidebar-group index=1.3.4 title='Discover'><h4>Coming Soon</h4></vs-sidebar-group>
          <vs-sidebar-group index=1.3.1 title='Categories'><h4>Coming Soon</h4></vs-sidebar-group>
          <vs-sidebar-group index=1.3.2 title='Featured Playlists'><h4>Coming Soon</h4></vs-sidebar-group>
          <vs-sidebar-group index=1.3.3 title='New Releases'><h4>Coming Soon</h4></vs-sidebar-group>
        </vs-sidebar-group>-->
      </vs-sidebar-group>
      
      <vs-sidebar-group index=2 title='Visuals'>
        <vs-sidebar-group index=2.2 title='Settings'>
          <vs-sidebar-group title='Colors'>
            <vs-sidebar-group title='Shapes'>
              <vs-sidebar-group title='Presets'>

              </vs-sidebar-group>
              <vs-sidebar-group title='Custom'>
                
              </vs-sidebar-group>
            </vs-sidebar-group>
            <vs-sidebar-group title='Background'></vs-sidebar-group>
          </vs-sidebar-group>
          <vs-sidebar-group title='Shape'></vs-sidebar-group>
          <vs-sidebar-group title='Pattern'></vs-sidebar-group>
        </vs-sidebar-group>
      </vs-sidebar-group>

      <vs-sidebar-group index=4 title='Info'>
        <vs-sidebar-item index=4.3 icon="help">
          Help
        </vs-sidebar-item>
        <vs-sidebar-item index=4.4 icon="help">
          About
        </vs-sidebar-item>
      </vs-sidebar-group>

      <div class="footer-sidebar" slot="footer">
        <vs-button icon="reply" color="danger" type="flat" @click='logout()'>Logout</vs-button>
        <vs-button icon="keyboard_arrow_left" color="primary" type="border" @click='active=!active'></vs-button>
      </div>

    </vs-sidebar>
		<!--<aside class="sidebar">
      <div class='sidebar-content'>
        <h3>Spotilize</h3>
        <span class="sidebar_line"></span>
        <br>
        <ul>
          <li>
            <b-btn :variant="'link'" @click="toggle('music')">Music</b-btn>
            <ul class='submenu' :class='{show: music}'>
              <li>Coming Soon</li>
            </ul>
          </li>
          <li>
            <b-btn :variant="'link'" @click="toggle('visualizations')">Visualizations</b-btn>
            <ul class='submenu' :class='{show: visualizations}'>
              <li>Coming Soon</li>
            </ul>
          </li>
          <li>
            <b-btn :variant="'link'" @click="toggle('settings')">Settings</b-btn>
            <ul class='submenu' :class='{show: settings}'>
              <li>Coming Soon</li>
            </ul>
          </li>
          <li><b-btn :variant="'link'">About</b-btn></li>
    		  <li><b-btn :variant="'link'" @click='logout()'>Logout</b-btn></li>
        </ul>
      </div>
		</aside>-->
	</div>
</template>

<script>
import SpotifyService from '@/services/SpotifyService';
export default {
  name: 'Menu',
  data() {
    return {
      music: false,
      visualizations: false,
      settings: false,
      active: false,
      playlists:[],
      playlistOffset: 0,
      morePlaylists: true,
      lessPlaylists: false,
      playlistId: null,
      tracks:[],
      trackOffset: 0,
      moreTracks: true,
      lessTracks: false,
      recentlyPlayed: [],
    }
  },
  created() {
    this.getPlaylists();
  },
  methods: {
    logout() {
      this.active = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      this.$router.replace({name: 'home'});
     /*var data = {
				type: "close",
			}
      window.postMessage(data, "*");*/
    },
    async getPlaylists() {
      const response = await SpotifyService.getPlaylists(localStorage.access_token, this.playlistOffset);
      if(response.data.success === true) {
          for(let i = 0; i < response.data.playlists.items.length; i++) {
            this.playlists.push(response.data.playlists.items[i])
          }
          if(response.data.playlists.next !== null) {
            this.morePlaylists = true;
          } else {
            this.morePlaylists = false;
          }
      }
      if(this.playlistOffset !== 0) {
        this.lessPlaylists = true;
      }
    },
    async playPlaylist(uri){
      await SpotifyService.playPlaylist(localStorage.access_token, uri);
    },
    async getRecent() {
      const response = await SpotifyService.getRecentlyPlayed(localStorage.access_token);
      if(response.data.success === true) {
        console.log('success');
        this.recentlyPlayed = [];
        for(let i = 0; i < response.data.items.items.length; i++) {
          this.recentlyPlayed.push(response.data.items.items[i].track);
        }
      }
    },
    async getPlaylistTracks(id) {
      this.tracks = [];
      if(id !== this.playlistId) {
        this.trackOffset = 0;
        this.playlistId = id;
      }
      const response = await SpotifyService.getPlaylistTracks(localStorage.access_token, id, this.trackOffset);
      if(response.data.success === true) {
        for(let i = 0; i < response.data.tracks.items.length; i++) {
          this.tracks.push(response.data.tracks.items[i]);
        }
        if(response.data.tracks.next !== null) {
          this.moreTracks = true;
        } else {
          this.moreTracks = false;
        }
      }
      if(this.trackOffset !== 0) {
        this.lessTracks = true;
      }
    },
    getMoreTracks() {
      this.trackOffset += 20;
      this.getPlaylistTracks(this.playlistId);
    },
    getLessTracks(){
      this.trackOffset -= 20;
      if(this.trackOffset <= 0) {
        this.trackOffset = 0;
        this.lessTracks = false;
      }
      this.getPlaylistTracks(this.playlistId);
    },
    getMorePlaylists() {
      this.playlists = [];
      this.playlistOffset += 5;
      this.getPlaylists();
    },
    getLessPlaylists() {
      this.playlists = [];
      this.playlistOffset -= 5;
      if(this.playlistOffset <= 0) {
        this.playlistOffset = 0;
        this.lessPlaylists = false;
      }
      this.getPlaylists();
    }
  }
}
</script>

<style scoped>

:root {
  --sidebar-width: 300px;
  --toggler-size: 35px;
}
.sidebarx {
  font-family: 'Nunito', sans-serif;
}

.header-sidebar {
  display: inline-flex;
  align-items: left;
  justify-content: left;
  flex-direction: column;
  width: 100%;
}
.header-sidebar h4 {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.header-sidebar h4 > button {
  margin-left: 10px;
}
.footer-sidebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.footer-sidebar > button {
  border: 0px solid rgba(0,0,0,0) !important;
  border-left: 1px solid rgba(0,0,0,0.07) !important;
  border-radius: 0px !important;
}


/*.input-toggler:checked ~ .sidebar {
  transform: translateX(0);
  background-position: 0 0;
}*/

.menu-toggler {
  display: block;
  width: 35px;
  height: 35px;
  position: fixed;
  top: 20px;
  left: 20px;
  cursor: pointer;
  z-index: 1;
}

.menu-toggler__line {
  height: calc(35px / 5);
  background: white;
  position: absolute;
  left: 0;
  right: 0;
  transition-property: transform, opacity;
  transition-duration: .5s, .25s;
  transition-delay: 0s, .5s;
  animation-name: slidein;
  animation-duration: .2s;
  animation-iteration-count:1;
  animation-timing-function: ease-in-out;
}

/*.input-toggler:checked ~ .menu-toggler .menu-toggler__line {
  transition-delay: .25s, 0s;
}*/

.menu-toggler__line:nth-child(2) {
  top: calc(35px / 5 * 2);
animation-duration: .3s;
}

.menu-toggler__line:nth-child(3) {
  top: calc(35px / 5 * 4);
  animation-duration:.4s;
}

.input-toggler {
  display: none;
}

/*.input-toggler:checked ~ .menu-toggler .menu-toggler__line {
  background: white;
}

.input-toggler:checked ~ .menu-toggler .menu-toggler__line:nth-child(1) {
  transform: translateX(260px) translateY(calc(10px / 5 * 2)) rotate(-45deg);
}

.input-toggler:checked ~ .menu-toggler .menu-toggler__line:nth-child(2) {
  opacity: 0;
}

.input-toggler:checked ~ .menu-toggler .menu-toggler__line:nth-child(3) {
  transform:  translateX(260px) translateY(calc(10px / 5 * -2)) rotate(45deg);
}*/

.input-toggler:hover{
    opacity:1;
}

@keyframes slidein {
  from {left: -200%; right:200%;}
  to {left: 0; right: 0;}
}
</style>