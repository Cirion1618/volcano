// main.js

import {
  setTemperature,
  startPumpOnly,
  stopPump,
  stopHeater,
  startHeater,
  waitForTemp,
  wait,
  log,
  abortFlag,
  updateProgressBar,
  volcanoConnect
} from './core.js';

window.connect = async function connect() {
  try {
    const storedId = localStorage.getItem('volcanoDeviceId');
    let device;
    let server;
    let service;

    if (storedId) {
      const devices = await navigator.bluetooth.getDevices();
      device = devices.find(d => d.id === storedId);
    }

    if (!device) {
      device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "00001523-1212-efde-1523-785feabcd123",
          "10100000-5354-4f52-5a26-4249434b454c"
        ]
      });
      localStorage.setItem('volcanoDeviceId', device.id);
    }

    document.getElementById("status").innerText = `Status: Connecting to ${device.name}...`;
    server = await device.gatt.connect();
    service = await server.getPrimaryService("00001523-1212-efde-1523-785feabcd123");

    document.getElementById("status").innerText = `Status: Connected to ${device.name}`;
    log("Connected to device: " + device.name);

    // Optional: Start status updates or additional reads here
  } catch (err) {
    document.getElementById("status").innerText = `Connection failed: ${err.message}`;
    log("Connection error: " + err);
  }
};

window.abortWorkflow = () => abortFlag.value = true;

window.runWorkflowX = async function runWorkflowX() {
  const temperatures = [180, 188, 195, 205];
  const holdTimes = [7000, 5000, 5000, 7000];
  const pumpTimes = [10000, 10000, 10000, 8000];

  log("========= START WORKFLOW X =========");
  try {
    await stopPump();
    await wait(300);
    await stopHeater();
    await wait(300);

    for (let i = 0; i < temperatures.length; i++) {
      updateProgressBar((i / temperatures.length) * 100);
      if (abortFlag.value) throw new Error("Aborted");
      const targetTemp = temperatures[i] * 10;
      const holdTime = holdTimes[i];
      const pumpTime = pumpTimes[i];
      log(`🧭 STEP ${i + 1}: Target ${temperatures[i]}°C, Hold ${holdTime}ms, Pump ${pumpTime}ms`);
      await stopPump();
      await wait(300);
      await setTemperature(targetTemp);
      await wait(2000);
      if (abortFlag.value) throw new Error("Aborted");
      await startHeater();
      await wait(500);
      await waitForTemp(targetTemp);
      if (abortFlag.value) throw new Error("Aborted");
      log(`⏳ Holding for ${holdTime}ms`);
      await wait(holdTime);
      if (pumpTime > 0) {
        log(`💨 Pumping for ${pumpTime}ms`);
        await startPumpOnly();
        await wait(pumpTime);
        await stopPump();
      } else {
        log("Skipping pump phase");
      }
      await wait(500);
    }
    await stopPump();
    await stopHeater();
    updateProgressBar(100);
    log("✅ Workflow X completed.");
  } catch (e) {
    if (e.message === "Aborted") {
      log("❌ Workflow X aborted.");
      await stopPump();
      await stopHeater();
    } else {
      log("⚠️ Error during Workflow X: " + e);
    }
  }
};
