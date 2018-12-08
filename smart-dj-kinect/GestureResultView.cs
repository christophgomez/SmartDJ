//------------------------------------------------------------------------------
// <copyright file="GestureResultView.cs" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------




/*


Add the other gestures 


*/




namespace Microsoft.Samples.Kinect.DiscreteGestureBasics
{
    using System;
    using System.Text;
    using System.ComponentModel;
    using System.Runtime.CompilerServices;
    using System.Windows.Media;
    using System.Windows.Media.Imaging;
    using System.Windows.Forms;
    using System.Net.Http;
    using System.Web.Script.Serialization;
    using System.Json;
    using System.Net.Http.Headers;
    //using System.Threading;


    /// <summary>
    /// Stores discrete gesture results for the GestureDetector.
    /// Properties are stored/updated for display in the UI.
    /// </summary>
    public sealed class GestureResultView : INotifyPropertyChanged
    {
        /// <summary> Image to show when the 'detected' property is true for a tracked body </summary>
        private readonly ImageSource seatedImage = new BitmapImage(new Uri(@"Images\Seated.png", UriKind.Relative));

        /// <summary> Image to show when the 'detected' property is false for a tracked body </summary>
        private readonly ImageSource notSeatedImage = new BitmapImage(new Uri(@"Images\NotSeated.png", UriKind.Relative));

        /// <summary> Image to show when the body associated with the GestureResultView object is not being tracked </summary>
        private readonly ImageSource notTrackedImage = new BitmapImage(new Uri(@"Images\NotTracked.png", UriKind.Relative));

        /// <summary> Array of brush colors to use for a tracked body; array position corresponds to the body colors used in the KinectBodyView class </summary>
        private readonly Brush[] trackedColors = new Brush[] { Brushes.Red, Brushes.Orange, Brushes.Green, Brushes.Blue, Brushes.Indigo, Brushes.Violet };

        /// <summary> Brush color to use as background in the UI </summary>
        private Brush bodyColor = Brushes.Gray;

        /// <summary> The body index (0-5) associated with the current gesture detector </summary>
        private int bodyIndex = 0;

        /// <summary> Current confidence value reported by the discrete gesture </summary>
        private float confidence = 0.0f;

        /// <summary> True, if the discrete gesture is currently being detected </summary>
        private bool detected = false;

        /// <summary> Image to display in UI which corresponds to tracking/detection state </summary>
        private ImageSource imageSource = null;

        /// <summary> True, if the body is currently being tracked </summary>
        private bool isTracked = false;

        /// <summary> True, if the gesture had a response is already open </summary>
        private bool isCalled = false;

        /// <summary> Saves the access_token from the Spotify</summary>
        private string accessToken;



        /// <summary>
        /// Initializes a new instance of the GestureResultView class and sets initial property values
        /// </summary>
        /// <param name="bodyIndex">Body Index associated with the current gesture detector</param>
        /// <param name="isTracked">True, if the body is currently tracked</param>
        /// <param name="detected">True, if the gesture is currently detected for the associated body</param>
        /// <param name="confidence">Confidence value for detection of the 'Seated' gesture</param>
        public GestureResultView(int bodyIndex, bool isTracked, bool detected, float confidence)
        {
            this.BodyIndex = bodyIndex;
            this.IsTracked = isTracked;
            this.Detected = detected;
            this.Confidence = confidence;
            this.ImageSource = this.notTrackedImage;            
        }

        /// <summary>
        /// INotifyPropertyChangedPropertyChanged event to allow window controls to bind to changeable data
        /// </summary>
        public event PropertyChangedEventHandler PropertyChanged;

        /// <summary> 
        /// Gets the body index associated with the current gesture detector result 
        /// </summary>
        public int BodyIndex
        {     
            get
            {
                return this.bodyIndex;
            }

            private set
            {
                if (this.bodyIndex != value)
                {
                    this.bodyIndex = value;
                    this.NotifyPropertyChanged();
                }
            }           
        }

        /// <summary> 
        /// Gets the body color corresponding to the body index for the result
        /// </summary>
        public Brush BodyColor
        {
            get
            {
                return this.bodyColor;
            }

            private set
            {
                if (this.bodyColor != value)
                {
                    this.bodyColor = value;
                    this.NotifyPropertyChanged();
                }
            }
        }

        /// <summary> 
        /// Gets a value indicating whether or not the body associated with the gesture detector is currently being tracked 
        /// </summary>
        public bool IsTracked
        {
            get
            {
                return this.isTracked;
            }

            private set
            {
                if (this.IsTracked != value)
                {
                    this.isTracked = value;
                    this.NotifyPropertyChanged();
                }
            }
        }

        /// <summary> 
        /// Gets a value indicating whether or not the discrete gesture has been detected
        /// </summary>
        public bool Detected
        {
            get
            {
                return this.detected;
            }

            private set
            {
                if (this.detected != value)
                {
                    this.detected = value;
                    this.NotifyPropertyChanged();
                }
            }
        }

        /// <summary> 
        /// Gets a float value which indicates the detector's confidence that the gesture is occurring for the associated body 
        /// </summary>
        public float Confidence
        {
            get
            {
                return this.confidence;
            }

            private set
            {
                if (this.confidence != value)
                {
                    this.confidence = value;
                    this.NotifyPropertyChanged();
                }
            }
        }

        /// <summary> 
        /// Gets an image for display in the UI which represents the current gesture result for the associated body 
        /// </summary>
        public ImageSource ImageSource
        {
            get
            {
                return this.imageSource;
            }

            private set
            {
                if (this.ImageSource != value)
                {
                    this.imageSource = value;
                    this.NotifyPropertyChanged();
                }
            }
        }

        /// <summary>
        /// Updates the values associated with the discrete gesture detection result
        /// </summary>
        /// <param name="isBodyTrackingIdValid">True, if the body associated with the GestureResultView object is still being tracked</param>
        /// <param name="isGestureDetected">True, if the discrete gesture is currently detected for the associated body</param>
        /// <param name="detectionConfidence">Confidence value for detection of the discrete gesture</param>
        public void UpdateGestureResult(bool isBodyTrackingIdValid, bool isGestureDetected, float detectionConfidence)
        {
            this.IsTracked = isBodyTrackingIdValid;
            this.Confidence = 0.0f;

            if (!this.IsTracked)
            {
                this.ImageSource = this.notTrackedImage;
                this.Detected = false;
                this.BodyColor = Brushes.Gray;
            }
            else
            {
                this.Detected = isGestureDetected;
                this.BodyColor = this.trackedColors[this.BodyIndex];

                if (this.Detected)
                {
                    this.Confidence = detectionConfidence;
                    this.ImageSource = this.seatedImage;
                }
                else
                {
                    this.ImageSource = this.notSeatedImage;
                }
            }
        }

        /// <summary>
        /// Notifies UI that a property has changed
        /// </summary>
        /// <param name="propertyName">Name of property that has changed</param> 
        private void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (this.PropertyChanged != null)
            {
                this.PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }

        /*--------------------------------------------------------------------------------------------------------------------------*/
        /// <summary>
        /// Sends http request depending on the gesture
        /// </summary>
        /// <param name="isBodyTrackingIdValid">True, if the body associated with the GestureResultView object is still being tracked</param>
        /// <param name="isGestureDetected">True, if the discrete gesture is currently detected for the associated body</param>
        /// <param name="detectionConfidence">Confidence value for detection of the discrete gesture</param>
        /// <param name="whichGesture">True for previous song or false for next song gesture</param>
        public bool GestureResponse(bool isBodyTrackingIdValid, bool isGestureDetected, float detectionConfidence, bool whichGesture)
        {
            bool sent = false;
          
            if (isBodyTrackingIdValid == true && isGestureDetected == true && detectionConfidence > 0.4 && isCalled == false)
            {
                //Previous song
                if (whichGesture == true)
                {
                    //System.Diagnostics.Process.Start("http://www.csun.edu"); /////////////////// For Debug
                    isCalled = true;
                    
                    DateTime Tthen = DateTime.Now;
                    do
                    {
                        Application.DoEvents();
                    } while (Tthen.AddSeconds(5) > DateTime.Now);

                    isCalled = false;
                    Prev();
                    sent = true;
                    
                }
                //Next Song
                else if (whichGesture == false)
                {
                    //System.Diagnostics.Process.Start("http://www.csun.edu");////////////////////////// For Debug 
                    isCalled = true;
                    
                    DateTime Tthen = DateTime.Now;
                    do
                    {
                        Application.DoEvents();
                    } while (Tthen.AddSeconds(5) > DateTime.Now);

                    isCalled = false;
                    Next();
                    sent = true;
                   
                }
            }

            return sent;
        }

        /*
            Every Http Request should either send a JSON object
            or recieve a JSON object, check github for more info
            on each funtion and what exactly it requires
            Some functions are for statistical purposes only
        */

        /// <summary>
        /// Sends a PUT request for "play" to the server
        /// from:String
        /// from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.
        /// </summary>
        async public void Play()
        {
            using (var client = new HttpClient())
            {
                Int64 unixTimestamp = (Int64)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalMilliseconds;
                JsonObject data = new JsonObject
                {
                    { "from", "Kinect"},
                    { "timestamp", unixTimestamp }
                };

                var content = new StringContent(data.ToString(), Encoding.UTF8, "application/json");
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                var response = await client.PutAsync("http://localhost:8081/spotify/kinect/play", content);
                client.Dispose();
                content.Dispose();
                response.Dispose();
            }
        }

        /// <summary>
        /// Sends a PUT request for "pause" to the server
        /// from:String
        /// from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.
        /// </summary>
        async public void Pause()
        {
            using (var client = new HttpClient())
            {
                Int64 unixTimestamp = (Int64)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalMilliseconds;
                JsonObject data = new JsonObject
                {
                    { "from", "Kinect"},
                    { "timestamp", unixTimestamp }
                };

                var content = new StringContent(data.ToString(), Encoding.UTF8, "application/json");
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                var response = await client.PutAsync("http://localhost:8081/spotify/kinect/pause", content);
                client.Dispose();
                content.Dispose();
                response.Dispose();
            }
        }

        /// <summary>
        /// Sends a POST request for "next" to the server
        /// from:String
        /// from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.
        /// </summary>
        async public void Next()
        {
            using (var client = new HttpClient())
            {
                Int64 unixTimestamp = (Int64)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalMilliseconds;
                JsonObject data = new JsonObject
                {
                    { "from", "Kinect"},
                    { "timestamp", unixTimestamp }
                };

                var content = new StringContent(data.ToString(), Encoding.UTF8, "application/json");
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                var response = await client.PostAsync("http://localhost:8081/spotify/kinect/next", content);
                client.Dispose();
                content.Dispose();
                response.Dispose();
            }            
        }

        /// <summary>
        /// Sends a POST request for "prev" to the server
        /// from:String
        /// from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.
        /// </summary>
        async public void Prev()
        {
            using (var client = new HttpClient())
            {
                Int64 unixTimestamp = (Int64)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalMilliseconds;
                JsonObject data = new JsonObject
                {
                    { "from", "Kinect"},
                    { "timestamp", unixTimestamp }
                };

                var content = new StringContent(data.ToString(), Encoding.UTF8, "application/json");
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                var response = await client.PostAsync("http://localhost:8081/spotify/kinect/prev", content);
                client.Dispose();
                content.Dispose();
                response.Dispose();
            }
        }

        /// <summary>
        /// Sends a POST request for "test" to the server
        /// from:String
        /// from must be either 'Kinect' or 'App', timestamp must be a Unix-like timestamp in milliseconds since 1970.
        /// </summary>
        async public void Test()
        {
            using (var client = new HttpClient())
            {
                JsonObject data = new JsonObject
                {
                    { "from", "Kinect"},
                    { "data", "test" }
                };

                var content = new StringContent(data.ToString(), Encoding.UTF8, "application/json");
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                var response = await client.PostAsync("http://localhost:8081/spotify/test", content);
                client.Dispose();
                content.Dispose();
                response.Dispose();
            }
        }

        /// <summary>
        /// Sends a GET request to the server for access token
        /// Currently not used, keeping it for later use with facial detection
        /// accessToken is global so do not change the actual data ******
        /// </summary>
        async public void GetAccessToken()
        {
            using (var client = new HttpClient())
            {
                var jsonobj = new JavaScriptSerializer().Deserialize<Token>(await client.GetStringAsync("http://localhost:8081/spotify/access_token/primary"));
                accessToken = jsonobj.access_token;
                //Console.WriteLine(accessToken);
            }
        }
     
        /// <summary>
        /// Required for the access token method
        /// </summary>
        public class Token
        {
            //Names for methods need to be exact for server to accept them
            //Do not change
            public bool token { get; set; }
            public string access_token { get; set; }
            public string refresh_token { get; set; }
        }       
    }
}
