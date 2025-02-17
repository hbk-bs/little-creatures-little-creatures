#include "Arduino.h"
#include "WiFiS3.h"
#include "WiFiSSLClient.h"

#include "littlecreature.h"

int status = WL_IDLE_STATUS;
int port = 443;
String url_params = "/arduino";
WiFiSSLClient client;

// IPAddress server(192,168,178,70);

LittleCreature::LittleCreature()
{
}

void LittleCreature::begin()
{
  LittleCreature_Options options;
  begin(options);
}

void LittleCreature::begin(LittleCreature_Options options)
{
  Serial.print("options.creature_name: ");
  Serial.println(options.creature_name);
  creature_name = options.creature_name;
  server = options.host;
  password = options.password;
  ssid = options.ssid;
  use_serial = options.use_serial;

  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE)
  {
    Serial.println("info: Communication with WiFi module failed!");
    // don't continue
    while (true)
      ;
  }

  String fv = WiFi.firmwareVersion();
  if (fv < WIFI_FIRMWARE_LATEST_VERSION)
  {
    Serial.println("info: Please upgrade the firmware");
  }
  // attempt to connect to WiFi network:
  while (status != WL_CONNECTED)
  {
    Serial.print("info: Attempting to connect to SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    if (password.length() > 0)
    {
      status = WiFi.begin(ssid.c_str(), password.c_str());
    }
    else
    {
      status = WiFi.begin(ssid.c_str());
    }

    // wait 10 seconds for connection:
    // delay(10000);
  }
  // print the SSID of the network you're attached to:
  Serial.print("info: SSID: ");
  Serial.println(WiFi.SSID());

  // print your board's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("info: IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("info: signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}

void LittleCreature::incomingRequest()
{
  uint32_t received_data_num = 0;

  while (client.available())
  {
    /* actual data reception */
    char c = client.read();
    /* print data to serial port */
    Serial.print(c);
    /* wrap data to 80 columns*/
    received_data_num++;
    if (received_data_num % 80 == 0)
    {
    }
  }
}

void LittleCreature::postRequest(std::vector<double> measurements)
{

  client.stop();
  if (client.connect(server.c_str(), port))
  {

    if (measurements.begin() == measurements.end())
    {
      return;
    }
    String m = "";
    for (std::size_t i = 0; i < measurements.size(); ++i)
    {
      if (i != measurements.size() - 1)
      {
        m += clear_pad(measurements[i]) + ", ";
      }
      else
      {
        m += clear_pad(measurements[i]);
      }
    }
    String payload = "{\"measurements\": [" + m + "], \"channel\" : \"" + creature_name + "\"}";
    Serial.print("info: payload: ");
    Serial.println(payload);
    // Make a HTTP request:
    client.println("POST " + String(url_params) + " HTTP/1.0");
    client.println("Host: " + String(server));
    client.println("Content-Type: application/json");
    client.println("Content-Length: " + String(payload.length()));
    //    client.println("Authorization: Bearer " + String(auth_token));
    client.println("Connection: close");
    client.println();
    client.println(payload);
    while (client.connected())
    {
      String line = client.readStringUntil('\n');
      if (line == "\r")
      {
        Serial.println("info: POST Success!");
        break;
      }
    }
    // if there are incoming bytes available
    // from the server, read them and print them:
    while (client.available())
    {
      char c = client.read();

      Serial.write(c);
    }
    Serial.println();
  }
  else
  {
    Serial.println("error: Connection failed");
  }
}