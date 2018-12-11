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
							<b-btn :variant="'link'" class='md-list-item-text' @click="setActive('analytics')">Analytics</b-btn>
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
									<br>
									<span>Kinect Status: {{kinectStatus}}</span>
									<br>
									<b-button class='playbackControls' @click='player()'>Start Web Player</b-button>
									<br>
									<b-button class='playbackControls' @click='startKinect()'>Start Kinect</b-button>
								</b-col>
        					<div class="w-100"></div>
        						<b-col style='text-align:left'>
							  		<div style='color:green'>
										<p>Currently Playing:</p>
										<p style='margin-top:-5px;'>{{track}}<br>{{artist}}</p>
							  		</div>
									<b-button-toolbar style='margin-left:-5px;' aria-label="Toolbar with button groups">
										<b-button-group size="lg" class="mx-1">
											<b-btn v-if='repeatToggle===1' @click='toggleRepeat()' class='invertedPlaybackControls'><font-awesome-icon icon='redo'/></b-btn>
											<b-btn v-if='repeatToggle===2' @click='toggleRepeat()' class='halfPlaybackControls'><font-awesome-icon icon='redo'/></b-btn>
											<b-btn v-if='repeatToggle===3' @click='toggleRepeat()' class='playbackControls'><font-awesome-icon icon='redo'/></b-btn>
											<b-btn @click='prev' class='invertedPlaybackControls'><font-awesome-icon icon='step-backward' /></b-btn>
										</b-button-group>
										<b-button-group size="lg" class="mx-1">
											<b-btn v-if='paused===true' @click='play()' class='invertedPlaybackControls' style='border-radius:50%;'><font-awesome-icon icon='play' /></b-btn>
											<b-btn v-else-if='paused===false' @click='pause()' class='playbackControls' style='border-radius:50%;'><font-awesome-icon icon='pause'/></b-btn>
										</b-button-group>
										<b-button-group size="lg" class="mx-1">
											<b-btn @click='next' class='invertedPlaybackControls'><font-awesome-icon icon='step-forward' /></b-btn>
											<b-btn v-if='shuffle===false' @click='toggleShuffle()' class='invertedPlaybackControls'><font-awesome-icon icon='random'/></b-btn>
											<b-btn v-if='shuffle===true' class='playbackControls' @click='toggleShuffle()'><font-awesome-icon icon='random'/></b-btn>
										</b-button-group>
									</b-button-toolbar>
									<br>
									<font-awesome-icon icon='volume-down' size='2x'/><input class='slider' style='width:50%; margin-left:10px;margin-right:10px;' type="range" v-model.number='volume' min="0" max="100" @change='setVolume(volume)'><font-awesome-icon icon='volume-up' size='2x'/>
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

					 <div v-if='onAnalytics === true'>
						 <div v-if='analyticsLoaded'>
						 	Total Amount of Requests: {{analyticsCount}}
						 	<hr>
							 <p style='text-align:left'>Requests per {{lineType}}</p>
							 <GChart type='LineChart' :data="lineData" :options="lineOptions"/>
							 <b-button-toolbar aria-label="Toolbar with button groups">
							 	<b-button-group class='mx-1'>
								 	<b-btn @click='getLineAllRequestsByYear()' class='playbackControls'>Year</b-btn>
									<b-btn @click='getLineAllRequestsByMonth()' class='playbackControls'>Month</b-btn> 
								 	<b-btn @click='getLineAllRequestsByCurrentWeek()' class='playbackControls'>Week</b-btn>
									 <b-btn @click='getLineAllRequestsByCurrentDay()' class='playbackControls'>Day</b-btn>
								 </b-button-group>
							 </b-button-toolbar>
							 <hr>
							 <p style='text-align:left'>Total Requests per Endpoint</p>
							 <GChart type="ColumnChart" :data="barData" :options="barOptions"/>
							 <hr>
							 <p style='text-align:left'>Request Origin Breakdown</p>
							 <GChart type='PieChart' :data="pieData" :options="pieOptions"/>
							 <hr>
							 <p style='text-align:left'>Execution Time per Request</p>
							 <GChart type='ScatterChart' :data="timeData" :options="timeOptions" :settings="{ packages: ['scatter'] }"/>
							 <hr>
							 <p style='text-align:left'>Listening Sessions</p>
							 <GChart type='Timeline' :data="sessionData" :options="sessionOptions" :settings="{ packages: ['timeline'] }"/>
						 </div>
					 </div>
     			</md-app-content>
    		</md-app>
		
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
		</v-wait>
	</div>
</template>

<script>
import UserService from '@/services/UserService';
import SpotifyService from '@/services/SpotifyService';
import AnalyticsService from '@/services/AnalyticsService';

export default {
	name: 'SystemSettings',
	data() {
		return {
			onUsers: false,
			onOtherSettings: false,
			onSpotify: true,
			onAnalytics: false,
			analyticsLoaded: false,
			analyticsCount: Number,
			kinectStatus: 'Offline',
			barOptions: {
				animation: {
    				duration: 1000,
    				easing: "out"
				},
				colors: ['#42b983', '#b95242'],
			},
			barData:[],
			pieOptions: {
				animation: {
    				duration: 1000,
    				easing: "out"
				},
				colors: ['#42b983', '#b95242', '#1976D2'],
			},
			pieData: [],
			lineData:[],
			lineType:'Month',
			lineOptions: {
				animation: {
    				duration: 1000,
    				easing: "out"
				},
				colors: ['#42b983', '#b95242'],
			},
			timeData: [],
			timeOptions: {
				
				animation: {
    				duration: 1000,
    				easing: "out"
				},
				colors: ['#42b983'],
				height: 350,
			},
			sessionData: [],
			sessionOptions: {
				animation: {
    				duration: 1000,
    				easing: "out"
				},
				colors: ['#42b983'],
				height: 350,
			},
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
			shuffle: false,
			repeatToggle: 1,
			volume: 100,
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
		this.$wait.start('api');
		this.authWindow = window;
		var self = this;
		this.authWindow.checkTempToken = function() {
			self.checkTempToken();
		}
		this.getPrimaryAccount();
		this.getCurrentlyPlaying();
		this.getPrimaryDevices();
		this.getUsers();
		this.checkKinect();
		this.$wait.end('api');
		setInterval(() => {
			this.getPrimaryAccount();
		}, 900000);
		Date.prototype.getWeek = function(){
   		var firstDay = new Date(this.getFullYear(), this.getMonth(), 1).getDay();
    		return Math.ceil((this.getDate() + firstDay)/7);
    	};
	},
	sockets: {
		stateChanged: function (state) {
			this.track = state.track_window.current_track.name;
			this.artist = state.track_window.current_track.artists[0].name;
			this.album = state.track_window.current_track.album.name;
			this.artist = this.artist + " | " + this.album;
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
					this.analyticsLoaded = false;
					this.onAnalytics = false;
					break;
				case 'users':
					this.getUsers();
				 	this.onSpotify = false;
					this.onUsers = true;
					this.onOtherSettings = false;
					this.title = 'Users';
					this.analyticsLoaded = false;
					this.onAnalytics = false;
					break;
				case 'other':
					this.onSpotify = false;
					this.onUsers = false;
					this.onOtherSettings = true;
					this.title = 'Other Settings';
					this.analyticsLoaded = false;
					this.onAnalytics = false;
					break;
				case 'analytics':
					this.getAnalytics();
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
			 const response = await UserService.fetchUsers();
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
			 const response = await SpotifyService.getPrimaryToken();
			 if(response.data.success === true) {
				 this.access_token = response.data.access_token;
				 const profileResponse = await SpotifyService.getUserProfile(this.access_token);
				 this.primary_user = profileResponse.data.name;
				 this.primary_type = profileResponse.data.type;
				 this.primary_type = this.primary_type.charAt(0).toUpperCase() + this.primary_type.slice(1);
				 this.tokenExists = true;
			 } else {
				 this.tokenExists = false;
			 }
		 },
		async play() {
			const response = await SpotifyService.playPrimary({from: 'App', timestamp: Date.now()});
			if(response.data.success === true)
				this.paused = false;
		},
		async pause() {
			const response = await SpotifyService.pausePrimary({from: 'App', timestamp: Date.now()});
			if(response.data.success === true)
				this.paused = true;
		},
		async next() {
			await SpotifyService.nextPrimaryTrack({from: 'App', timestamp: Date.now()});
			var self = this;
			setTimeout(() => {
				self.getCurrentlyPlaying();
			}, 250); 
		},
		async prev() {
			await SpotifyService.previousPrimaryTrack({from: 'App', timestamp: Date.now()});
			var self = this;
			setTimeout(() => {
				self.getCurrentlyPlaying();
			}, 250); 
		},
		async toggleShuffle() {
			if(this.shuffle === false) {
				const response = await SpotifyService.shufflePrimary({shuffle: true, from: 'App', timestamp: Date.now()});
				if(response.data.success === true) {
					this.shuffle = true;
				}
			} else {
				const response = await SpotifyService.shufflePrimary({shuffle: false, from: 'App', timestamp: Date.now()});
				if(response.data.success === true) {
					this.shuffle = false;
				}
			}
		},
		async toggleRepeat() {
			switch(this.repeatToggle) {
				case 1:
					const response = await SpotifyService.repeatPrimary({type: 'track', from: 'App', timestamp: Date.now()});
					if(response.data.success === true) {
						this.repeatToggle = 2;
					}
					break;
				case 2:
					const response2 = await SpotifyService.repeatPrimary({type: 'context', from: 'App', timestamp: Date.now()});
					if(response2.data.success === true) {
						this.repeatToggle = 3;
					}
					break;
				case 3: 
					const response3 = await SpotifyService.repeatPrimary({type: 'off', from: 'App', timestamp: Date.now()});
					if(response3.data.success === true) {
						this.repeatToggle = 1;
					}
					break;
			}
		},
		async setVolume(volume) {
			await SpotifyService.setPrimaryVolume({volumePercent: volume, from: 'App', timestamp: Date.now()});
		},
		async player() {
			await SpotifyService.startPlayer();
			var self = this;
			setTimeout(() => {
				self.getCurrentlyPlaying();
			}, 2000); 
		},
		async startKinect() {
			await SpotifyService.startKinect();
			var self = this;
			setTimeout(() => {
				self.checkKinect();
			}, 2000); 
		},
		async checkKinect() {
			const reponse = await SpotifyService.checkKinect();
			if(response.data.success === true) {
				this.kinectStatus = 'Online';
			} else {
				this.kinectStatus = 'Offline';
			}
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
			}
		},
		async getAnalyticsCount() {
			this.$wait.start('api');
			const response = await AnalyticsService.getCount();
			if(response.data.success === true){
				this.analyticsCount = response.data.count;
			}
			this.$wait.end('api');
		},
		async getAnalytics() {
			this.$wait.start('api');
			this.getAnalyticsCount();
			this.onSpotify = false;
			this.onUsers = false;
			this.onOtherSettings = false;
			this.onAnalytics = true;
			this.title= 'Analytics';
			this.getTotalBarCount();
			this.getPieTotalBreakdown();
			this.getLineAllRequestsByYear();
			this.getSessions();
			this.getExecutionTime();
			this.analyticsLoaded = true;
			this.$wait.end('api');
		},
		async getTotalBarCount() {
			var endpoints = ['play', 'pause', 'next', 'prev', 'shuffle', 'repeat', 'volume'];
			var b_data = [['Endpoint', 'Count']];
			for(var i = 0; i < endpoints.length; i++) {
				const response = await AnalyticsService.getEndpoint(endpoints[i]);
				if(response.data.success === true) {
					var tmp_data = [endpoints[i]];
					tmp_data.push(response.data.data.length);
				}
				b_data.push(tmp_data);
			}
			this.barData = b_data;
		},
		async getPieTotalBreakdown() {
			var p_data = [['Request Origin', 'Amount of Requests']];
			const app_response = await AnalyticsService.getApp();
			if(app_response.data.success) {
				let tmp_data = ['App', app_response.data.data.length];
				p_data.push(tmp_data);
			}
			const kinect_response = await AnalyticsService.getKinect();
			if(kinect_response.data.success) {
				let tmp_data = ['Kinect', kinect_response.data.data.length];
				p_data.push(tmp_data);
			}
			const voice_response = await AnalyticsService.getVoice();
			if(voice_response.data.success) {
				let tmp_data = ['Voice', voice_response.data.data.length];
				p_data.push(tmp_data);
			}
			this.pieData = p_data;
		},
		async getLineAllRequestsByYear() {
			var l_data = [["Date", "Total"]];
			const curr_year = new Date().getFullYear();
			const response = await AnalyticsService.getYear(curr_year);
			if(response.data.success) {
				var temp_data = [];
				var t_data = response.data.data;
				var results = {}, date;
				for(let i = 0; i < t_data.length; i++) {
					date = [new Date(t_data[i].time.created).getFullYear(),new Date(t_data[i].time.created).getMonth(), new Date(t_data[i].time.created).getDate()];
					results[date] = results[date] || 0;
  					results[date]++;
				}
				//console.log(results);
				var resultMonths = Object.keys(results);
				//console.log('keys: '+resultMonths);
				for(let i = 0; i < 12; i++) {
					for(var k = 0; k < new Date(curr_year, i, 0).getDate(); k++) {
						let date = new Date(curr_year, i, k);
						//console.log(date.getFullYear() +","+date.getMonth()+","+date.getDate());
						for(let j = 0; j < resultMonths.length; j++) {
							if(date.getFullYear() +","+date.getMonth()+","+date.getDate() === resultMonths[j]) {
								//console.log('MATCH');
								temp_data = [date, results[resultMonths[j]]];
								l_data.push(temp_data);
							} else {
								temp_data = [date, 0];
								l_data.push(temp_data);
							}
						}
					}
				}
				this.lineType = 'Current Year';
				this.lineData = l_data;
			}
		},
		async getLineAllRequestsByMonth() {
			var l_data = [["Date", "Total"]];
			const curr_year = new Date().getFullYear();
			const curr_month = new Date().getMonth();
			const curr_day = new Date().getDate();
			const response = await AnalyticsService.getYear(curr_year);
			if(response.data.success) {
				var temp_data = [];
				var t_data = response.data.data;
				var results = {}, date;
				for(let i = 0; i < t_data.length; i++) {
					date = [new Date(t_data[i].time.created).getFullYear(),new Date(t_data[i].time.created).getMonth(), new Date(t_data[i].time.created).getDate()];
					results[date] = results[date] || 0;
  					results[date]++;
				}
				var resultWeeks = Object.keys(results);
				for(let i = -30; i <= new Date().getDate(); i++) {
					let date = new Date(curr_year, curr_month, i);
					//console.log(date.getFullYear() +","+date.getMonth()+","+date.getWeek());
					for(let j = 0; j < resultWeeks.length; j++) {
						if(date.getFullYear() +","+date.getMonth()+","+date.getDate() === resultWeeks[j]) {
							console.log('pushing '+results[resultWeeks[j]]+"for "+date.toString())
							temp_data = [date, results[resultWeeks[j]]];
							l_data.push(temp_data);
							break;
						} else {
							console.log('pushing 0 for '+date.toString());
							temp_data = [date, 0];
							l_data.push(temp_data);
						}
					}
				}
				this.lineType = 'Past Month';
				this.lineData = l_data;
			}
		},
		async getLineAllRequestsByCurrentWeek() {
			var l_data = [["Date", "Total"]];
			const curr_year = new Date().getFullYear();
			const curr_month = new Date().getMonth();
			const curr_date = new Date().getDate();
			const response = await AnalyticsService.getWeek(curr_year, curr_month, curr_date);
			if(response.data.success) {
				var temp_data = [];
				var t_data = response.data.data;
				var results = {}, date;
				for(let i = 0; i < t_data.length; i++) {
					date = [new Date(t_data[i].time.created).getFullYear(),new Date(t_data[i].time.created).getMonth(),new Date(t_data[i].time.created).getDate()];
					results[date] = results[date] || 0;
  					results[date]++;
				}
				var resultDays = Object.keys(results);
				for(let i = curr_date - 6; i <= curr_date; i++) {
					let date = new Date(curr_year, curr_month, i);
					for(let j = 0; j < resultDays.length; j++) {
						if(date.getFullYear() +","+date.getMonth() +","+date.getDate()=== resultDays[j]) {
							temp_data = [date, results[resultDays[j]]];
							l_data.push(temp_data);
						} else {
							temp_data = [date, 0];
							l_data.push(temp_data);
						}
					}
				}
				this.lineType='Past Week';
				this.lineData = l_data;
			}
		},
		async getLineAllRequestsByCurrentDay() {
			var l_data = [["Date", "Total"]];
			const curr_year = new Date().getFullYear();
			const curr_month = new Date().getMonth();
			const curr_date = new Date().getDate();
			const curr_hours = new Date().getHours();
			const response = await AnalyticsService.getDay(curr_year, curr_month, curr_date);
			if(response.data.success) {
				var temp_data = [];
				var t_data = response.data.data;
				var results = {}, date;
				for(let i = 0; i < t_data.length; i++) {
					date = [new Date(t_data[i].time.created).getFullYear(),new Date(t_data[i].time.created).getMonth(),new Date(t_data[i].time.created).getDate(), new Date(t_data[i].time.created).getHours()];
					results[date] = results[date] || 0;
  					results[date]++;
				}
				var resultDays = Object.keys(results);
				for(let i = curr_hours - 24; i <= curr_hours; i++) {
					let date = new Date(curr_year, curr_month, curr_date, i);
					for(let j = 0; j < resultDays.length; j++) {
						if(date.getFullYear() +","+date.getMonth() +","+date.getDate()+","+date.getHours()=== resultDays[j]) {
							const count = results[resultDays[j]];
							temp_data = [date, count];
							l_data.push(temp_data);
						} else {
							temp_data = [date, 0];
							l_data.push(temp_data);
						}
					}
				}
				this.lineType='Past Day';
				this.lineData = l_data;
			}
		},
		async getSessions() {
			var s_data = [['Day', 'Start', 'End']];
			const response = await AnalyticsService.getSessions();
			if(response.data.success) {
				var curr_year = new Date().getYear();
				var curr_month = new Date().getMonth();
				var curr_date = new Date().getDate();
				var temp_data = [];
				for(let i = 0; i < response.data.data.length; i++) {
					temp_data = ['Session '+(i+1), new Date(response.data.data[i].createdAt), new Date(response.data.data[i].endedAt)];
					s_data.push(temp_data);
				}
				this.sessionData = s_data;
			}
		},
		async getExecutionTime() {
			var e_data = [["Enpdoint", "TotalTime", {type: 'string', role: 'tooltip'}]];
			const response = await AnalyticsService.getAll();
			if(response.data.success) {
				var temp_data = [];
				for(let i = response.data.data.length - 1; i > response.data.data.length - 25; i--) {
					let num = 0;
					switch(response.data.data[i].endpoint) {
						case 'play':
						num = 1;
						let td = [num, response.data.data[i].time.totalTime, response.data.data[i].endpoint+"\nTotal Execution Time: "+response.data.data[i].time.totalTime];
					e_data.push(td);
						break;
						case 'pause':
						num = 2;
						let tdd = [num, response.data.data[i].time.totalTime, response.data.data[i].endpoint+"\nTotal Execution Time: "+response.data.data[i].time.totalTime];
					e_data.push(tdd);
						break;
						case 'next':
						num = 3;
						let tddd= [num, response.data.data[i].time.totalTime, response.data.data[i].endpoint+"\nTotal Execution Time: "+response.data.data[i].time.totalTime];
					e_data.push(tddd);
						break;
						case 'prev':
						num = 4;
						let tdddd = [num, response.data.data[i].time.totalTime, response.data.data[i].endpoint+"\nTotal Execution Time: "+response.data.data[i].time.totalTime];
					e_data.push(tdddd);
						break;
						case 'shuffle':
						num = 5;
						let tddddd = [num, response.data.data[i].time.totalTime, response.data.data[i].endpoint+"\nTotal Execution Time: "+response.data.data[i].time.totalTime];
					e_data.push(tddddd);
						break;
						case 'repeat':
						num = 6;
						let tdddddd = [num, response.data.data[i].time.totalTime, response.data.data[i].endpoint+"\nTotal Execution Time: "+response.data.data[i].time.totalTime];
					e_data.push(tdddddd);
						break;
						case 'volume':
						num = 7;
						let tddddddd = [num, response.data.data[i].time.totalTime, response.data.data[i].endpoint+"\nTotal Execution Time: "+response.data.data[i].time.totalTime];
					e_data.push(tddddddd);
						break;
					}
				}
				console.log(e_data);
				this.timeData = e_data;
			}
		},
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
	.playbackControls:active {
		outline-color: none;
		border: none;
	}
	.invertedPlaybackControls:active {
		outline-color: none;
		border: none;
	}
	.invertedPlaybackControls {
		color: #42b983;
		background-color:white;
		border:white;
		margin-top:10px;
	}
	.halfPlaybackControls {
		color: #42b983;
		background: linear-gradient(0deg, #42b983 50%, #ffffff 50%);
		border:white;
		margin-top:10px;
	}

	input[type=range].slider {
  -webkit-appearance: none;
  width: 100%;
  margin: 13.8px 0;
}
input[type=range].slider:focus {
  outline: none;
}
input[type=range].slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 1), 0px 0px 1px rgba(13, 13, 13, 1);
  background: #42b983;
  border-radius: 25px;
  border: 0px solid rgba(255, 255, 255, 0);
}
input[type=range].slider::-webkit-slider-thumb {
  box-shadow: 0.9px 0.9px 1px rgba(0, 0, 0, 1), 0px 0px 0.9px rgba(13, 13, 13, 1);
  border: 0px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -13.8px;
}
input[type=range].slider:focus::-webkit-slider-runnable-track {
  background: #53c28f;
}
input[type=range].slider::-moz-range-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
  background: #42b983;
  border-radius: 25px;
  border: 0px solid rgba(255, 255, 255, 0);
}
input[type=range].slider::-moz-range-thumb {
  box-shadow: 0.9px 0.9px 1px rgba(0, 0, 0, 1), 0px 0px 0.9px rgba(13, 13, 13, 1);
  border: 0px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
}
input[type=range].slider::-ms-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type=range].slider::-ms-fill-lower {
  background: #3ba676;
  border: 0px solid rgba(255, 255, 255, 0);
  border-radius: 50px;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
}
input[type=range].slider::-ms-fill-upper {
  background: #42b983;
  border: 0px solid rgba(255, 255, 255, 0);
  border-radius: 50px;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
}
input[type=range].slider::-ms-thumb {
  box-shadow: 0.9px 0.9px 1px rgba(0, 0, 0, 1), 0px 0px 0.9px rgba(13, 13, 13, 1);
  border: 0px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
  height: 8.4px;
}
input[type=range].slider:focus::-ms-fill-lower {
  background: #42b983;
}
input[type=range].slider:focus::-ms-fill-upper {
  background: #53c28f;
}

	
</style>
