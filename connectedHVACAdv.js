"use strict";

var PD = require('probability-distributions');

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;
var ConnectionString = require('azure-iot-device').ConnectionString;

var connectionString = 'HostName=saas-iothub-9ac2eb24-30af-4f28-8f9e-bdf908e871cb.azure-devices.net;DeviceId=f30lws;SharedAccessKey=qxEfOiNbElv6vf9UFf9rvuqngZ/59TvO2i+JcFbyJCI=';  //see getting a connection string
var targetChamberTemperature = 180;
var targetThermostat = 68;
var client = clientFromConnectionString(connectionString);

function sendTelemetry() {
    var chamberTemperature = targetChamberTemperature + (Math.random() * 15);
    var thermostatTemperature = targetThermostat + (Math.random() * 5);
    var o2Level = 17 + (Math.random() * 10);
    var waterPumpPressure = 2 + (Math.random() * 5);
    var fanmode = 0;
    var data = JSON.stringify( {
        chamberTemperature: chamberTemperature,
        o2Level: o2Level,
        waterPumpPressure: waterPumpPressure,
        furnacemode: (chamberTemperature < targetChamberTemperature) ? "1" : "0",
        fanmode: (chamberTemperature > targetChamberTemperature) ? "1" : "0",
        lossheat: (chamberTemperature < thermostatTemperature) ? "ER120" : undefined,
        excesswaterpressure: (waterFlowRate > 4) ? "ER121" : undefined
    }
    );
    var message = new Message(data);
    client.sendEvent(message, (err, res) => console.log('Sent message: ' + message.getData() +
        (err ? '; error: ' + err.toString() : '') +
        (res ? '; status: ' + res.constructor.name : '')
        ));
}

function sendDeviceProperties(twin) {
    var properties = {
        serialNumber: '123-ABC',
        manufacturer: 'Contoso'
    };
    twin.properties.reported.update(properties, (err) => console.log('Sent device properties; ' +
        (err ? '; error: ' + err.toString() : 'status: success')));
}

// Add any settings your device supports,
// mapped to a function that is called when the setting is changed.
var settings = {
    'fanSpeed': (newValue, callback) => {
        // Simulate it taking 1 second to set the fan speed.
        setTimeout(() => {
          callback(newValue, 'completed');
        }, 1000);
    },
    'setTemperature': (newValue, callback) => {
      // Simulate the temperature setting taking two steps.
      setTimeout(() => {
        targetTemperature = targetTemperature + (newValue - targetTemperature) / 2;
        callback(targetTemperature, 'pending');
        setTimeout(() => {
          targetTemperature = newValue;
          callback(targetTemperature, 'completed');
        }, 5000);
      }, 5000);
    }
  };

// Handle settings changes that come from Azure IoT Central via the device twin.
function handleSettings(twin) {
    twin.on('properties.desired', function (desiredChange) {
      for (let setting in desiredChange) {
        if (settings[setting]) {
          console.log(`Received setting: ${setting}: ${desiredChange[setting].value}`);
          settings[setting](desiredChange[setting].value, (newValue, status, message) => {
            var patch = {
              [setting]: {
                value: newValue,
                status: status,
                desiredVersion: desiredChange.$version,
                message: message
              }
            }
            twin.properties.reported.update(patch, (err) => console.log(`Sent setting update for ${setting}; ` +
              (err ? `error: ${err.toString()}` : `status: success`)));
          });
        }
      }
    });
  }

var connectCallback = (err) => {
    if (err) {
        console.log('Device could not connect to Azure IoT Central: ' + err.toString());
    } else {
        console.log('Device successfully connected to Azure IoT Central');

        //Send telemetry measurements to Azure IoT Central evey 1 second.
        setInterval(sendTelemetry, 1000);

        //Get device twin from Azure IoT Central.
        client.getTwin((err, twin) => {
            if (err) {
                console.log('Error getting device twin: ' + err.toString());
            } else {
                console.log('Acquired device twin.')
                //Send device properties once on device start up.
                sendDeviceProperties(twin);
                //Apply device settings and handle changes to device settings.
                handleSettings(twin);
            }
        });
    }
}

//Start the device (connect it to Azure IoT Central).
client.open(connectCallback);
