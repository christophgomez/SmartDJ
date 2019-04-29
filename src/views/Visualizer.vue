<template>
	<div id='visualizer' ref='vis'>
		<canvas id='canvas1'></canvas>
		<b-modal ref="myModalRef" ok-only style='color:black;text-align:center' title='Whoops...'>
			<p>Click the Spotilize extension button in the Chrome toolbar to start the visualizer!</p>
		</b-modal>
		<b-modal>
			<canvas id="oCan"></canvas>
		</b-modal>
		<image id="imgSent" style='display:none'></image>
	</div>
</template>

<script>
import SpotifyService from '@/services/SpotifyService';
import UserService from '@/services/UserService';
import PythonService from '@/services/PythonService';
import Particle from '@/util/Particle.js';
import Controls from '@/components/Controls';

if (process.env.NODE_ENV !== 'production') {
  var config = require('../../config/settings');
}

var chromeId = process.env.chromeId || config.chromeId;

export default {
	data() {
		return {
			token: '',
			trackId: '',
			trackName: '',
			trackDuration: 0,
			transferred: false,
			isPaused: false,
			NUM_PARTICLES: 200,
			particles: [],
			height: null,
			width: null,
			ratio: null,
			ctx: null,
			bands: null,
			prevEnergy: [],
			requestid: null,
			visCanvas: HTMLElement,
			MODEL_URLS: '/models',
			dWidth: Number,
			dHeight: Number,
			streaming: Boolean,
			video: null,
			dStream: null,
			dCanvas: null,
			photoToSend: null,
			refImage: HTMLImageElement,
			faceMatcher: null
		}
	},
	sockets: {
		playerReady: function(data) {
			this.token = data.token.access_token;
			this.playerId = data.player_id;
			if(this.transferred === false) {
				this.transfer();
			}
		},
		stateChanged: function(data) {
			if(data.state.paused !== true && this.trackId !== data.state.track_window.current_track.id) {
				this.trackId = data.state.track_window.current_track.id;
				this.trackName = data.state.track_window.current_track.name;
				if(this.transferred === false) {
					this.transfer();
				}
			}
			if(data.state.paused === true) {
				this.isPaused = true;
			} else {
				this.isPaused = false;
			}
		},
		tokenRefreshed: function(data) {
			this.token = data.token;
		},
		paused: function() {

		},
		played: function() {
			
		}
	},
	created() {
		chrome.runtime.sendMessage(chromeId, 'listening', (response) => {
        if(!response) {
          this.$router.replace({name: 'home'});
        } else if(response.listening === false) {
			  this.$refs.myModalRef.show();
        }
      });
		this.bands = null;
		this.dWidth = 600;
		this.dHeight = 0;
		this.streaming = false;

		window.addEventListener("message", (event) => {
			// We only accept messages from ourselves
			if (event.source != window)
				return;
			if(event.data.type = "frequency_data")
				this.bands = event.data.data;
			if(event.data.type = "fullScreenDone")
				this.sizeCanvas();
		});
	},
	beforeDestroy() {
		this.NUM_PARTICLES = 150;
		this.particles = [];
		this.bands = null;
		this.ctx = null;
		this.visCanvas = null;
		window.cancelAnimationFrame(this.requestid);
	},
	mounted() {
		this.visCanvas = document.getElementById('canvas1');
		this.video = document.createElement('video');
		this.dCanvas = document.getElementById('oCan');
		this.loadFaceAPI();
		navigator.mediaDevices.getUserMedia({video: true, audio: false}).then((stream) => {
			this.dStream = stream;
			this.video.srcObject = stream;
			
		}).catch((err) => {
			console.log("An error occured: "+err);
		});
		this.video.addEventListener('canplay', (ev) => {
			if(!this.streaming) {
				this.dHeight = this.video.videoHeight / (this.video.videoWidth / this.dWidth);
				this.video.setAttribute('width', this.dWidth);
				this.video.setAttribute('height', this.dHeight);
				this.dCanvas.setAttribute('width', this.dWidth);
				this.dCanvas.setAttribute('height', this.dHeight);
				this.streaming = true;
				this.video.play();
				this.onPlay(this.video);
			}
		}, false);
		this.clearPhoto();
		
		
		this.sizeCanvas();
	},
	methods: {
		clearPhoto() {
			var ctx = this.dCanvas.getContext('2d');
			ctx.fillStyle = "#AAA";
			ctx.fillRect(0,0, this.dCanvas.width, this.dCanvas.height);
			var data = this.dCanvas.toDataURL('image/png');
			
		},
		async loadFaceAPI() {
			console.log('Email: '+localStorage.email);
			const imgRes = await UserService.getUserImage(localStorage.email);
			if(imgRes.data.success === true) {
				this.refImage = new Image();
				this.refImage.src = imgRes.data.image
			}
			await faceapi.loadTinyFaceDetectorModel(this.MODEL_URLS)
			await faceapi.loadFaceLandmarkModel(this.MODEL_URLS);
			await faceapi.loadFaceRecognitionModel(this.MODEL_URLS);
			console.log("Detecting faces in ref image");
			const results = await faceapi.detectAllFaces(this.refImage, new faceapi.TinyFaceDetectorOptions())
  												  .withFaceLandmarks()
  												  .withFaceDescriptors()
			if (!results.length) {
  				return
			}

			// create FaceMatcher with automatically assigned labels
			// from the detection results for the reference image
			this.faceMatcher = new faceapi.FaceMatcher(results)
			console.log('face api loaded');
		},
		async onPlay(videoEl) {
			const singleResult = await faceapi
  										.detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
  										.withFaceLandmarks()
  										.withFaceDescriptor()
			if (singleResult) {
  				const bestMatch = this.faceMatcher.findBestMatch(singleResult.descriptor)
				  console.log("Recognize: "+bestMatch.toString())
				  var person = bestMatch.toString();
				  console.log("person includes unknown: "+person.includes("Unknown"));
				  if(person.includes("Unknown") === false) {
					  this.takePicture();
				  }
			}		

			setTimeout(() => this.onPlay(videoEl), 1500);
		},
		takePicture() {
			console.log("taking picture");
			console.log(this.dWidth +" "+this.dHeight);
			var ctx = this.dCanvas.getContext('2d');
			if (this.dWidth && this.dHeight) {
     	 		this.dCanvas.width = this.dWidth;
      		this.dCanvas.height = this.dHeight;
     		 	ctx.drawImage(this.video, 0, 0, this.dWidth, this.dHeight);
				var data = this.dCanvas.toDataURL('image/png');
				//var base64 = data.replace("data:image/png;base64,","");
				console.log("sending picture");
				this.$socket.emit('image', {image: data});
    		} else {
     		 	this.clearPhoto();
			 }
		},
		sizeCanvas() {
			this.ratio = window.devicePixelRatio;
			this.height = window.innerHeight;
			this.width = window.innerWidth;
			//scale the canvas
			if(this.visCanvas !== null && this.visCanvas !== undefined) {
				this.visCanvas.setAttribute('height', this.height * this.ratio);
				this.visCanvas.setAttribute('width', this.width * this.ratio);
				this.ctx = this.visCanvas.getContext('2d');
				this.ctx.globalCompositeOperation = 'lighter';
			}
		},
		async transfer() {
			const response = await SpotifyService.transferDevicePlayer({id: localStorage.device_id, access_token: localStorage.access_token, play: true});
			if(response.data.success === true) {
				this.setup();
				this.transferred = true;
			}
		},
		async getTrackInfo() {
			const response = await SpotifyService.getTrackInfo(localStorage.access_token, this.trackId);
			if(response.data.success === true) {

			}
		},
		async analyze() {
			const response = await SpotifyService.analyzeTrack(localStorage.access_token, this.trackId);
			if(response.data.success === true) {
				
			}
		},
		setup() {
			var i, j, particle, x, y;
			for (i = 0; i <= this.NUM_PARTICLES - 1; i++) {
        		x = this.random(this.width);
        		y = this.random(this.height);
        		particle = new Particle(x, y);
        		particle.energy = this.random(particle.band / 256);
        		this.particles.push(particle);
			}
			this.requestid = requestAnimationFrame(this.draw);
		},
		draw() {
			this.ctx.clearRect(0, 0, this.width * this.ratio, this.height * this.ratio);
			this.update();
			this.requestid = requestAnimationFrame(this.draw);
		},
		update() {
			let particle;
      	for (let j = 0; j < this.particles.length; j++) {
				  particle = this.particles[j];
				  if(this.bands !== undefined && this.bands !== null) {
					  particle.energy = this.bands[particle.band] / 256;
				  }
        		// recycle particles
        		if (particle.y < -particle.size * particle.level * particle.scale) {
         		particle.reset();
          		particle.x = this.random(this.width);
					particle.y = this.height + (particle.size * particle.scale * particle.level);
        		}
        		particle.move();
        		particle.draw(this.ctx);
			}
		},
		random (min, max = undefined) {
			if (this.isArray(min))
				return min[~~(Math.random() * min.length)];
			if (!this.isNumber(max))
				max = min || 1, min = 0;
			return min + Math.random() * (max - min);
		},
		isArray(object) {
			return Object.prototype.toString.call(object) == '[object Array]';
		},
		isNumber(object) {
			return typeof object == 'number';
		}
	}
}
</script>

<style scoped>
#visualizer {
	height: 100%;
	color: white;
	background: #13242f;
}
#canvas {
	z-index: -1;
}
#visualizer:before {
  background-size: 100%;
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHJhZGlhbEdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY3g9IjUwJSIgY3k9IiIgcj0iOTUlIj48c3RvcCBvZmZzZXQ9IjIwJSIgc3RvcC1jb2xvcj0iIzAwMDAwMCIgc3RvcC1vcGFjaXR5PSIwLjAiLz48c3RvcCBvZmZzZXQ9Ijk1JSIgc3RvcC1jb2xvcj0iIzAwMDAwMCIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==');
  background-image: -moz-radial-gradient(center, ellipse cover, rgba(0, 0, 0, 0) 20%, #000000 95%);
  background-image: -webkit-radial-gradient(center, ellipse cover, rgba(0, 0, 0, 0) 20%, #000000 95%);
  background-image: radial-gradient(ellipse cover at center, rgba(0, 0, 0, 0) 20%, #000000 95%);
  position: absolute;
  content: "";
  z-index: 0;
  opacity: 0.9;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
}
#visualizer:after {
	background: url("https://s.cdpn.io/1715/noise-1.png");
  	position: absolute;
  	content: "";
  	z-index: 0;
  	opacity: 0.8;
  	height: 100%;
  	width: 100%;
  	left: 0;
  	top: 0;
}
</style>
