# smart-dj-frontend-backend

## Initial Project setup
```
npm install
```

### Some code changes required if you are using this for development: 
In `smart-dj-frontend-backend/src/services/SpotifyApi.js` make sure 
```
baseURL = "http://localhost:8081/spotify/"
```
In `smart-dj-frontend-backend/src/services/UserApi.js` make sure 
```
baseURL = "http://localhost:8081/users" // (NOTE: No / at the end)
```
In `smart-dj-frontend-backend/webplayer.html` make sure 
```
baseURL = "http://localhost:8081/spotify/"
```

If you're developing on Windows:

Move `smart-dj-frontend-backend/src/services/webplayer.html` to the C drive

In `smart-dj-frontend-backend/expressRoutes/spotifyRoutes.js` change line 227:
```
exec('open -a "Google Chrome" ./webPlayer.html'... 
```
to 
```
exec('start chrome file:\\\C:\webplayer.html'...
```
(Leave out the ... I just don't want to type it all out)

### Start the Frontend
```
npm run serve
```

### Start the Database

On Mac in terminal execute:
```
mongod
```
On Windows in cmd execute:
```
"C:\Program Files\MongoDB\Server\3.2\bin\mongod.exe"
```

### Start the Backend
```
npm run server
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
