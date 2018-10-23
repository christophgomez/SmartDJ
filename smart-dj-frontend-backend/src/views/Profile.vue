<template>
	<div>
		<h1>Spotify {{type}} User</h1>
		<hr style='width:35%'>
		<h2 style='display:inline;margin-right:10px;'>{{name}}</h2><small><p style='display:inline'> Followers: {{followers}}</p></small>
		<h3>Birthday: {{birthday}}</h3>
		<div v-if='curr_playing===true'>
			<h3>Currently Listening To: </h3>
			<b>{{artist}}</b><br>
			<b>{{album}} | {{track}}</b>
		</div>
		<div v-if='top_artists ===true'>
			<h3>Top 20 Artists: </h3>
			<ul v-for='(artist) in artists' :key='artist'>
				<li>{{artist}}</li>
			</ul>
		</div>
		<br>
		<a href='' target="_blank" rel="noopener">{{email}}</a><br>
		<a :href='url' target="_blank" rel="noopener">{{url}}</a><br>
		<ul>
			<li class='button'><a href='' @click.prevent='currentlyPlaying'>Get Currently Playing Track</a></li>
			<li class='button'><a href='' @click.prevent='topArtists'>Get Top Artists</a></li>
		</ul>
	</div>
</template>

<script>
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
			artists: []
		}
	},
	props: {
		name: String,
		birthday: String,
		email: String,
		url: String,
		followers: Number,
		type: String
	},
	mounted() {
		var tmp = this.type.charAt(0).toUpperCase() + this.type.slice(1);
		this.type = tmp;
	},
	methods: {
		async currentlyPlaying() {
			const response = await SpotifyService.getCurrentlyPlaying();
			if(this.top_artists) {
				this.top_artists = false;
			}
			this.curr_playing = true;
			if(response.data.is_playing === false) {
				this.artist = 'User is not playing anything right now';
			} else {
				this.artist = response.data.item.album.artists[0].name;
				this.album = response.data.item.album.name;
				this.track = response.data.item.name;
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
a {
  color: #42b983;
	margin-top:20px;
}
</style>
