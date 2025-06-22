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
  updateProgressBar
} from './core.js';


import { volcanoConnect } from './core.js';

function connect() {
  volcanoConnect();
}

window.connect = connect;


export async function runManualWorkflow() {
  const temps = document.getElementById("tempInput").value.split(',').map(n => parseInt(n.trim()));
  const holds = document.getElementById("holdInput").value.split(',').map(n => parseInt(n.trim()));
  const pumps = document.getElementById("pumpInput").value.split(',').map(n => parseInt(n.trim()));

  if (!(temps.length === holds.length && holds.length === pumps.length)) {
    alert("All arrays must be the same length.");
    return;
  }

  log("========= START MANUAL WORKFLOW =========");

  try {
    await stopPump();
    await wait(300);
    await stopHeater();
    await wait(300);

    for (let i = 0; i < temps.length; i++) {
      updateProgressBar((i / temps.length) * 100);
      if (abortFlag.value) throw new Error("Aborted");

      const targetTemp = temps[i] * 10;
      const holdTime = holds[i];
      const pumpTime = pumps[i];

      log(`🧭 STEP ${i + 1}: Target ${temps[i]}°C, Hold ${holdTime}ms, Pump ${pumpTime}ms`);

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
    log("✅ Manual workflow completed.");
  } catch (e) {
    if (e.message === "Aborted") {
      log("❌ Manual workflow aborted.");
      await stopPump();
      await stopHeater();
    } else {
      log("⚠️ Error during manual workflow: " + e);
    }
  }
}
