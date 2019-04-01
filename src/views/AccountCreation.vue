<template>
	<div class='contentarea'>
		<h3>We need you to take some photos of yourself for facial recognition</h3>
		<p>Once you have taken 5 photos, you're done!<p>
		<p>Photos: {{num}}</p>
		<div class="camera">
    		<video id="video">Video stream not available.</video>
    		<button id="startbutton" @click='takePicture()'>Take photo</button>
  		</div>
		<canvas id="oCan">
  		</canvas>
  		<div class="output">
    		<img id="photo" alt="The screen capture will appear in this box.">
  		</div>
	</div>
</template>

<script>
import UserService from '@/services/UserService';
import SpotifyService from '@/services/SpotifyService';

export default {
	name: 'AccountCreation',
	data() {
		return {
			width: Number,
			height: Number,
			streaming: Boolean,
			video: null,
			canvas: null,
			photo: null,
			startButton: null,
			num: 0,
			imgArray: [],
		}
	},
	created() {
		this.width = 600;
		this.height = 0;
		this.streaming = false;
	},
	mounted() {
		this.video = document.getElementById('video');
		this.canvas = document.getElementById('oCan');
		this.photo = document.getElementById('photo');
		this.startButton = document.getElementById('startButton');
		navigator.mediaDevices.getUserMedia({video: true, audio: false}).then((stream) => {
			this.video.srcObject = stream;
			this.video.play();
		}).catch((err) => {
			console.log("An error occured: "+err);
		});
		this.video.addEventListener('canplay', (ev) => {
			if(!this.streaming) {
				this.height = this.video.videoHeight / (this.video.videoWidth / this.width);
				this.video.setAttribute('width', this.width);
				this.video.setAttribute('height', this.height);
				this.canvas.setAttribute('width', this.width);
				this.canvas.setAttribute('height', this.height);
				this.streaming = true;
			}
		}, false);
		this.clearPhoto();
	},
	methods: {
		clearPhoto() {
			var ctx = this.canvas.getContext('2d');
			ctx.fillStyle = "#AAA";
			ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
			var data = this.canvas.toDataURL('image/png');
			this.photo.setAttribute('src', data);
		},
		takePicture() {
			var ctx = this.canvas.getContext('2d');

			if (this.width && this.height) {
     	 		this.canvas.width = this.width;
      		this.canvas.height = this.height;
     		 	ctx.drawImage(this.video, 0, 0, this.width, this.height);
    
				var data = this.canvas.toDataURL('image/png');
				var base64 = data.replace("data:image/png;base64,","");
				this.imgArray.push(base64);
				this.photo.setAttribute('src', data);
				this.num++;
				if(this.num === 5) {
					this.createAccount();
				}
    		} else {
     		 	clearphoto();
    		}	
		},
		async createAccount() {
			const response = await SpotifyService.getProfile(localStorage.access_token);
			if(response.data.success === true) {
				var email = response.data.email;
				var user = {
					access_token: localStorage.access_token,
					refresh_token: localStorage.refresh_token,
					email: email,
					images: this.imgArray
				};
				const r2 = await UserService.createUser(user);
				if(r2.data.success === true) {
					this.$router.replace({name: 'visualizer'});
				}
			}
		},
	}
}
</script>

<style scoped>
#video {
  border: 1px solid black;
  box-shadow: 2px 2px 3px black;
  width:600px;
  height:450px;
}

#photo {
  border: 1px solid black;
  box-shadow: 2px 2px 3px black;
  width:600px;
  height:450px;
}
.chr {
  background-color:#0266C8;
  margin-top:1em;
  color:white;
}
#oCan {
  display:none;
}

.camera {
  width: 600px;
  margin-top: 1em;
  display:inline-block;
}

.output {
  width: 600px;
  display:inline-block;
  display: none;
}

#startbutton {
  display:block;
  position:relative;
  margin-left:auto;
  margin-right:auto;
  bottom:32px;
  background-color: rgba(0, 150, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0px 0px 1px 2px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  font-family: "Lucida Grande", "Arial", sans-serif;
  color: rgba(255, 255, 255, 1.0);
}
.contentarea {
  	height: 100%;
	color: white;
	background: #13242f;
}
</style>
