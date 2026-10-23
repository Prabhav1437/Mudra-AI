import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Sparkles } from 'lucide-react';
import SignVisualizer from './SignVisualizer.jsx';

export default function DictionaryTab() {
  const [dictionary, setDictionary] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('words');
  const [previewAnimation, setPreviewAnimation] = useState([]);
  const [selectedWord, setSelectedWord] = useState('HELLO');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/isl/dictionary')
      .then((res) => res.json())
      .then((data) => {
        setDictionary(data);
        handleSelectWord('HELLO', data.words?.['HELLO']);
      })
      .catch((err) => console.error('Failed to load dictionary:', err));
  }, []);

  const handleSelectWord = (key, data) => {
    setSelectedWord(key);
    if (!data) return;
    setPreviewAnimation([
      {
        token: key,
        type: 'word_sign',
        label: data.label || key,
        hindi: data.hindi || key,
        pose: data.pose || 'namaste',
        duration: 1200
      }
    ]);
  };

  const handleSelectLetter = (letter) => {
    setSelectedWord(letter);
    setPreviewAnimation([
      {
        token: letter,
        type: 'fingerspelling',
        label: `Fingerspelling '${letter}'`,
        hindi: letter,
        pose: `letter_${letter.toLowerCase()}`,
        duration: 800
      }
    ]);
  };

  const filteredWords = Object.entries(dictionary?.words || {}).filter(([key, val]) => {
    const q = searchQuery.toLowerCase();
    return (
      key.toLowerCase().includes(q) ||
      val.label.toLowerCase().includes(q) ||
      val.hindi.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Indian Sign Language Dictionary</h2>
              <p className="text-xs text-slate-400">
                Interactive reference guide for signs, fingerspelling &amp; numbers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
              {[
                { id: 'words', label: 'Common Signs' },
                { id: 'letters', label: 'Alphabet (A-Z)' },
                { id: 'numbers', label: 'Numbers (0-9)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    activeCategory === tab.id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            {activeCategory === 'words' && (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search signs in English or Hindi (e.g. Hello, Water, पानी)..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredWords.map(([key, val]) => {
                    const isSelected = selectedWord === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectWord(key, val)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-lg shadow-purple-600/10'
                            : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="text-xs font-bold text-white font-mono">{key}</div>
                        <div className="text-[11px] text-purple-300 mt-0.5">{val.label}</div>
                        <div className="text-[10px] text-slate-400 font-hindi">{val.hindi}</div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {activeCategory === 'letters' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Select any letter to view fingerspelling demonstration:
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {dictionary?.letters?.map((letter) => {
                    const isSelected = selectedWord === letter;
                    return (
                      <button
                        key={letter}
                        onClick={() => handleSelectLetter(letter)}
                        className={`p-3 rounded-xl border text-center font-bold font-mono text-base transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                            : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeCategory === 'numbers' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Select any digit to view fingerspelling demonstration:
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  {dictionary?.numbers?.map((num) => {
                    const isSelected = selectedWord === num;
                    return (
                      <button
                        key={num}
                        onClick={() => handleSelectLetter(num)}
                        className={`p-4 rounded-xl border text-center font-bold font-mono text-xl transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                            : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Selected Sign Preview
              </div>
              <div className="text-lg font-bold text-white mt-1 font-mono">
                {selectedWord}
              </div>
            </div>

            <SignVisualizer animations={previewAnimation} />
          </div>
        </div>
      </div>
    </div>
  );
}
