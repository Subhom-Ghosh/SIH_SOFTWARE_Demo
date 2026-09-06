import React from 'react';
import { MapPin, Radio, Sparkles, Layers } from 'lucide-react';

export const Navbar = ({
  currentUser,
  onNavigate,
  activeView,
  mismatchCount = 0
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-slate-100 shadow-md">
      {/* Top Banner with National Emblem & Project Identity */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-900 animate-ping"></span>
          <span className="font-semibold text-emerald-500">DILRMP & SVAMITVA Integrated Resurvey Platform</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Revenue & Land Reforms Cadastral GIS</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>RTK DGPS: FIXED (±1.2 cm)</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-amber-100">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>Madhabpur, Block Bardhaman Sadar, Purba Bardhaman (W.B.)</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div 
          id="brand-logo-btn"
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 p-0.5 shadow-lg shadow-emerald-900/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <img
                src="/assets/aistudio/image.png"
                alt="BhuRaksha logo"
                className="w-5 h-5 object-contain group-hover:scale-110 transition-transform"
              />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-emerald-800 flex items-center gap-1.5">
                <span>BhuRaksha</span>
                <span className="text-xs  px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-900 border border-emerald-800/30 font-mono font-normal">ভূরক্ষা</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Rural Land Survey & Resurvey System</p>
          </div>
        </div>

        {/* Center Quick Navigation Shortcuts */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
          <button
            id="nav-map-btn"
            onClick={() => onNavigate('map')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeView === 'map' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Cadastral GIS Map
          </button>
          <button
            id="nav-compare-btn"
            onClick={() => onNavigate('compare')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeView === 'compare' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Old vs New Survey
          </button>
          <button
            id="nav-mismatches-btn"
            onClick={() => onNavigate('mismatches')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeView === 'mismatches' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span>Mismatches</span>
            {mismatchCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {mismatchCount}
              </span>
            )}
          </button>
          <button
            id="nav-field-btn"
            onClick={() => onNavigate('field-verification')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeView === 'field-verification' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Field Verification
          </button>
          <button
            id="nav-ai-btn"
            onClick={() => onNavigate('ai-segmentation')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
              activeView === 'ai-segmentation' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-700 hover:text-blue-300 hover:bg-slate-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
            <span>AI Aerial Lab</span>
          </button>
        </div>
      </div>
    </header>
  );
};
