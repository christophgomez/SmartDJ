<template>
	<div id='visualizer' ref='vis'>
		<canvas id='canvas1'></canvas>
		<b-modal ref="myModalRef" ok-only style='color:black;text-align:center' title='Whoops...'>
			<p>Click the Spotilize extension button in the Chrome toolbar to start the visualizer!</p>
		</b-modal>
	</div>
</template>

<script>
import SpotifyService from '@/services/SpotifyService';
import Particle from '@/util/Particle.js';
import Controls from '@/components/Controls';


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
			canvas: HTMLElement,
		}
	},
	sockets: {
		playerReady: function(data) {
			this.token = data.token;
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
		chrome.runtime.sendMessage('jidcihllhnmbjbnoijfepopdpkpgeobe', 'listening', (response) => {
        if(!response) {
          this.$router.replace({name: 'home'});
        } else if(response.listening === false) {
			  this.$refs.myModalRef.show();
        }
      });
		this.bands = null;
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
		this.canvas = null;
		window.cancelAnimationFrame(this.requestid);
	},
	mounted() {
		this.canvas = document.getElementById('canvas1');
		this.sizeCanvas();
	},
	methods: {
		sizeCanvas() {
			this.ratio = window.devicePixelRatio;
			this.height = window.innerHeight;
			this.width = window.innerWidth;
			//scale the canvas
			if(this.canvas !== null && this.canvas !== undefined) {
				this.canvas.setAttribute('height', this.height * this.ratio);
				this.canvas.setAttribute('width', this.width * this.ratio);
				this.ctx = this.canvas.getContext('2d');
				this.ctx.globalCompositeOperation = 'lighter';
			}
		},
		async transfer() {
			const response = await SpotifyService.transferDevicePlayer({player_id: localStorage.device_id, access_token: localStorage.access_token, play: true});
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
