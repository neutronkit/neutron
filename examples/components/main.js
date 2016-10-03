const {app, BrowserWindow} = require('electron');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
      height: 600,
      width: 800,
      frame: false,
      transparent: true
  });

  mainWindow.loadURL('http://localhost:9000');
});
