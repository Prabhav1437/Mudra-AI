import React, { useState, useEffect } from 'react';
import { AlertCircle, MessageSquare, Play, Sparkles, Train, Volume2 } from 'lucide-react';
import SignVisualizer from './SignVisualizer.jsx';

export default function AnnouncementsTab({ onSelectTextForTranslation }) {
  const [categories, setCategories] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [translatedData, setTranslatedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.railway && data.railway.length > 0) {
          handlePlayAnnouncement(data.railway[0]);
        }
      })
      .catch((err) => console.error('Failed to load announcements:', err));
  }, []);

  const handlePlayAnnouncement = async (item) => {
    setSelectedAnnouncement(item);
    setIsLoading(true);

    const queryText = selectedLang === 'Hindi' ? item.hi : item.en;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/audio-to-isl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: queryText, language: selectedLang })
      });

      if (res.ok) {
        const data = await res.json();
        setTranslatedData(data);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const speakCurrent = () => {
    if (!selectedAnnouncement || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = selectedLang === 'Hindi' ? selectedAnnouncement.hi : selectedAnnouncement.en;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang === 'Hindi' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Public Accessibility &amp; Railway Announcements</h2>
              <p className="text-xs text-slate-400">
                Instant bidirectional translation and ISL visualization for high-traffic environments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
              {['English', 'Hindi'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setSelectedLang(lang);
                    if (selectedAnnouncement) {
                      setTimeout(() => handlePlayAnnouncement(selectedAnnouncement), 50);
                    }
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    selectedLang === lang ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={speakCurrent}
              disabled={!selectedAnnouncement}
              className="p-2 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 text-amber-400 transition-all"
              title="Speak announcement"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Train className="w-3.5 h-3.5 text-amber-400" />
                Railway Station Announcements
              </div>

              <div className="grid gap-2">
                {categories?.railway?.map((item) => {
                  const isSelected = selectedAnnouncement?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePlayAnnouncement(item)}
                      className={`w-full p-3.5 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="text-xs font-bold text-amber-300">{item.title}</div>
                      <div className="text-xs text-slate-200 mt-1 font-medium">
                        {selectedLang === 'Hindi' ? item.hi : item.en}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Emergency &amp; Medical Broadcasts
              </div>

              <div className="grid gap-2">
                {categories?.emergency?.map((item) => {
                  const isSelected = selectedAnnouncement?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePlayAnnouncement(item)}
                      className={`w-full p-3.5 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-lg shadow-rose-500/10'
                          : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="text-xs font-bold text-rose-300">{item.title}</div>
                      <div className="text-xs text-slate-200 mt-1 font-medium">
                        {selectedLang === 'Hindi' ? item.hi : item.en}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Everyday Conversations
              </div>

              <div className="grid gap-2">
                {categories?.conversation?.map((item) => {
                  const isSelected = selectedAnnouncement?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePlayAnnouncement(item)}
                      className={`w-full p-3.5 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-indigo-500/15 border-indigo-500/40 text-white shadow-lg shadow-indigo-500/10'
                          : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="text-xs font-bold text-indigo-300">{item.title}</div>
                      <div className="text-xs text-slate-200 mt-1 font-medium">
                        {selectedLang === 'Hindi' ? item.hi : item.en}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Announcement Translation
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {selectedAnnouncement ? (selectedLang === 'Hindi' ? selectedAnnouncement.hi : selectedAnnouncement.en) : 'Select an announcement'}
              </div>
              <div className="mt-2 text-xs font-mono text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                {translatedData?.isl_gloss || 'Loading ISL gloss...'}
              </div>
            </div>

            <SignVisualizer animations={translatedData?.animations || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
