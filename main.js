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

window.connect = async function () {
  await volcanoConnect();
};


window.abortWorkflow = () => abortFlag.value = true;

window.runWorkflowX = async function runWorkflowX() {
  const temperatures = [182, 192, 201, 220];
  const holdTimes = [10000, 7000, 5000, 3000];
  const pumpTimes = [10000, 12000, 10000, 10000];

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
