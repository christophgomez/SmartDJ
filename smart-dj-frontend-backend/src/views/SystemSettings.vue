<template>
	<div class="page-container">
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

          <!--<md-list-item>
            <span class="md-list-item-text">Sent Mail</span>
          </md-list-item>

          <md-list-item>
            <span class="md-list-item-text">Trash</span>
          </md-list-item>

          <md-list-item>
            <span class="md-list-item-text">Spam</span>
          </md-list-item>-->
        </md-list>
      </md-app-drawer>

      <md-app-content>

				<div v-if='onSpotify===true'>
					<md-list>

						<md-list-item>
							<b-container>
								<b-row>
									<b-col cols='6'>
										<h2 class='md-title'>Primary Spotify Account</h2>
										<div class='md-subhead' style='overflow-wrap:break-word'>This is the account that will be used for music streaming</div>
									</b-col>
									<b-col>
										<div v-if='tokenExists===true'>
											<md-card>
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
        									<md-button>Change Accounts</md-button>
      									</md-card-actions>
    									</md-card>
										</div>
										<div v-if='tokenExists===false'>
											<md-card>
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
        									<md-button @click='deleteToken()'>Link Account</md-button>
        									<md-button v-b-modal.account-select>Select Account</md-button>
      									</md-card-actions>
    									</md-card>
										</div>
									</b-col>
								</b-row>
							</b-container>
						</md-list-item>

					</md-list>
				</div>

        <div v-if='onUsers===true'>

					<md-table v-model="users" md-card md-sort="username" md-sort-order="asc" md-fixed-header>
						<md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single" @click='goToUser(item.username)'>
        			<md-table-cell md-label="Username" md-sort-by="username">{{item.username}}</md-table-cell>
							<md-table-cell md-label="Email" md-sort-by="email">{{item.email}}</md-table-cell>
        			<md-table-cell md-label="Spotify Type" md-sort-by="spotify_type">{{item.spotify_type}}</md-table-cell>
        			<md-table-cell md-label="System Role">System Role Here</md-table-cell>
        			<md-table-cell md-label="Delete">
								<md-button @click='deleteUser(user._id)' class="md-icon-button">
									<font-awesome-icon icon='trash'/>
								</md-button>
							</md-table-cell>
      			</md-table-row>
    			</md-table>
        </div>

      </md-app-content>
    </md-app>
		<b-modal id='account-select' centered title='Select an Account'>
			<p>Vertically centered modal</p>
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
		this.getUsers();
		this.getPrimaryAccount();
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
		 async getUsers() {
			 const response = await UserService.fetchUsers();
			 if(response.status === 200) {
				 this.users = response.data.users;
			 } else {
				 console.log("Error: "+response.error);
			 }
		 },
		 async deleteToken() {
			 await SpotifyService.deleteAccessToken();
			 this.tokenExists = false;
		 },
		 async deleteUser(id) {
			 await UserService.deleteUser(id);
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
				 console.log('Could not get primary token');
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
	.md-table-row:hover .md-table-cell {
		background-color: #bdf3db
	}
	.md-card {
    width: 350px;
    margin: 10px;
		float:right;
  }
</style>
