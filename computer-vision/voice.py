import speech_recognition as sr

r = sr.Recognizer()
mic = sr.Microphone()

try:
    print("Adjusting for background noise")
    with mic as source:
        r.adjust_for_ambient_noise(source, duration=1)
    while True:
        print("Say a command")
        with mic as source:
            r.energy_threshold = 2000
            r.dynamic_energy_threshold = True
            audio = r.listen(source)

        print("Attempting to recognize")
        try:
            # print what was said by the user to verify everything is good
            command = r.recognize_google(audio)
            print("You said... {}".format(command))

            # print number according to what was said
            # this is meant for the Spotify API to act accordingly
            if "repeat playlist" in command:
                print("7")
            elif "play" in command:
                print("1")
            elif "pause" in command:
                print("2")
            elif "previous song" in command:
                print("3")
            elif "next song" in command:
                print("4")
            elif "shuffe" in command:
                print("5")
            elif "repeat song" in command:
                print("6")
            elif "stop listening" in command:
                print("No Longer Listening. Press button to active microphone again.")
                exit()

        # if the audio cannot be recognized
        except sr.UnknownValueError:
            print("I didn't quite catch that")

        # this is for voice recognizes that send requests to their services
        except sr.RequestError as e:
            print("Uh oh. The request cannot be made {0}".format(e))

except KeyboardInterrupt:
    print("The program has stopped due to keyboard interrupt")
