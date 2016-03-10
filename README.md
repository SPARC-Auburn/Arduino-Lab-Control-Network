#Arduino Network
##Client and server software for controlling relays using a network of arduinos

###Instructions:

Download and extract the [files](https://bitbucket.org/clb931/arduinonetwork/downloads).



###Server Instructions:

Run "server-install.bat" to install the server dependencies.

Run "server-run.bat" to run the server.



###Arduino Instructions:

Download and extract the arduino ide (found [here](https://drive.google.com/file/d/0B0fJLzzMXMaOYThzQ25SemlRa2c/view?usp=sharing)) to the project directory

Run "arduino-edit.bat"

Set the network ssid on line 13 (Set to the name of the wifi network you wish to connect to)

Set the network password on line 14 (Set to the password of the wifi network you wish to connect to)

Set the server ip address on line 17 (Set to the ip address of the computer running the server, example: "192.168.1.5")

Compile and upload code to an arduino



###Client Instructions:

Open the webpage at the server ip address from the last step.

If everything was installed correctly the arduino should automatically connect and appear on the webpage within a few seconds.
