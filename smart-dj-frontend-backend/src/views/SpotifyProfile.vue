<template>
	<div>
		<v-wait for='User Information'>
			<template slot="waiting">
        			<img src='@/assets/5.gif' style='position: absolute;top: 50%;left: 50%;margin-right:-50%;transform: translate(-50%, -50%)'/>
    		</template>
			<h1>Spotify {{type}} User</h1>
			<hr style='width:35%'>
			<h2 style='display:inline;margin-right:10px;'>{{name}}</h2><small><p style='display:inline'> Followers: {{followers}}</p></small>
			<h3>Birthday: {{birthday}}</h3>
			<div v-if='onCurrPlaying===true'>
				<br>
				<h3>Currently Listening To: </h3>
				<b>{{artist}}</b><br>
				<b>{{track}}</b>
			</div>
			<div v-if='onTopArtists===true'>
				<br>
				<h3>Top 20 Artists: </h3>
				<ul v-for='(artist) in artists' :key='artist'>
					<li>{{artist}}</li>
				</ul>
			</div>
			<div v-if='onDevices===true'>
				<br>
				<h3>{{deviceTitle}}</h3>
				<p v-if="deviceTitle==='No Available Devices'">All devices must be off</p>
				<ul v-for='device in devices' :key='device.name'>
					<li>Device Name: {{device.name}}</li>
					<li>Device ID: {{device.id}}</li>
					<li>Type: {{device.type}}</li>
					<li>Active: {{device.is_active}}</li>
					<li>Private Session: {{device.is_private_session}}</li>
					<li>Volume: {{device.volume_percent}}</li>
				</ul>
			</div>
			<br>
			<a href='' target="_blank" rel="noopener">{{email}}</a><br>
			<a :href='url' target="_blank" rel="noopener">{{url}}</a><br>
			<ul style='margin-top:20px'>
				<li class='button'><b-button @click='currentlyPlaying()'>Get Currently Playing Track</b-button></li>
				<li class='button'><b-button @click='getTopArtists()'>Get Top Artists</b-button></li>
				<li class='button'><b-btn @click='getDevices()'>Get Devices</b-btn></li>
				<li class='button'><b-btn>Get Current Track Info</b-btn></li>
				<br>
				<br>
				<li class='button'><b-button @click='player()'>Start Web Player</b-button></li>
				<br>
				<br>
				<li class='button'><b-button @click='prev()'>Previous Track</b-button></li>
				<li class='button'><b-button @click='next()'>Next Track</b-button></li>
			</ul>
			<md-button class="md-raised md-primary" @click='logout()'>Log Out</md-button>
		</v-wait>
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
			onCurrPlaying: false,
			onTopArtists: false,
			onDevices: false,
			artist: '',
			track: '',
			album: '',
			artists: [],
			name: '',
			birthday: '',
			email: '',
			url: '',
			followers: '',
			type: '',
			access_token: '',
			devices: [],
			deviceTitle: 'Available Devices'
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			if(localStorage.jwtToken) {
				next();
			} else {
				next('/signin');
			}
		});
	},
	created(){
		this.getProfile();
		setInterval(async () => {
			const tokenResponse = await UserService.getUser(this.$route.params.username);
			this.access_token = tokenResponse.data.user.access_token;
		}, 900000);
	},
	methods: {
		async getProfile() {
			this.$wait.start('User Information');
			const userResponse = await UserService.getUser(this.$route.params.username);
			this.access_token = userResponse.data.user.access_token;
			console.log('getting profile');
			const response = await SpotifyService.getUserProfile(this.access_token);
			this.name = response.data.name;
			this.birthday = response.data.birthday;
			this.email = response.data.email;
			this.url = response.data.url;
			this.followers = response.data.followerTotal;
			this.type = response.data.type;
			this.type = this.type.charAt(0).toUpperCase() + this.type.slice(1);
			this.$wait.end('User Information');
		},
		async currentlyPlaying() {
			this.onTopArtists = false;
			this.onDevices = false;
			const response = await SpotifyService.getUserCurrentlyPlaying(this.access_token);
			this.onCurrPlaying = true;
			if(response.data.is_playing === false) {
				this.artist = 'User is not playing anything right now';
				this.track = '';
			} else {
				this.album = response.data.object.item.album.name;
				this.artist = response.data.object.item.album.artists[0].name +" | "+this.album;
				this.track = response.data.object.item.name;
			}
		},
		async getTopArtists() {
			this.onCurrPlaying = false;
			this.onDevices = false;
			const response = await SpotifyService.getUserTopArtists(this.access_token);
			this.onTopArtists = true;
			if(response.data.success === true) {
				for(var i = 0; i < 20; i++) {
					this.artists.push(response.data.artists[i].name);
				}
			}
		},
		async getDevices() {
			this.onCurrPlaying = false;
			this.onTopArtists = false;
			const response = await SpotifyService.getUserDevices(this.access_token);
			this.onDevices = true;
			if(response.data.success == true) {
				this.devices = response.data.devices;
				this.deviceTitle = "Available Devices"
				if(this.devices[0] === undefined) {
					this.deviceTitle = 'No Available Devices';
				}
			}
		},
		async next() {
			await SpotifyService.nextUserTrack({
				access_token: this.access_token
			});
		},
		async prev() {
			await SpotifyService.previousUserTrack({
				access_token: this.access_token
			});
		},
		async player() {
			const response = await SpotifyService.startPlayer();
		},
		logout() {
			localStorage.removeItem('jwtToken');
			this.$router.push({name: 'signin'});
		},
		async refreshTempToken() {
			this.$wait.start('User Information');
			const userResponse = await UserService.getUser(this.$route.params.username);
			const spotifyResponse = await SpotifyService.refreshTempAccessToken({
        		access_token: userResponse.data.user.access_token,
        		refresh_token: userResponse.data.user.refresh_token
			});
			const updateResponse = await UserService.updateToken(this.$route.params.username, {
				access_token: spotifyResponse.data.access_token,
				refresh_token: spotifyResponse.data.refresh_token
			});
			this.getProfile();
			this.$wait.end('User Information');
    	}
	}
}
</script>

<style scoped>
#cent {
  position:absolute;
  top:50%;
  left:50%;
  margin-top:-50px; /* this is half the height of your div*/  
  margin-left:-100px; /*this is half of width of your div*/
}
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
}
</style>
