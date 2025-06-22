// === Globale Zustände ===
export const abortFlag = { value: false };

// === Warten mit Promise ===
export async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// === Logging ===
export function log(message) {
  const logBox = document.getElementById("log");
  const entry = document.createElement("div");
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logBox.appendChild(entry);
  logBox.scrollTop = logBox.scrollHeight;
}

// === Fortschrittsbalken ===
export function updateProgressBar(percent) {
  document.getElementById("progressBar").style.width = `${percent}%`;
}

// === Temperatur setzen (Dummy – muss durch echten Befehl ersetzt werden) ===
export async function setTemperature(target) {
  log(`🌡️ Setting target temperature to ${target / 10}°C`);
  // TODO: Send actual BLE command to device
}

// === Heizung starten ===
export async function startHeater() {
  log("🔥 Starting heater");
  // TODO: Implement heater BLE command
}

// === Heizung stoppen ===
export async function stopHeater() {
  log("🛑 Stopping heater");
  // TODO: Implement heater BLE command
}

// === Pumpe starten ===
export async function startPumpOnly() {
  log("💨 Starting pump");
  // TODO: Implement pump BLE command
}

// === Pumpe stoppen ===
export async function stopPump() {
  log("🧯 Stopping pump");
  // TODO: Implement pump BLE command
}

// === Temperatur abwarten (Dummy) ===
export async function waitForTemp(target) {
  log(`🔎 Waiting for device to reach ${target / 10}°C`);
  // TODO: Replace with actual temperature check loop using BLE values
  await wait(5000); // Placeholder wait
}

// === Workflow abbrechen ===
export function abortWorkflow() {
  log("⚠️ Abort signal received.");
  abortFlag.value = true;
}
