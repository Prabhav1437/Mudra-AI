const { app, BrowserWindow, ipcMain, systemPreferences } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1040,
    height: 740,
    minWidth: 860,
    minHeight: 600,
    backgroundColor: '#07090e',
    title: 'Mudra AI',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    show: false
  });

  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      return callback(true);
    }
    callback(true);
  });

  if (isDev) {
    const devUrl = 'http://localhost:5173';
    const loadDev = () => {
      mainWindow.loadURL(devUrl).catch(() => {
        setTimeout(loadDev, 300);
      });
    };
    loadDev();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

ipcMain.handle('ping', () => 'pong');

ipcMain.handle('request-mic-permission', async () => {
  if (process.platform === 'darwin') {
    return await systemPreferences.askForMediaAccess('microphone');
  }
  return true;
});

ipcMain.handle('transcribe-audio-buffer', async (event, { audioBuffer, filename, language, mimeType }) => {
  try {
    const buffer = Buffer.from(audioBuffer);
    const form = new FormData();
    const type = mimeType || 'audio/webm';
    const fname = filename || 'mic_recording.webm';
    form.append('audio', new Blob([buffer], { type }), fname);
    if (language) {
      form.append('language', language);
    }

    const response = await fetch('http://127.0.0.1:8000/api/stt/transcribe', {
      method: 'POST',
      body: form
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`FastAPI responded with ${response.status}: ${errText}`);
    }

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
