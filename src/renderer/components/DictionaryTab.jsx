import React, { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
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
    <div className="space-y-6 max-w-6xl">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Indian Sign Language Dictionary</h2>
              <p className="text-xs text-slate-500">
                Interactive reference guide for signs, fingerspelling &amp; numbers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {[
              { id: 'words', label: 'Common Signs' },
              { id: 'letters', label: 'Alphabet (A-Z)' },
              { id: 'numbers', label: 'Numbers (0-9)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            {activeCategory === 'words' && (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search signs in English or Hindi (e.g. Hello, Water, पानी)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
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
                            ? 'bg-blue-50/80 border-blue-400 text-blue-950 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 font-mono">{key}</div>
                        <div className="text-[11px] text-blue-700 mt-0.5">{val.label}</div>
                        <div className="text-[10px] text-slate-500">{val.hindi}</div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {activeCategory === 'letters' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500">
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
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
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
                <div className="text-xs text-slate-500">
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
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
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
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Selected Sign Preview
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                {selectedWord}
              </div>
            </div>

            <SignVisualizer animationData={{ animations: previewAnimation }} />
          </div>
        </div>
      </div>
    </div>
  );
}
