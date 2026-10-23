const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVersions: () => ({
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    platform: process.platform
  }),
  ping: () => ipcRenderer.invoke('ping'),
  requestMicPermission: () => ipcRenderer.invoke('request-mic-permission'),
  transcribeAudioBuffer: (audioBuffer, filename, language, mimeType) =>
    ipcRenderer.invoke('transcribe-audio-buffer', { audioBuffer, filename, language, mimeType })
});
