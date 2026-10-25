export class MicRecorder {
  constructor(options = {}) {
    this.stream = null;
    this.mediaRecorder = null;
    this.chunks = [];
    this.onVolume = options.onVolume || null;
    this.audioContext = null;
    this.analyser = null;
    this.animId = null;
  }

  async start() {
    if (window.electronAPI && typeof window.electronAPI.requestMicPermission === 'function') {
      try {
        await window.electronAPI.requestMicPermission();
      } catch (err) {
        console.warn('Mic permission error:', err);
      }
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    if (this.onVolume) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const buffer = new Uint8Array(this.analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length / 255;
        this.onVolume(Math.min(1, avg * 2.8));
        this.animId = requestAnimationFrame(updateVolume);
      };
      this.animId = requestAnimationFrame(updateVolume);
    }

    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    }

    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };
    this.mediaRecorder.start(100);
  }

  async stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
      this.analyser = null;
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('MediaRecorder not initialized'));
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const mime = this.mediaRecorder.mimeType || 'audio/webm';
          const blob = new Blob(this.chunks, { type: mime });
          const arrayBuffer = await blob.arrayBuffer();
          if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
          }
          resolve({
            arrayBuffer,
            buffer: arrayBuffer,
            blob,
            mimeType: mime,
            filename: 'mic_recording.webm'
          });
        } catch (err) {
          reject(err);
        }
      };

      this.mediaRecorder.stop();
    });
  }
}
