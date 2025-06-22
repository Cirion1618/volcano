<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Volcano Hybrid Control</title>
  <style>
    body {
      font-family: sans-serif;
      background: #111;
      color: #eee;
      margin: 2em;
    }
    h1 {
      text-align: center;
      margin-bottom: 1em;
    }
    button {
      background-color: #333;
      color: #eee;
      border: 1px solid #555;
      padding: 0.8em 1.5em;
      margin: 0.5em;
      border-radius: 0.5em;
      cursor: pointer;
      font-size: 1em;
    }
    button:hover {
      background-color: #444;
    }
    #progressContainer {
      width: 100%;
      background-color: #333;
      border-radius: 5px;
      margin-top: 1em;
      height: 25px;
    }
    #progressBar {
      height: 100%;
      width: 0%;
      background-color: limegreen;
      border-radius: 5px;
      transition: width 0.4s ease;
    }
    #log {
      background-color: #222;
      padding: 1em;
      margin-top: 1em;
      max-height: 300px;
      overflow-y: auto;
      font-family: monospace;
      border-radius: 5px;
      border: 1px solid #444;
    }
    #status {
      margin-bottom: 1em;
      text-align: center;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>Volcano Hybrid Web Controller</h1>
  <div id="status">Status: Not connected</div>

  <div style="text-align: center;">
    <button onclick="connect()">🔌 Verbinden</button>
    <button onclick="runWorkflowX()">▶️ Start Workflow X</button>
    <button onclick="abortWorkflow()">⛔ Abbrechen</button>
  </div>

  <div id="progressContainer">
    <div id="progressBar"></div>
  </div>

  <div id="log">[System bereit]</div>

  <script type="module" src="./main.js"></script>
</body>
</html>
