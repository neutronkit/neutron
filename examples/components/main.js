const {app, BrowserWindow} = require('electron');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
      height: 600,
      width: 900,
      frame: false
  });

  mainWindow.loadURL('http://localhost:9001');
});
