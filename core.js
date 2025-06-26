// core.js

export let abortFlag = { value: false };

let characteristicWriteTempV;
let characteristicHeaterOnV;
let characteristicHeaterOffV;
let characteristicVolcanoPumpOn;
let characteristicIsPumpOffV;
let characteristicCurrTempV;

export async function volcanoConnect() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["10100000-5354-4f52-5a26-4249434b454c"]
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("10100000-5354-4f52-5a26-4249434b454c");

    characteristicWriteTempV = await service.getCharacteristic("10110003-5354-4f52-5a26-4249434b454c");
    characteristicHeaterOnV = await service.getCharacteristic("1011000f-5354-4f52-5a26-4249434b454c");
    characteristicHeaterOffV = await service.getCharacteristic("10110010-5354-4f52-5a26-4249434b454c");
    characteristicVolcanoPumpOn = await service.getCharacteristic("10110013-5354-4f52-5a26-4249434b454c");
    characteristicIsPumpOffV = await service.getCharacteristic("10110014-5354-4f52-5a26-4249434b454c");
    characteristicCurrTempV = await service.getCharacteristic("10110001-5354-4f52-5a26-4249434b454c");

    document.getElementById("status").innerText = `✅ Connected to ${device.name}`;
    log(`Connected to ${device.name}`);
  } catch (err) {
    document.getElementById("status").innerText = `❌ Connection failed: ${err.message}`;
    log("❌ Connection error: " + err);
  }
}

export function log(message) {
  const logElem = document.getElementById("log");
  if (logElem) {
    logElem.innerText += message + "\n";
    logElem.scrollTop = logElem.scrollHeight;
  } else {
    console.log(message);
  }
}

export async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function setTemperature(temp) {
  const buffer = new Uint8Array(2);
  buffer[0] = temp & 0xff;
  buffer[1] = (temp >> 8) & 0xff;
  await characteristicWriteTempV.writeValue(buffer);
}

export async function startHeater() {
  await characteristicHeaterOnV.writeValue(new Uint8Array([0]));
}

export async function stopHeater() {
  await characteristicHeaterOffV.writeValue(new Uint8Array([0]));
}

export async function startPumpOnly() {
  await characteristicVolcanoPumpOn.writeValue(new Uint8Array([0]));
}

export async function stopPump() {
  await characteristicIsPumpOffV.writeValue(new Uint8Array([0]));
}

export async function waitForTemp(target) {
  const maxWait = 60 * 1000; // 60s timeout
  const interval = 1000;
  const startTime = Date.now();

  while (true) {
    const value = await characteristicCurrTempV.readValue();
    const current = value.getUint16(0, true);
    log(`🌡 Current temp: ${current / 10}°C`);

    if (current >= target) break;
    if (Date.now() - startTime > maxWait) throw new Error("Timeout waiting for temperature");
    if (abortFlag.value) throw new Error("Aborted");

    await wait(interval);
  }
}

export function updateProgressBar(percent) {
  const bar = document.getElementById("progress");
  if (bar) bar.style.width = `${percent}%`;
}
