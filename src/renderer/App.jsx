import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import Navigation from './components/Navigation.jsx';
import DashboardTab from './components/DashboardTab.jsx';
import AudioToIslTab from './components/AudioToIslTab.jsx';
import IslToSpeechTab from './components/IslToSpeechTab.jsx';
import AnnouncementsTab from './components/AnnouncementsTab.jsx';
import DictionaryTab from './components/DictionaryTab.jsx';
import Footer from './components/Footer.jsx';
import { MicRecorder } from './utils/audioRecorder.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [versions, setVersions] = useState({
    electron: '-',
    chrome: '-',
    node: '-',
    platform: '-'
  });
  const [ipcStatus, setIpcStatus] = useState({ state: 'idle', message: 'Ready to test bridge' });
  const [backendStatus, setBackendStatus] = useState({ state: 'checking', message: 'Checking backend...' });
  const [speechInput, setSpeechInput] = useState('');
  const [selectedLang, setSelectedLang] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [demoOutput, setDemoOutput] = useState(null);
  const [gestureOutput, setGestureOutput] = useState(null);
  const [sttTestResult, setSttTestResult] = useState(null);
  const [isTestingStt, setIsTestingStt] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const recorderRef = useRef(null);
  const timerRef = useRef(null);

  const checkBackendHealth = async () => {
    setBackendStatus({ state: 'checking', message: 'Connecting to FastAPI (port 8000)...' });
    try {
      const res = await fetch('http://127.0.0.1:8000/api/health');
      if (res.ok) {
        const data = await res.json();
        setBackendStatus({ state: 'online', message: `FastAPI Online (${data.service})` });
      } else {
        setBackendStatus({ state: 'offline', message: `FastAPI HTTP ${res.status}` });
      }
    } catch {
      setBackendStatus({ state: 'offline', message: 'FastAPI Offline (Run npm run backend)' });
    }
  };

  useEffect(() => {
    if (window.electronAPI && typeof window.electronAPI.getVersions === 'function') {
      try {
        const v = window.electronAPI.getVersions();
        setVersions(v);
      } catch (err) {
        console.error('Failed to get versions:', err);
      }
    }
    checkBackendHealth();
  }, []);

  const handleTestIPC = async () => {
    if (window.electronAPI && typeof window.electronAPI.ping === 'function') {
      setIpcStatus({ state: 'loading', message: 'Pinging main process...' });
      const start = performance.now();
      try {
        const res = await window.electronAPI.ping();
        const duration = Math.round(performance.now() - start);
        setIpcStatus({
          state: 'success',
          message: `IPC response: "${res.toUpperCase()}" (${duration}ms)`
        });
      } catch (error) {
        setIpcStatus({
          state: 'error',
          message: `Error: ${error.message}`
        });
      }
    } else {
      setIpcStatus({
        state: 'error',
        message: 'Electron IPC API unavailable in web mode'
      });
    }
  };

  const handleTranslateDemo = async () => {
    if (!speechInput.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/audio-to-isl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechInput, language: selectedLang })
      });
      if (res.ok) {
        const data = await res.json();
        setDemoOutput({
          tokens: data.tokens,
          gloss: data.isl_gloss || data.gloss,
          animations: data.animations || [],
          source: 'FastAPI ISL Grammar Engine'
        });
      } else {
        throw new Error('Backend failed');
      }
    } catch {
      const words = speechInput.trim().split(' ').map((w) => w.toUpperCase());
      setDemoOutput({
        tokens: words,
        gloss: speechInput.toUpperCase() + ' [ISL GLOSS]',
        animations: words.map((w) => ({ token: w, type: 'word_sign', label: w, hindi: w, pose: 'default', duration: 1000 })),
        source: 'Client Fallback'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleToggleRecord = async () => {
    if (isRecording) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);
      setIsProcessingAudio(true);

      try {
        const { arrayBuffer, mimeType, filename } = await recorderRef.current.stop();
        let result = null;

        if (window.electronAPI && typeof window.electronAPI.transcribeAudioBuffer === 'function') {
          result = await window.electronAPI.transcribeAudioBuffer(
            arrayBuffer,
            filename,
            selectedLang,
            mimeType
          );
        } else {
          const form = new FormData();
          form.append('audio', new Blob([arrayBuffer], { type: mimeType }), filename);
          if (selectedLang) form.append('language', selectedLang);

          const res = await fetch('http://127.0.0.1:8000/api/stt/transcribe', {
            method: 'POST',
            body: form
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          result = await res.json();
        }

        if (result && result.text) {
          setSpeechInput(result.text);
          setDemoOutput({
            tokens: result.tokens,
            gloss: result.isl_gloss || result.gloss,
            animations: result.animations || [],
            source: `Whisper STT (${result.detected_language})`
          });
        }
      } catch (err) {
        console.error('Audio transcription error:', err);
      } finally {
        setIsProcessingAudio(false);
        setAudioVolume(0);
        recorderRef.current = null;
      }
    } else {
      try {
        const recorder = new MicRecorder({
          onVolume: (vol) => setAudioVolume(vol)
        });
        await recorder.start();
        recorderRef.current = recorder;
        setIsRecording(true);
        setRecordingDuration(0);

        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error('Failed to access microphone:', err);
        alert(`Microphone access error: ${err.message}`);
      }
    }
  };

  const handleTestGestureAPI = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/isl-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gesture_hint: 'namaste' })
      });
      if (res.ok) {
        const data = await res.json();
        setGestureOutput(data);
      }
    } catch {
      setGestureOutput({
        gesture_id: 'namaste',
        recognized_text_en: 'Namaste / Hello',
        recognized_text_hi: 'नमस्ते',
        speech: 'Namaste, hello',
        confidence: 0.95,
        status: 'simulated'
      });
    }
  };

  const handleTestSTT = async () => {
    setIsTestingStt(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/stt/test', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setSttTestResult({ state: 'success', data });
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      setSttTestResult({ state: 'error', message: err.message });
    } finally {
      setIsTestingStt(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans overflow-hidden">
      <div className="pointer-events-none fixed -top-24 -right-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed -bottom-24 -left-12 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />

      <Header backendStatus={backendStatus} onRefreshBackend={checkBackendHealth} />

      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col gap-6">
        {activeTab === 'overview' && (
          <DashboardTab
            versions={versions}
            ipcStatus={ipcStatus}
            backendStatus={backendStatus}
            onTestIpc={handleTestIPC}
            onRefreshBackend={checkBackendHealth}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'audio-to-isl' && (
          <AudioToIslTab
            speechInput={speechInput}
            setSpeechInput={setSpeechInput}
            selectedLang={selectedLang}
            setSelectedLang={setSelectedLang}
            isTranslating={isTranslating}
            demoOutput={demoOutput}
            onTranslate={handleTranslateDemo}
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            audioVolume={audioVolume}
            onToggleRecord={handleToggleRecord}
            isProcessingAudio={isProcessingAudio}
            sttTestResult={sttTestResult}
            isTestingStt={isTestingStt}
            onRunSttTest={handleTestSTT}
          />
        )}

        {activeTab === 'isl-to-speech' && (
          <IslToSpeechTab
            gestureOutput={gestureOutput}
            onTestGestureApi={handleTestGestureAPI}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsTab />
        )}

        {activeTab === 'dictionary' && (
          <DictionaryTab />
        )}
      </main>

      <Footer />
    </div>
  );
}
