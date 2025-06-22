// core.js

export let characteristicVolcanoPumpOn;
export let characteristicIsPumpOffV;
export let characteristicWriteTempV;
export let characteristicHeaterOnV;
export let characteristicHeaterOffV;
export let characteristicCurrTempV;

export const abortFlag = { value: false };

export function log(msg) {
  const logDiv = document.getElementById("log");
  const time = new Date().toLocaleTimeString();
  logDiv.innerHTML += `[${time}] ${msg}<br>`;
  logDiv.scrollTop = logDiv.scrollHeight;
}

export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function setTemperature(tempValue) {
  const buffer = new Uint8Array(2);
  buffer[0] = tempValue & 0xff;
  buffer[1] = (tempValue >> 8) & 0xff;
  await characteristicWriteTempV.writeValue(buffer);
  log(`🎯 Set target temperature to ${tempValue / 10}°C`);
}

export async function startHeater() {
  const buffer = new Uint8Array([0]);
  await characteristicHeaterOnV.writeValue(buffer);
  log("🔥 Heater started");
}

export async function stopHeater() {
  const buffer = new Uint8Array([0]);
  await characteristicHeaterOffV.writeValue(buffer);
  log("🧊 Heater stopped");
}

export async function startPumpOnly() {
  const buffer = new Uint8Array([0]);
  await characteristicVolcanoPumpOn.writeValue(buffer);
  log("💨 Pump started");
}

export async function stopPump() {
  const buffer = new Uint8Array([0]);
  await characteristicIsPumpOffV.writeValue(buffer);
  log("🛑 Pump stopped");
}

export async function waitForTemp(targetTemp) {
  const tolerance = 5;
  let stable = false;
  for (let i = 0; i < 60 && !stable; i++) {
    const value = await characteristicCurrTempV.readValue();
    const currentTemp = value.getUint16(0, true);
    const diff = Math.abs(currentTemp - targetTemp);
    if (diff <= tolerance) {
      stable = true;
    } else {
      await wait(1500);
    }
  }
  log("🌡️ Target temperature reached");
}

export function updateProgressBar(percent) {
  const bar = document.getElementById("progressBar");
  bar.style.width = `${percent}%`;
}

export async function volcanoConnect() {
  abortFlag.value = false;
  const filters = [{ namePrefix: "VOLCANO" }];
  const options = {
    filters,
    optionalServices: [
      "00001523-1212-efde-1523-785feabcd123",
      "00001524-1212-efde-1523-785feabcd123"
    ]
  };

  try {
    const device = await navigator.bluetooth.requestDevice(options);
    const server = await device.gatt.connect();

    const service = await server.getPrimaryService("00001523-1212-efde-1523-785feabcd123");

    characteristicVolcanoPumpOn = await service.getCharacteristic("10110013-5354-4f52-5a26-4249434b454c");
    characteristicIsPumpOffV   = await service.getCharacteristic("10110014-5354-4f52-5a26-4249434b454c");
    characteristicWriteTempV   = await service.getCharacteristic("10110003-5354-4f52-5a26-4249434b454c");
    characteristicHeaterOnV    = await service.getCharacteristic("10110010-5354-4f52-5a26-4249434b454c");
    characteristicHeaterOffV   = await service.getCharacteristic("10110011-5354-4f52-5a26-4249434b454c");
    characteristicCurrTempV    = await service.getCharacteristic("10110001-5354-4f52-5a26-4249434b454c");

    document.getElementById("status").innerText = `Status: Connected to ${device.name}`;
    log(`✅ Connected to ${device.name}`);
  } catch (err) {
    log("❌ Connection failed: " + err);
  }
}
