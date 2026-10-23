import React from 'react';
import { BookOpen, Camera, Layers, Mic, Train } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Dashboard & Specs', icon: Layers },
  { id: 'audio-to-isl', label: 'Audio → ISL', icon: Mic },
  { id: 'isl-to-speech', label: 'ISL → Speech', icon: Camera },
  { id: 'announcements', label: 'Announcements', icon: Train },
  { id: 'dictionary', label: 'ISL Dictionary', icon: BookOpen }
];

export default function Navigation({ activeTab, onSelectTab }) {
  return (
    <div className="relative z-10 border-b border-white/5 bg-slate-900/30 backdrop-blur-sm px-6">
      <div className="max-w-6xl mx-auto flex gap-2 py-2 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
