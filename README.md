# SmartDJ

Raspberry Pi Powered, Kinect Controlled Music Streaming with AI

## Initial Project setup

Download the project and cd into the `smart-dj-frontend-backend` folder, then run:

```bash
npm install
```

<b>Make sure MongoDB is installed,</b> if you don't have it installed you can find instructions here:<br>
macOS - https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/ <br>
Windows - https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/


### Some code changes required if you are using this for development 

In `smart-dj-frontend-backend/config/settings.js` change baseURL value to: `http://localhost:` <b>(NOTE: The colon)</b>

In `smart-dj-frontend-backend/webPlayer.html` change

```js
const api = axios.create({
  baseURL: 'http://chrisbook.local:8081/spotify/'
});
```

to

```js
const api = axios.create({
  baseURL: 'http://localhost:8081/spotify/'
});
```

<b>If you're developing on Windows:</b>

Move `smart-dj-frontend-backend/webplayer.html` to the C drive

In `smart-dj-frontend-backend/expressRoutes/spotifyRoutes.js` change line:

```js
exec('open -a "Google Chrome" ./webPlayer.html', () => {
  return res.status(200).send({
    message: 'child process created'
  });
});
```

to

```js
exec('start chrome file:\\\C:\webplayer.html', () => {
  return res.status(200).send({
    message: 'child process created'
  });
});
```

### Start the Database

On Mac in terminal execute:

```bash
mongod
```

On Windows in cmd execute:

```bash
"C:\Program Files\MongoDB\Server\3.2\bin\mongod.exe"
```

### Start the Backend

```bash
npm run server
```

### Start the Frontend

```bash
npm run serve
```

## Spotify API Routes

All requests should be sent to the base server address (`http://localhost:8081`)

Almost all requests return a JSON formatted object, which will be referred to as a Response Object.

```js
{
   property1: value1,
   property2: value2
}
```

Many requests return a simple true/false success, which will be reffered to as a Success Response Object.

```js
{
   success: true/false
}
```

Some responses contain additional data when success is true. I will explicity state the data. If nothing but 'Success Response Object' is listed, the access point doesn't return anything besides success. If success is equal to false, the response will not contain the value

Parameters come in two forms: HTTP Request Body data and URL Params.

Request Body data should be formatted as a JSON Object as well, with exact parameter property names from the table. URL Params do not and should not match the parameter name, instead replace :parameter with the actual value.

<table>
  <tr>
    <td>Method</td>
    <td>Endpoint</td>
    <td>Usage</td>
    <td>Parameters</td>
    <td>Returns</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/spotify/test</td>
    <td>Get Test Response from Server</td>
    <td>None</td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/spotify/login</td>
    <td>Get a Spotify Login/Auth Page</td>
    <td>None</td>
    <td>Success Response Object
      <pre lang='js'>
{
  success: true,
  redirect:String 
}</pre>
    </td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/spotify/access_token/primary</td>
    <td>Get the System Primary Token</td>
    <td>None</td>
    <td>Success Response Object
      <pre lang='js'>
{ 
  success: true, 
  access_token:String, 
  refresh_token:String
}</pre>
    </td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/spotify/access_token/temp</td>
    <td>Get the System temporary Token</td>
    <td>None</td>
    <td>Success Response Object
      <pre lang='js'>
{
  success:true,
  access_token:String,
  refresh_token:String,
}</pre>
    </td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/spotify/kinect/devices</td>
    <td>Get the Primary Account's Active Devices</td>
    <td>None</td>
    <td>Success Response Object
      <pre lang='js'>
{
  success: true,
  devices: [{}]
}</pre></td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/spotify/kinect/currently_playing</td>
    <td>Get Information about what the Primary Account's currently playing</td>
    <td>None</td>
    <td>Success Response Object
      <pre lang='js'>
{
  success: true,
  devices: [{}]
}</pre></td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/spotify/access_token/primary</td>
    <td>Delete the System Primary Token</td>
    <td>None</td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/spotify/access_token/temp</td>
    <td>Delete the System temporary Token</td>
    <td>None</td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/spotify/test</td>
    <td>Send Test Data to the Server</td>
    <td>Request Body Data:<pre lang='js'>
{
  data:String,
}</pre>
    </td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/spotify/authorize</td>
    <td>Receive a Spotify Access Token From the Spotify Servers</td>
    <td>Request Body Data:
      <pre lang='js'>
{ 
  code:String
}</pre>
    </td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/spotify/access_token/primary</td>
    <td>Update the System Primary Token</td>
    <td>Request Body Data:
      <pre lang='js'>
{
  access_token:String,
  refresh_token:String
}</pre>
    </td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/spotify/access_token/primary/refresh</td>
    <td>Refresh the System Primary Token</td>
    <td>None</td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/spotify/kinect/player</td>
    <td>Start the System WebPlayer</td>
    <td>None</td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/spotify/kinect/device_id</td>
    <td>Used to send the WebPlayer's device ID to the server</td>
    <td>Request Body Data: <br>(The ID of the device to transfer too)
      <pre lang='js'>
{
  id:String
}</pre></td>
     <td>Success Response object</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/spotify/kinect/next</td>
    <td>Skip to Primary Account's next track</td>
    <td>Request Body Data:<pre lang='js'>
{
  from:String,
  timestamp:Number,
}</pre>from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.
    </td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/spotify/kinect/prev</td>
    <td>Skip to Primary Account's previoius track</td>
    <td>Request Body Data:<pre lang='js'>
{
  from:String,
  timestamp:Number,
}</pre>from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.
    </td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td>/spotify/kinect/transfer</td>
    <td>Transfer the Primary Account's Current Playback to the System</td>
    <td>None</td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td>/spotify/kinect/play</td>
    <td>Play the Primary Account's current playback</td>
    <td>Request Body Data:<pre lang='js'>
{
  from:String,
  timestamp:Number,
}</pre>from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.
    </td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td>/spotify/kinect/pause</td>
    <td>Pause the Primary Account's current playback</td>
    <td>Request Body Data:<pre lang='js'>
{
  from:String,
  timestamp:Number,
}</pre>from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.
    </td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td>/spotify/kinect/shuffle</td>
    <td>Toggle shuffle on the Primary Account's Playback</td>
    <td>Request Body Data:<pre lang='js'>
{
  shuffle:Boolean,
  from:String,
  timestamp:Number
}</pre>from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.</td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td>/spotify/kinect/repeat</td>
    <td>Toggle repeat on the Primary Account's Playback</td>
    <td>Request Body Data:<pre lang='js'>
{
  type:String,
  from:String,
  timestamp:Number
}</pre>type must be: 'track', 'context', or 'off', from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.
    </td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td>/spotify/kinect/volume</td>
    <td>Set the volume on the Primary Account's Playback</td>
    <td>Request Body Data:<pre lang='js'>
{
  volumePercent:Number,
  from:String,
  timestamp:Number
}</pre>volumePercent must be an number from 0 to 100, from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.
    </td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/spotify/user/:token</td>
    <td>Get a Spotify User Profile</td>
    <td>URL Parameter:<br>
      Spotify Access Token
    </td>
    <td>Success Response Object
      <pre lang='js'>
 {
  success: true,
  fullProfileResponse: {},
  birthday:String,
  name:String,
  email:String,
  url:String,
  followerTotal:Number,
  type:String
}</pre>
    </td>
  </tr>
  <tr>
    <td>PUT</td>
    <td>/spotify/user/transfer</td>
    <td>Transfer User's Current Playback to an Active Device</td>
    <td>Request Body Data:<br>(The ID of the device to transfer too)
      <pre lang='js'>
{
  id:String
  access_token:String,
}</pre>
    </td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/spotify/user/devices/:token</td>
    <td>Get a user's Active Devices</td>
    <td>URL Parameter:<br>User Spotify Access Token</td>
    <td>
      Success Response Object
      <pre lang='js'>
{
  success: true,
  devices: [{}]
}</pre>
    </td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/spotify/user/currently_playing/:token</td>
    <td>Get Information about what a user's currently playing</td>
    <td>URL Parameter:<br>User Spotify Access Token</td>
    <td>Success Response Object
      <pre lang='js'>
{
  success: true,
  is_playing: true,
  object: {}
}</pre>
      <pre lang='js'>
{
  success: true,
  is_playing: false,
  object: null
}</pre>
    </td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/spotify/user/top_artists/:token</td>
    <td>Get as a User's top artists</td>
    <td>URL Parameter:<br>User Spotify Access Token</td>
    <td>Success Response Object
      <pre lang='js'>
{
  success: true,
  artists: [],
}</pre>
    </td>
  </tr>
  <tr>
    <td>PUT</td>
    <td>/spotify/user/play</td>
    <td>Play a user's current playback</td>
    <td>Request Body Data:
      <pre lang='js'>
{
  access_token:String
}</pre>
    </td>
    <td>Response Success Object</td>
  </tr>
  <tr>
    <td>PUT</td>
    <td>/spotify/user/pause</td>
    <td>Pause a user's current playback</td>
    <td>Request Body Data:
      <pre lang='js'>
{
  access_token:String
}</pre>
    </td>
    <td>Response Success Object</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/spotify/user/next</td>
    <td>Skip to a user's next track</td>
    <td>Request Body Data:
      <pre lang='js'>
{
  access_token:String
}</pre>
    </td>
    <td>Success Response Object</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/spotify/user/prev</td>
    <td>Skip to a user's previous track</td>
    <td>Request Body Data:
      <pre lang='js'>
{
  access_token:String
}</pre>
    </td>
    <td>Success Response Object</td>
  </tr>
</table>
