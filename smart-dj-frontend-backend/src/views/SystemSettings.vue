<template>
	<div>
		<v-wait for='api'>
			<template slot="waiting">
        			<img src='@/assets/5.gif' style='position: absolute;top: 50%;left: 50%;margin-right:-50%;transform: translate(-50%, -50%)'/>
    		</template>
    		<md-app>
      		<md-app-toolbar class='md-primary' style='background-color:#42b983'>
        			<span class="md-title" style='color:white'>{{title}}</span>
      		</md-app-toolbar>

      		<md-app-drawer md-permanent="full">
        			<md-toolbar class="md-transparent" md-elevation="0">
          			Settings
        			</md-toolbar>

        			<md-list>
          			<md-list-item>
            			<b-button :variant="'link'" class="md-list-item-text" @click="setActive('spotify')">Spotify</b-button>
          			</md-list-item>

						<md-list-item>
							<b-button :variant="'link'" class='md-list-item-text' @click="setActive('users')">Users</b-button>
						</md-list-item>

						<md-list-item>
							<b-button :variant="'link'" class='md-list-item-text' @click="setActive('other')">Other Settings</b-button>
						</md-list-item>
        			</md-list>
     			</md-app-drawer>

      		<md-app-content>

					<div v-if='onSpotify===true'>
						<b-container fluid>
							<b-row>
								<b-col style='text-align:left'>
									<h2 class='md-title'>Primary Spotify Account</h2>
									<div class='md-subhead' style='overflow-wrap:break-word'>This is the account that will be used for music streaming</div>
								</b-col>
								<b-col>
									<div v-if='tokenExists===true'>
										<md-card class='spotifyCard'>
      									<md-card-header>
        										<md-card-header-text>
          										<div class="md-title">{{primary_user}}</div>
          										<div class="md-subhead">{{primary_type}}</div>
        										</md-card-header-text>

        										<md-card-media>
          										<img src="@/assets/spotifyLogo.png" alt="Spotify">
        										</md-card-media>
      									</md-card-header>

      									<md-card-actions>
        										<md-button @click='deleteToken()'>Unlink</md-button>
        										<md-button v-b-modal.account-select>Change Accounts</md-button>
      									</md-card-actions>
    									</md-card>
									</div>

									<div v-if='tokenExists===false'>
										<md-card class='spotifyCard'>
      									<md-card-header>
        										<md-card-header-text>
          										<div class="md-title">No Primary Account</div>
          										<div class="md-subhead">Select or link a new account</div>
        										</md-card-header-text>

        										<md-card-media>
          										<img src="@/assets/spotifyLogo.png" alt="Spotify">
        										</md-card-media>
      									</md-card-header>

      									<md-card-actions>
        										<md-button @click='linkAccount()'>Link Account</md-button>
        										<md-button v-b-modal.account-select>Select Account</md-button>
      									</md-card-actions>
    									</md-card>
									</div>
								</b-col>
							</b-row>
							<hr>
							<b-row>
								<b-col style='text-align:left;'>
									<h2 class='md-title'>Playback</h2>
									<div class='md-subhead' style='overflow-wrap:break-word'>Control the playback of the current Primary Account</div>
								</b-col>
        						<b-col style='text-align:right'>
									<span>Current Active Device:</span>
									<br>
									<div v-for='device in primaryDevices' :key='device.name'>
										<span v-if='device.is_active'>{{device.name}}</span>
									</div>
									<b-button class='playbackControls' @click='player'>Start Web Player</b-button>
								</b-col>
        					<div class="w-100"></div>
        						<b-col style='text-align:left'>
							  		<div style='color:green'>
										<p>Currently Playing:</p>
										<p style='margin-top:-5px;'>{{track}}<br>{{artist}}</p>
							  		</div>
									<b-button-toolbar style='margin-left:-5px;' aria-label="Toolbar with button groups">
										<b-button-group size="lg" class="mx-1">
											<b-btn @click='prev' class='invertedPlaybackControls'><font-awesome-icon icon='step-backward' /></b-btn>
										</b-button-group>
										<b-button-group size="lg" class="mx-1">
											<b-btn v-if='paused===true' @click='play()' class='invertedPlaybackControls' style='border-radius:50%;'><font-awesome-icon icon='play' /></b-btn>
											<b-btn v-else-if='paused===false' @click='pause()' class='playbackControls' style='border-radius:50%;'><font-awesome-icon icon='pause'/></b-btn>
										</b-button-group>
										<b-button-group size="lg" class="mx-1">
											<b-btn @click='next' class='invertedPlaybackControls'><font-awesome-icon icon='step-forward' /></b-btn>
										</b-button-group>
									</b-button-toolbar>
								</b-col>
								<b-col>
									
								</b-col>
							</b-row>
						</b-container>
					</div>

      			<div v-if='onUsers===true'>
						<md-table v-model="users" md-card md-sort="username" md-sort-order="asc" md-fixed-header>
							<md-table-row slot="md-table-row" slot-scope="{ item }">
        						<md-table-cell md-label="Username" md-sort-by="username" style='text-align:left'>{{item.username}}</md-table-cell>
								<md-table-cell md-label="Email" md-sort-by="email" style='text-align:left'>{{item.email}}</md-table-cell>
        						<md-table-cell md-label="Spotify Type" md-sort-by="spotify_type" style='text-align:left'>{{item.spotify_type}}</md-table-cell>
        						<md-table-cell md-label="System Role" style='text-align:left'>System Role Here</md-table-cell>
								<md-table-cell md-label="Profile" style='text-align:left'>
									<md-button @click='goToUser(item.username)' class="md-icon-button">
										<font-awesome-icon icon='user'/>
									</md-button>
								</md-table-cell>
        						<md-table-cell md-label="Delete" style='text-align:left'>
									<md-button @click='deleteUser(item._id)' class="md-icon-button">
										<font-awesome-icon icon='trash'/>
									</md-button>
								</md-table-cell>
      					</md-table-row>
    					</md-table>
       			</div>
     			</md-app-content>
    		</md-app>
		</v-wait>
		<b-modal id='account-select' title='Select an Account' hide-footer centered lazy>
			<md-table v-model="users" md-sort="username" md-sort-order="asc" @md-selected='changeActiveToken'>
      		<md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
        			<md-table-cell md-label="Name" md-sort-by="username" style='text-align:left'>{{ item.username }}</md-table-cell>
        			<md-table-cell md-label="Account Type" md-sort-by="spotify_type" style='text-align:left'>{{ item.spotify_type }}</md-table-cell>
					<md-table-cell md-label="Active" style='text-align:center;color:green;width:10px'>
						<font-awesome-icon v-if='item.access_token === access_token' icon='check'/>
					</md-table-cell>
      		</md-table-row>
    		</md-table>
		</b-modal>
	</div>
</template>

<script>
import UserService from '@/services/UserService';
import SpotifyService from '@/services/SpotifyService';

export default {
	name: 'SystemSettings',
	data() {
		return {
			onUsers: false,
			onOtherSettings: false,
			onSpotify: true,
			title: 'Spotify',
			users: [],
			access_token: '',
			primary_user: '',
			primary_type: '',
			tokenExists: false,
			authWindow: Window,
			artist: '',
			album: '',
			track: '',
			paused: true,
			primaryDevices: [],
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
	created() {
		this.authWindow = window;
		var self = this;
		this.authWindow.checkTempToken = function() {
			self.checkTempToken();
		}
		this.getPrimaryAccount();
		this.getCurrentlyPlaying();
		this.getPrimaryDevices();
		this.getUsers();
		setInterval(() => {
			this.getPrimaryAccount();
		}, 900000);
	},
	sockets: {
		stateChanged: function (state) {
			this.track = state.track_window.current_track.name;
			this.artist = state.track_window.current_track.artists[0].name;
			this.album = state.track_window.current_track.album.name;
			this.artist = this.artist + " | " + this.album;
			console.log(state.paused);
			this.paused = state.paused;
			this.getPrimaryDevices();
		}
	},
	methods: {
		setActive(fieldName) {
			 switch(fieldName) {
				 case 'spotify':
				 	this.onSpotify = true;
					this.onUsers = false;
					this.onOtherSettings = false;
					this.title = 'Spotify';
					break;
				case 'users':
					this.getUsers();
				 	this.onSpotify = false;
					this.onUsers = true;
					this.onOtherSettings = false;
					this.title = 'Users';
					break;
				case 'other':
					this.onSpotify = false;
					this.onUsers = false;
					this.onOtherSettings = true;
					this.title = 'Other Settings'
					break;
				}
			},
		goToUser(username) {
			 this.$router.push({name: 'account', params: {username: username}});
		},
		async linkAccount() {
			this.$wait.start('api');
			await SpotifyService.deleteTempAccessToken();
			const loginResponse = await SpotifyService.login();
			this.$wait.end('api');
			var url = (loginResponse.data.redirect);
			this.authWindow.open(url, '_blank', "height=500,width=500,toolbar=no,menubar=no,scrollbars=no,location=no,status=no left=300 top=200");
		},
		async checkTempToken() {
			this.$wait.start('api');
			const response = await SpotifyService.checkTempAccessToken();
			this.$wait.end('api');
      	if(response.data.success === true) {
				this.$wait.start('api');
				const tokenUpdate = await SpotifyService.updatePrimaryToken({
						access_token: response.data.access_token,
						refresh_token: response.data.refresh_token
				});
				this.$wait.end('api');
				if(tokenUpdate.data.success === true) {
					this.getPrimaryAccount();
				} else {
					alert("Oops! Something went wrong linking your Spotify Account");
				}
			} 
			else {
				alert("Oops! Something went wront linking your Spotify Account");
			}
		},
		async changeActiveToken(item) {
			this.$wait.start('api');
			const response = await SpotifyService.updatePrimaryToken({
				 access_token: item.access_token,
				 refresh_token: item.refresh_token
			 });
			 this.$wait.end('api');
			 if(response.data.success === false) {
				 alert("something went wrong changing the primary token");
			 } else {
				 this.getPrimaryAccount();
			 }
		 },
		 async getUsers() {
			 this.$wait.start('api');
			 const response = await UserService.fetchUsers();
			 this.$wait.end('api');
			 if(response.data.success === true) {
				 this.users = response.data.users;
			 } else {
				 alert("Error fetching users");
			 }
		 },
		 async deleteToken() {
			 this.$wait.start('api');
			 const response = await SpotifyService.deletePrimaryAccessToken();
			 this.$wait.end('api');
			 if(response.data.success === true)
			 	this.tokenExists = false;
		 },
		 async deleteUser(id) {
			 this.$wait.start('api');
			 const response = await UserService.deleteUser(id);
			 this.$wait.end('api');
			 if(response.data.success === true)
			 	this.getUsers();
		 },
		 async getPrimaryAccount() {
			 this.$wait.start('api');
			 const response = await SpotifyService.getPrimaryToken();
			 this.$wait.end('api');
			 if(response.data.success === true) {
				 this.access_token = response.data.access_token;
				 const profileResponse = await SpotifyService.getUserProfile(this.access_token);
				 this.primary_user = profileResponse.data.name;
				 this.primary_type = profileResponse.data.type;
				 this.primary_type = this.primary_type.charAt(0).toUpperCase() + this.primary_type.slice(1);
				 this.tokenExists = true;
			 } else {
				 this.tokenExists = false;
				 console.log('Could not get primary token');
			 }
		 },
		async play() {
			const response = await SpotifyService.playPrimary();
			if(response.success === true)
				this.paused = false;
		},
		async pause() {
			const response = await SpotifyService.pausePrimary();
			if(reponse.success === true)
				this.paused = true;
		},
		async next() {
			await SpotifyService.nextPrimaryTrack();
			var self = this;
			setTimeout(() => {
				self.getCurrentlyPlaying();
			}, 250); 
		},
		async prev() {
			await SpotifyService.previousPrimaryTrack();
			var self = this;
			setTimeout(() => {
				self.getCurrentlyPlaying();
			}, 250); 
		},
		async player() {
			await SpotifyService.startPlayer();
			var self = this;
			setTimeout(() => {
				self.getCurrentlyPlaying();
			}, 2000); 
		},
		async getCurrentlyPlaying() {
			const response = await SpotifyService.getPrimaryCurrentlyPlaying();
			if(response.data.is_playing === false) {
				this.artist = '';
				this.track = '';
				this.paused = true;
			} else if(response.data.is_playing === true){
				this.album = response.data.object.item.album.name;
				this.artist = response.data.object.item.album.artists[0].name +" | "+this.album;
				this.track = response.data.object.item.name;
				this.paused = false;
			} else {
				this.artist = '',
				this.track ='',
				this.paused = true;
			}
		},
		async getPrimaryDevices() {
			const response = await SpotifyService.getPrimaryDevices();
			if(response.data.success) {
				this.primaryDevices = response.data.devices;
				console.log(this.primaryDevices);
			}
		}
	}
}
</script>

<style scoped>
  .md-app {
    border: 1px solid rgba(#000, .12);
		margin-right:20px;
		margin-left:20px;
  }
  .md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
  }
	.btn{
		color: #42b983;
	}
	.md-label {
		text-align:center;
	}
	.md-table-head-container {
		max-height:10px;
		text-align:center;
	}
	.md-table-row:hover .md-table-cell {
		background-color: #bdf3db
	}
	.spotifyCard {
		text-align:left;
    margin: 10px;
		float:right;
  }
	.md-table-head-label{
		text-align:center;
	}
	.active {
		background-color: #bdf3db
	}
	.playbackControls{
		color:white;
		background-color:#42b983;
		border:#42b983;
		margin-top:10px;
	}
	.invertedPlaybackControls {
		color: #42b983;
		background-color:white;
		border:white;
		margin-top:10px;
	}
</style>
