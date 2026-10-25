import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation.jsx';
import DashboardTab from './components/DashboardTab.jsx';
import AudioToIslTab from './components/AudioToIslTab.jsx';
import IslToSpeechTab from './components/IslToSpeechTab.jsx';
import DictionaryTab from './components/DictionaryTab.jsx';
import { MicRecorder } from './utils/audioRecorder.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [versions, setVersions] = useState({
    electron: '-',
    chrome: '-',
    node: '-',
    platform: '-'
  });
  const [backendStatus, setBackendStatus] = useState({ state: 'checking', message: 'Connecting to FastAPI...' });
  const [speechInput, setSpeechInput] = useState('');
  const [selectedLang, setSelectedLang] = useState('Auto Detect');
  const [isTranslating, setIsTranslating] = useState(false);
  const [demoOutput, setDemoOutput] = useState({
    text: 'मेरा नाम प्रभाव है',
    detected_language: 'hi',
    language_probability: 0.96,
    tokens: ['MERA', 'NAM', 'PRABHAV'],
    gloss: 'MERA NAM PRABHAV [ISL GLOSS]',
    animations: [
      { token: 'I / My', type: 'word_sign', label: 'My', hindi: 'मेरा', pose: 'me', duration: 1200 },
      { token: 'Name', type: 'word_sign', label: 'Name', hindi: 'नाम', pose: 'name', duration: 1200 },
      { token: 'Prabhav', type: 'fingerspelling', label: 'Prabhav', hindi: 'प्रभाव', pose: 'prabhav', duration: 1200 },
      { token: 'IS', type: 'word_sign', label: 'IS', hindi: 'है', pose: 'good', duration: 600 }
    ]
  });
  const [gestureOutput, setGestureOutput] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const recorderRef = useRef(null);
  const timerRef = useRef(null);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/health');
      if (res.ok) {
        const data = await res.json();
        setBackendStatus({ state: 'online', message: `FastAPI Online (${data.service})` });
      } else {
        setBackendStatus({ state: 'offline', message: `FastAPI HTTP ${res.status}` });
      }
    } catch {
      setBackendStatus({ state: 'offline', message: 'FastAPI Offline' });
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

  const handleTranslateDemo = async () => {
    if (!speechInput.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/audio-to-isl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: speechInput,
          language: selectedLang
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDemoOutput({
          text: data.original_text,
          detected_language: data.language,
          tokens: data.tokens,
          gloss: data.isl_gloss,
          animations: data.animations || []
        });
      }
    } catch (err) {
      console.error('Translation error:', err);
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
        const recorded = await recorderRef.current.stop();
        let result = null;
        const rawBuf = recorded?.arrayBuffer || recorded?.buffer;
        const audioBlob = recorded?.blob || (rawBuf ? new Blob([rawBuf], { type: recorded?.mimeType || 'audio/webm' }) : null);
        const langCode = selectedLang === 'Hindi' ? 'hi' : selectedLang === 'English' ? 'en' : null;

        if (window.electronAPI && typeof window.electronAPI.transcribeAudioBuffer === 'function' && rawBuf) {
          result = await window.electronAPI.transcribeAudioBuffer(
            rawBuf,
            'recording.webm',
            langCode,
            recorded.mimeType || 'audio/webm'
          );
        } else if (audioBlob) {
          const form = new FormData();
          form.append('audio', audioBlob, 'recording.webm');
          if (langCode) form.append('language', langCode);

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
            text: result.text,
            detected_language: result.detected_language,
            language_probability: result.language_probability,
            tokens: result.tokens,
            gloss: result.isl_gloss || result.gloss,
            animations: result.animations || []
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
        alert(`Microphone error: ${err.message || 'Permission denied'}`);
      }
    }
  };

  const handleTestGestureAPI = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/isl-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gesture_hint: 'name' })
      });
      if (res.ok) {
        const data = await res.json();
        setGestureOutput(data);
      }
    } catch {
      setGestureOutput({
        gesture_id: 'name',
        recognized_text_en: 'My name is Prabhav',
        recognized_text_hi: 'मेरा नाम प्रभाव है',
        speech: 'My name is Prabhav',
        confidence: 0.92,
        status: 'simulated'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-row overflow-x-hidden font-sans">
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      <div className="flex-1 min-h-screen flex flex-col overflow-y-auto">
        <header className="h-16 px-8 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-500">
            <span className="font-semibold text-slate-800">Mudra AI</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              MVP
            </span>
            <span>&bull;</span>
            <span className="text-slate-900 uppercase font-semibold">{activeTab}</span>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-10 w-full max-w-6xl mx-auto">
          {activeTab === 'overview' && (
            <DashboardTab
              onSelectTab={setActiveTab}
              backendStatus={backendStatus}
            />
          )}

          {activeTab === 'audio-to-isl' && (
            <AudioToIslTab
              speechInput={speechInput}
              onSpeechInputChange={setSpeechInput}
              selectedLang={selectedLang}
              onLangChange={setSelectedLang}
              isTranslating={isTranslating}
              onTranslate={handleTranslateDemo}
              output={demoOutput}
              isRecording={isRecording}
              recordingDuration={recordingDuration}
              audioVolume={audioVolume}
              onStartRecording={handleToggleRecord}
              onStopRecording={handleToggleRecord}
              isProcessingAudio={isProcessingAudio}
            />
          )}

          {activeTab === 'isl-to-speech' && (
            <IslToSpeechTab
              gestureOutput={gestureOutput}
              onTestGestureApi={handleTestGestureAPI}
            />
          )}

          {activeTab === 'dictionary' && (
            <DictionaryTab />
          )}
        </main>
      </div>
    </div>
  );
}
