#include <SPI.h>
#include <WiFi101.h>

#define TIMEOUT               10000
#define MSG_CLIENT_EN_VERIFY  "AN EVFY"
#define MSG_CLIENT_DS_VERIFY  "AN DVFY"
#define MSG_SERVER_VERIFY     "AN SVFY"
#define MSG_ENABLE            "AN ENBL"
#define MSG_DISABLE           "AN DSBL"
#define MSG_ACK               "AN  ACK"
#define MSG_POLL              "AN POLL"

char ssid[] = "CHANGE_ME"; // network SSID (name)
char pass[] = "CHANGE_ME"; // network password (use for WPA, or use as key for WEP)

// CHANGE_ME
IPAddress server(192, 168, 1, 10);  // IP address
//char server[] = "";               // URL

WiFiClient client;
unsigned port = 1337;

int relay = 8;
long elapsed_time = 0;
long prev_time = 0;
long this_time = 0;

void setup() {
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  Serial.println("Initializing...");
  
  Serial.print(" * Setting Pin Modes");
  pinMode(relay, OUTPUT);
  Serial.println("...Done");

  // check for the presence of the shield:
  CheckShield();

  // attempt to connect to Wifi network:
  while(!ConnectToNetwork());
  // attempt to connect to server:
  while(!ConnectToServer(false));

  this_time = millis();
  prev_time = this_time;
  Serial.println("...Done");
}

void loop() {
  static bool is_enabled = false;
  char msg[8] = { 0 };
  // Check for messages from server
  if (MsgRead(client, msg, 8) > 0) {  
    if (MsgCompare(msg, MSG_ENABLE)) {
      Serial.println("ENABLE");
      digitalWrite(relay, HIGH);
      is_enabled = true;
      prev_time = this_time;
    } else if (MsgCompare(msg, MSG_DISABLE)) {
      Serial.println("DISBALE");
      digitalWrite(relay, LOW);
      is_enabled = false;
      prev_time = this_time;
    } else if (MsgCompare(msg, MSG_ACK)) {
//      Serial.println("ACK");
      prev_time = this_time;
    } else {
      Serial.println("UNKOWN COMMAND");
    }
  // If no messages, poll server to see if we are still connected
  } else {
    this_time = millis();
    elapsed_time = this_time - prev_time;
    
    // Check to see if the connection has timed out
    if (elapsed_time > TIMEOUT) {
      Serial.print("Connection timed out. Elapsed time: ");
      Serial.println(elapsed_time);
      delay(TIMEOUT);
      
      // Try to reconnect
      bool is_connected = false;
      while (!is_connected) {
        if (WiFi.status() != WL_CONNECTED)
          ConnectToNetwork();
        is_connected = ConnectToServer(is_enabled);
      }
      
      this_time = millis();
      prev_time = this_time;
    } else if (elapsed_time > TIMEOUT / 3) {
//      Serial.println("Polling server");
      client.print(MSG_POLL);
    }
  }
  delay(100);
}

void CheckShield()
{
  Serial.print(" * Checking for WiFi Shield...");
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue:
    for (;;);
  }
  
  Serial.println("Done");
}

bool ConnectToNetwork()
{
  Serial.print(" * Attempting to connect to network: \"");
  Serial.print(ssid);
  Serial.print("\" ...");
  
  int status = WiFi.begin(ssid, pass);
  delay(TIMEOUT < 10000 ? 10000 : TIMEOUT);
  
  bool is_connected = false;
  if (status == WL_CONNECTED) {
    Serial.println("Done");
    is_connected = true;
  } else {
    Serial.print("Failed. Trying again in ");
    Serial.print(TIMEOUT / 1000);
    Serial.println(" seconds");
  }

  return is_connected;
}

bool ConnectToServer(bool enabled)
{
  Serial.print(" * Attempting to connect to server: \"");
  Serial.print(server);
  Serial.print(":");
  Serial.print(port);
  Serial.print("\" ...");

  bool is_connected = false;

  if (client.connect(server, port)) {
    if (enabled)
      client.print(MSG_CLIENT_EN_VERIFY);
    else
      client.print(MSG_CLIENT_DS_VERIFY);
    delay(100);
    
    char ack[8] = { 0 };
    MsgRead(client, ack, 8);

    if (!MsgCompare(ack, MSG_SERVER_VERIFY)) {
      Serial.println("Failed: Unable to verify connection");
    } else {
      Serial.println("Done");
      is_connected = true;
    }
  } else {
    Serial.print("Failed. Trying again in ");
    Serial.print(TIMEOUT / 1000);
    Serial.println(" seconds");
    delay(TIMEOUT);
  }
    
  return is_connected;
}

bool MsgCompare(const char *msg1, const char *msg2)
{
  int len = min(strlen(msg1), strlen(msg2));
  if (len == 0)
    return false;
    
  for (int i = 0; i < len; i++)
    if (msg1[i] != msg2[i])
      return false;

  return true;
}

int MsgRead(WiFiClient c, char *buf, int len)
{
  for (int i = 0; i < len && c.available(); i++)
    buf[i] = c.read();
  
  return strlen(buf);
}



