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
		<ul>
			<li class='button'><button @click='currentlyPlaying'>Get Currently Playing Track</button></li>
			<li class='button'><button @click='topArtists'>Get Top Artists</button></li>
			<li class='button'><button @click='player'>Start Web Player</button></li>
		</ul>
	</div>
</template>

<script>
 /* eslint-disable */
import SpotifyService from '@/services/SpotifyService';
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
	created() {
		this.getProfile();
	},
	mounted() {
		var tmp = this.type.charAt(0).toUpperCase() + this.type.slice(1);
		this.type = tmp;
	},
	methods: {
		async getProfile() {
			const response = await SpotifyService.getProfile();
			if(response.status === 200) {
				this.name = response.body.name;
				this.birthday = response.body.birthday;
				this.email = response.body.email;
				this.url = response.body.url;
				this.followers = response.body.followers;
				this.type = response.body.type;
			} else {
				console.log("Errror: "+response.error);
			}
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
		async player() {
			const response = await SpotifyService.startPlayer();
			console.log(response.data.message);
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
	margin-top:20px;
}
</style>
