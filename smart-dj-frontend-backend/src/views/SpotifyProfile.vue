<template>
	<div>
		<h1>Spotify {{type}} User</h1>
		<hr style='width:35%'>
		<h2 style='display:inline;margin-right:10px;'>{{name}}</h2><small><p style='display:inline'> Followers: {{followers}}</p></small>
		<h3>Birthday: {{birthday}}</h3>
		<div v-if='curr_playing===true'>
			<h3>Currently Listening To: </h3>
			<b>{{artist}}</b><br>
			<b>{{track}}</b>
		</div>
		<div v-if='top_artists===true'>
			<h3>Top 20 Artists: </h3>
			<ul v-for='(artist) in artists' :key='artist'>
				<li>{{artist}}</li>
			</ul>
		</div>
		<br>
		<a href='' target="_blank" rel="noopener">{{email}}</a><br>
		<a :href='url' target="_blank" rel="noopener">{{url}}</a><br>
		<ul style='margin-top:20px'>
			<li class='button'><button @click='currentlyPlaying'>Get Currently Playing Track</button></li>
			<li class='button'><button @click='topArtists'>Get Top Artists</button></li>
			<li class='button'><button @click='player'>Start Web Player</button></li>
			<br><br>
			<li class='button'><button @click='prev'>Previous Track</button></li>
			<li class='button'><button @click='next'>Next Track</button></li>
		</ul>
		<md-button class="md-raised md-primary" @click='logout()'>Log Out</md-button>
	</div>
</template>

<script>
 /* eslint-disable */
import SpotifyService from '@/services/SpotifyService';
import UserService from '@/services/UserService'

export default {
	name: 'Profile',
	data() {
		return {
			curr_playing: false,
			artist: '',
			track: '',
			album: '',
			top_artists: false,
			artists: [],
			name: '',
			birthday: '',
			email: '',
			url: '',
			followers: '',
			type: ''
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			if(localStorage.username) {
				vm.refreshToken();
				vm.getProfile();
				next();
			} else {
				next('/signin');
			}
		});
	},
	methods: {
		async getProfile() {
			const response = await SpotifyService.getProfile();
			this.name = response.data.name;
			this.birthday = response.data.birthday;
			this.email = response.data.email;
			this.url = response.data.url;
			this.followers = response.data.followers;
			this.type = response.data.type;
			this.type = this.type.charAt(0).toUpperCase() + this.type.slice(1);
			console.log('get Profile ran');
		},
		async currentlyPlaying() {
			const response = await SpotifyService.getCurrentlyPlaying();
			if(this.top_artists) {
				this.top_artists = false;
			}
			this.curr_playing = true;
			if(response.data.is_playing === false) {
				this.artist = 'User is not playing anything right now';
				this.track = '';
			} else {
				this.artist = response.data.item.album.artists[0].name;
				this.album = response.data.item.album.name;
				this.track = this.album + " | "+ response.data.item.name;
			}
		},
		async topArtists() {
			this.artists = [];
			const response = await SpotifyService.getTopArtists();
			if(this.curr_playing) {
				this.curr_playing = false;
			}
			this.top_artists = true;
			if(response.data.is_playing !== null) {
				for(var i = 0; i < 20; i++) {
					this.artists.push(response.data.artists[i].name);
				}
			}
		},
		async next() {
			await SpotifyService.nextTrack();
		},
		async prev() {
			await SpotifyService.previousTrack();
		},
		async player() {
			const response = await SpotifyService.startPlayer();
			//console.log(response.data.message);
		},
		logout() {
			localStorage.removeItem('username');
			this.$router.push({name: 'signin'});
		},
		async refreshToken() {
			const userResponse = await UserService.getUser(localStorage.username);
      const spotifyResponse = await SpotifyService.refreshAccessToken({
        access_token: userResponse.data.user.access_token,
        refresh_token: userResponse.data.user.refresh_token
      });
    }
	}
}
</script>

<style>
ul {
  list-style-type: none;
  padding: 0;
}
.button {
  display: inline-block;
  margin: 0 10px;
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
a {
  color: #42b983;
}
</style>
