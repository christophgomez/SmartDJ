<template>
	<div class="page-container">
    <md-app>
      <md-app-toolbar class='md-primary'>
				<div v-if='onUsers===true'>
        	<span class="md-title" style='color:white'>Users</span>
				</div>
				<div v-if='onOtherSettings===true'>
        	<span class="md-title" style='color:white'>Other Settings</span>
				</div>
      </md-app-toolbar>

      <md-app-drawer md-permanent="full">
        <md-toolbar class="md-transparent" md-elevation="0">
          Navigation
        </md-toolbar>

        <md-list>
          <md-list-item>
            <a href=# class="md-list-item-text" @click.prevent="setActive('users')">Users</a>
          </md-list-item>

					<md-list-item>
						<a href='#' class='md-list-item-text' @click.prevent="setActive('other')">Other Settings</a>
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
        <div v-if='onUsers===true'>
					<md-list>
						<md-list-item v-for='(user, index) in users' :key='index'>
							<span class='md-list-item-text'>{{user.username}}</span>
						</md-list-item>
					</md-list>

        </div>
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
import UserService from '@/services/UserService';
import SpotifyService from '@/services/SpotifyService';

export default {
	name: 'SystemSettings',
	data: () => ({
		onUsers: true,
		onOtherSettings: false,
		users: [],
	}),
	created() {
		this.getUsers();
	},
	methods: {
		 getActiveClass(fieldName) {

		 },
		 setActive(fieldName) {
			 switch(fieldName) {
				 case 'users':
					this.onUsers = true;
					this.onOtherSettings = false;
					break;
				case 'other':
					this.onUsers = false;
					this.onOtherSettings = true;
					break;
			 }
		 },
		 async getUsers() {
			 const response = await UserService.fetchUsers();
			 if(response.status === 200) {
				 console.log(response.body.users);
				 this.users = response.body.users;
			 } else {
				 console.log("Error: "+response.error);
			 }
		 }
	}

}
</script>

<style scoped>
  .md-app {
    border: 1px solid rgba(#000, .12);
  }
  .md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
  }
</style>
