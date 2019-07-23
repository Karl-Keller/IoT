# IoT-1
This demonstration follows the MS Azure IoT Instructions here:

https://docs.microsoft.com/en-us/azure/iot-central/howto-connect-nodejs

The basic idea is to define and provision an IoT device and then drive it with a Javascript program.

To do this requires setup > 30 minutes.  The basic process is this:

0. Create a working directory and get node/npm installed
1. Get an Azure account - free trial works, membership has its benefits
2. Create an IoT Central Application that results in an IoT Central Application URL
3. Define your device(s) using the application front end (called Contoso) accessible from the IoT Central Application URL
4. Connect your code to the device following these instructions: https://docs.microsoft.com/en-us/azure/iot-central/howto-generate-connection-string
5. Launch the device in the application website
6. Launch your code
7. Monitor the results.

Notes:

Item 0: Once you have a directory to work in, check that you have node and npm installed (or install from here if necessary: https://nodejs.org/en/)
Item 3: The definition of the device requires matching up the names of telemetry variables and those names in your code, e.g. temp = temp.
Item 4: This uses the node package called dps-keygen.  dps-keygen is a function applied to several IoT device variables to generate a connection string.
Item 5: You probably already launched the device if you have successfully generated a key!
Item 6: Start your .js application the old-fashioned way, > node applications.js
Item 7: This will be a good chance to debug parts of your code.  If telemetry is missing, start matching up names in the device with the names of variables in your code.

There are a couple of packages tossed in to get thinking.

1. This is a monitoring and control application, so naturally, we might want to apply some control to our device.
    see here - https://www.npmjs.com/package/node-pid-controller
2. When simulating output, depending on what you know about your device and the thing you're simulating, you might want to use one of various probability distributions.
    see here - https://www.npmjs.com/package/probability-distributions

