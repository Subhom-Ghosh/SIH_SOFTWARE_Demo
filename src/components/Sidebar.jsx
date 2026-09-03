import React from 'react';
import {
  LayoutDashboard,
  Map,
  GitCompare,
  AlertTriangle,
  Smartphone,
  BookOpenCheck,
  Sparkles,
  Plane,
  FileCode2,
  Database,
  RefreshCw
} from 'lucide-react';

export const Sidebar = ({
  activeView,
  onNavigate,
  mismatchCount = 0,
  onAutoDetect,
  isDetecting = false
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      subtitle: 'Overview & Resurvey Velocity',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'map',
      label: 'Interactive GIS Map',
      subtitle: 'Cadastral & Drone Mosaic',
      icon: Map,
      badge: null
    },
    {
      id: 'compare',
      label: 'Old vs New Resurvey',
      subtitle: 'Geometric Discrepancy Analyzer',
      icon: GitCompare,
      badge: null
    },
    {
      id: 'mismatches',
      label: 'Mismatch Resolution',
      subtitle: 'Boundary & Area Anomalies',
      icon: AlertTriangle,
      badge: mismatchCount > 0 ? mismatchCount : null,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 'field-verification',
      label: 'Field Officer Mobile Mode',
      subtitle: 'On-Site GPS & Photo Evidence',
      icon: Smartphone,
      badge: 'Live'
    },
    {
      id: 'mutations',
      label: 'Ownership & Mutations',
      subtitle: 'Khasra-Khatauni 7/12 RoR',
      icon: BookOpenCheck,
      badge: null
    },
    {
      id: 'ai-segmentation',
      label: 'AI Aerial Boundary Lab',
      subtitle: 'Drone CV & Boundary Vectorizer',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-indigo-500'
    },
    {
      id: 'surveys',
      label: 'Survey Missions & RTK',
      subtitle: 'DGPS, Drone Flights & Logs',
      icon: Plane,
      badge: null
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-80px)] select-none">
      {/* Navigation List */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Resurvey Workflow
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-950/40 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70 font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs truncate">{item.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    item.badgeColor ? `${item.badgeColor} text-white` : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom GIS Engine Status & Auto-Detect Trigger */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 mb-2">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <Database className="w-3.5 h-3.5" />
              <span>GIS Geometry Engine</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              WGS84
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Auto-compares cadastral shapefiles against RTK & drone vectors.
          </p>

          <button
            id="recalculate-gis-mismatches-btn"
            onClick={onAutoDetect}
            disabled={isDetecting}
            className="mt-2.5 w-full bg-slate-700 hover:bg-slate-600 active:bg-slate-500 disabled:opacity-50 text-slate-100 text-xs font-semibold py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isDetecting ? 'Analyzing Geometry...' : 'Run GIS Re-Analysis'}</span>
          </button>
        </div>

        <div className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
          <span>Survey Paradigm:</span>
          <span className="text-emerald-400 font-semibold">Detect → Compare → Verify → Update</span>
        </div>
      </div>
    </aside>
  );
};
