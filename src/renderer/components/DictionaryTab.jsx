import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Search, Image as ImageIcon, X, Play, Pause, SkipBack, SkipForward, RotateCcw, Sparkles } from 'lucide-react';

const GIF_MAP = {
  HELLO: '/isl_dataset/gifs/HELLO.gif',
  NAMASTE: '/isl_dataset/gifs/HELLO.gif',
  HELP: '/isl_dataset/gifs/HELP.gif',
  NAME: '/isl_dataset/gifs/NAME.gif',
  GOOD: '/isl_dataset/gifs/GOOD.gif',
  STATION: '/isl_dataset/gifs/STATION.gif',
  PLEASE: '/isl_dataset/gifs/PLEASE.gif',
  WELCOME: '/isl_dataset/gifs/WELCOME.gif'
};

const PHOTO_MAP = {
  ME: '/isl_dataset/words/ME.jpg',
  MY: '/isl_dataset/words/MY.jpg'
};

export default function DictionaryTab() {
  const [dictionary, setDictionary] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('words');
  const [selectedWord, setSelectedWord] = useState('HELLO');
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [letterStep, setLetterStep] = useState(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState(true);
  const [showChartModal, setShowChartModal] = useState(false);

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
    setSelectedItemData(data);
    setLetterStep(0);
    setIsPlayingSequence(true);
  };

  const handleSelectLetter = (letter) => {
    setSelectedWord(letter);
    setSelectedItemData({
      label: `Letter ${letter}`,
      hindi: letter,
      type: 'letter'
    });
    setLetterStep(0);
    setIsPlayingSequence(false);
  };

  const handleSelectNumber = (num) => {
    setSelectedWord(num);
    setSelectedItemData({
      label: `Number ${num}`,
      hindi: num,
      type: 'number'
    });
    setLetterStep(0);
    setIsPlayingSequence(false);
  };

  const isGifWord = Boolean(GIF_MAP[selectedWord]);
  const isPhotoWord = Boolean(PHOTO_MAP[selectedWord]);
  const isSingleLetter = selectedWord.length === 1 && /[A-Z]/i.test(selectedWord);
  const isSingleDigit = selectedWord.length === 1 && /[0-9]/.test(selectedWord);

  const wordLetters = !isGifWord && !isPhotoWord && !isSingleLetter && !isSingleDigit
    ? selectedWord.toUpperCase().split('').filter((c) => /[A-Z0-9]/.test(c))
    : [];

  useEffect(() => {
    if (!isPlayingSequence || wordLetters.length <= 1) return;
    const timer = setTimeout(() => {
      setLetterStep((prev) => (prev + 1) % wordLetters.length);
    }, 1200);
    return () => clearTimeout(timer);
  }, [isPlayingSequence, letterStep, wordLetters]);

  let currentBigImage = '/isl_dataset/words/HELLO.jpg';
  let activeDisplayLabel = selectedWord;

  if (isGifWord) {
    currentBigImage = GIF_MAP[selectedWord];
    activeDisplayLabel = selectedWord;
  } else if (isPhotoWord) {
    currentBigImage = PHOTO_MAP[selectedWord];
    activeDisplayLabel = selectedWord;
  } else if (isSingleLetter) {
    currentBigImage = `/isl_dataset/alphabets/${selectedWord.toUpperCase()}.jpg`;
    activeDisplayLabel = `Letter '${selectedWord.toUpperCase()}'`;
  } else if (isSingleDigit) {
    currentBigImage = `/isl_dataset/digits/${selectedWord}.jpg`;
    activeDisplayLabel = `Digit '${selectedWord}'`;
  } else if (wordLetters.length > 0) {
    const activeLetter = wordLetters[letterStep] || wordLetters[0];
    currentBigImage = `/isl_dataset/alphabets/${activeLetter}.jpg`;
    activeDisplayLabel = `${selectedWord} (Fingerspelling '${activeLetter}')`;
  }

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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Indian Sign Language Dictionary</h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Real Dataset Images
                </span>
              </div>
              <p className="text-xs text-slate-500">
                High-resolution authentic dataset photographs and animated sign demonstrations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowChartModal(true)}
              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Full ISL Chart</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[
                { id: 'words', label: 'Common Signs' },
                { id: 'letters', label: 'Alphabet (A-Z)' },
                { id: 'numbers', label: 'Numbers (0-9)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-4">
            {activeCategory === 'words' && (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search signs in English or Hindi (e.g. Hello, Water, Emergency)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {filteredWords.map(([key, val]) => {
                    const isSelected = selectedWord === key;
                    const hasGif = Boolean(GIF_MAP[key]);
                    const hasPhoto = Boolean(PHOTO_MAP[key]);
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectWord(key, val)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-500 text-blue-950 shadow-xs ring-1 ring-blue-400'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 font-mono">{key}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${
                              hasGif
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : hasPhoto
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {hasGif ? 'Video' : hasPhoto ? 'Photo' : 'Spelling'}
                          </span>
                        </div>
                        <div>
                          <div className="text-[11px] text-blue-700 font-semibold truncate">{val.label}</div>
                          <div className="text-[10px] text-slate-500">{val.hindi}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {activeCategory === 'letters' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Select any letter to view its actual ISL sign photo:</span>
                  <span className="font-mono text-[11px] text-blue-700 font-medium">26 Alphabets</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[480px] overflow-y-auto pr-1">
                  {dictionary?.letters?.map((letter) => {
                    const isSelected = selectedWord === letter;
                    const letterImg = `/isl_dataset/alphabets/${letter}.jpg`;
                    return (
                      <button
                        key={letter}
                        onClick={() => handleSelectLetter(letter)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs border-blue-600 ring-2 ring-blue-300'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full aspect-square rounded-lg bg-white overflow-hidden border border-slate-200/60 flex items-center justify-center">
                          <img
                            src={letterImg}
                            alt={letter}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <span className="font-bold font-mono text-sm">{letter}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeCategory === 'numbers' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Select any digit to view its actual ISL gesture photo:</span>
                  <span className="font-mono text-[11px] text-blue-700 font-medium">10 Digits</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {dictionary?.numbers?.map((num) => {
                    const isSelected = selectedWord === num;
                    const numImg = `/isl_dataset/digits/${num}.jpg`;
                    return (
                      <button
                        key={num}
                        onClick={() => handleSelectNumber(num)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs border-blue-600 ring-2 ring-blue-300'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full aspect-square rounded-lg bg-white overflow-hidden border border-slate-200/60 flex items-center justify-center">
                          <img
                            src={numImg}
                            alt={num}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <span className="font-bold font-mono text-base">{num}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Authentic ISL Gesture Display
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-0.5 font-mono">
                    {selectedWord}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-blue-600">
                    {selectedItemData?.label || selectedWord}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {selectedItemData?.hindi || ''}
                  </div>
                </div>
              </div>

              <div className="w-full h-[360px] sm:h-[400px] rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-4 relative shadow-inner">
                <img
                  key={currentBigImage}
                  src={currentBigImage}
                  alt={selectedWord}
                  className="max-w-full max-h-full object-contain rounded-xl drop-shadow-sm select-none"
                />

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-[11px] font-mono font-bold text-slate-700 shadow-2xs">
                  {isGifWord
                    ? 'AUTHENTIC ISL ANIMATION'
                    : isPhotoWord
                    ? 'AUTHENTIC GESTURE PHOTO'
                    : isSingleLetter || isSingleDigit
                    ? 'VERIFIED DATASET PHOTO'
                    : `FINGERSPELLING: ${wordLetters[letterStep] || 'A'}`}
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-blue-50/95 backdrop-blur-md border border-blue-200 text-[11px] font-mono font-bold text-blue-700 shadow-2xs">
                  {activeDisplayLabel}
                </div>
              </div>

              {wordLetters.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                      Fingerspelling Sequence ({letterStep + 1} of {wordLetters.length})
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setIsPlayingSequence(false);
                          setLetterStep((prev) => Math.max(0, prev - 1));
                        }}
                        disabled={letterStep === 0}
                        className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-700 transition-all"
                      >
                        <SkipBack className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsPlayingSequence(!isPlayingSequence)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all"
                      >
                        {isPlayingSequence ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        <span>{isPlayingSequence ? 'Pause' : 'Play'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsPlayingSequence(false);
                          setLetterStep((prev) => Math.min(wordLetters.length - 1, prev + 1));
                        }}
                        disabled={letterStep === wordLetters.length - 1}
                        className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-700 transition-all"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {wordLetters.map((char, idx) => {
                      const isActive = idx === letterStep;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setIsPlayingSequence(false);
                            setLetterStep(idx);
                          }}
                          className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-xs scale-105'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {char}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="font-medium text-slate-700">Official Indian Sign Language Standard</span>
                <span className="font-mono text-blue-600">ISL 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showChartModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Official Indian Sign Language Reference Chart</h3>
                  <p className="text-xs text-slate-500">Comprehensive hand postures and fingerspelling standard</p>
                </div>
              </div>
              <button
                onClick={() => setShowChartModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-slate-100 flex items-center justify-center">
              <img
                src="/isl_dataset/reference/ISL_Sign_Chart.png"
                alt="Official ISL Sign Chart"
                className="max-w-full h-auto rounded-lg shadow-sm border border-slate-300"
              />
            </div>

            <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
              <span>Source: Official ISL Hand Gesture Repository (2.95 MB High Resolution)</span>
              <button
                onClick={() => setShowChartModal(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all"
              >
                Close Chart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
