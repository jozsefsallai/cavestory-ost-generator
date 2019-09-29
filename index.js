const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

const ost = require('./OST');

let appWindow;

const init = () => {
  appWindow = new BrowserWindow({
    title: 'Cave Story OST Generator',
    width: 900,
    height: 640,
    icon: path.join(__dirname, 'resources', 'icon.png'),
    autoHideMenuBar: true,
    minWidth: 900,
    minHeight: 640
  });
  
  appWindow.loadFile(path.join(__dirname, 'views', 'index.html'));
  appWindow.setMenu(null);
  
  appWindow.on('closed', () => appWindow = null);
};

global.ost = ost;

app.setAppUserModelId('me.sallai.cavestory-ost-generator');

app.on('ready', () => {
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    appWindow.webContents.openDevTools();
  });

  return init();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (appWindow === null) {
    init();
  }
});
