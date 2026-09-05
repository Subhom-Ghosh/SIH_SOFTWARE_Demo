import React from 'react';
import { Plane, Radio, Satellite, ShieldCheck } from 'lucide-react';

export const SurveyManagementView = ({ surveys = [], onNavigate }) => {
  return (
    <div className="p-6 bg-slate-950 min-h-[calc(100vh-80px)] text-slate-100 space-y-6 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Survey Mission Logs & RTK GNSS Calibration Registry
              </h2>
              <p className="text-xs text-slate-400">
                Drone photogrammetry flight telemetry, CORS reference base stations, and RTK Rover raw observations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>CORS BASE: BARDHAMAN-03 ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Calibration Stations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Satellite className="w-4 h-4 text-emerald-400" />
              <span>CORS Base Reference</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              FIXED
            </span>
          </div>
          <div className="text-sm font-bold text-slate-200">SOI CORS Station Bardhaman</div>
          <div className="text-xs text-slate-400 font-mono">Lat: 23.2476° N, Lng: 87.8539° E</div>
          <div className="text-[11px] text-emerald-400">Positional Accuracy: ±0.008 m (8mm)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-indigo-400" />
              <span>Survey Drone Fleet</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
              DGCA Certified
            </span>
          </div>
          <div className="text-sm font-bold text-slate-200">Trinity F90+ & DJI Matrice 300 RTK</div>
          <div className="text-xs text-slate-400">Sensor: 42MP Full Frame RGB + PPK GNSS</div>
          <div className="text-[11px] text-indigo-300">Ground Sampling Distance: 2.0 cm/pixel</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Survey Verification Rate</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              DILRMP
            </span>
          </div>
          <div className="text-sm font-bold text-slate-200">28 Village Plots Surveyed</div>
          <div className="text-xs text-slate-400">Survey Agency: Survey of India & UP Revenue Dept</div>
          <div className="text-[11px] text-cyan-300">Quality Checked: 100% Geometry Passed</div>
        </div>
      </div>

      {/* Survey Missions Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-5">
        <h3 className="text-sm font-bold text-white mb-3">Field Survey Mission Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Mission ID</th>
                <th className="py-3 px-4">Plot Target</th>
                <th className="py-3 px-4">Survey Type</th>
                <th className="py-3 px-4">Surveyor</th>
                <th className="py-3 px-4">Survey Date</th>
                <th className="py-3 px-4">Calculated Area</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Equipment</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {surveys.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">{s.id}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{s.plotNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">{s.surveyType}</td>
                  <td className="py-3 px-4 text-slate-300">{s.surveyorName}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{s.surveyDate}</td>
                  <td className="py-3 px-4 font-mono text-cyan-300">{s.surveyedAreaAcre} Acre</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">{s.accuracyToleranceMeters}m</td>
                  <td className="py-3 px-4 text-slate-400">{s.equipmentUsed}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                      {s.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
