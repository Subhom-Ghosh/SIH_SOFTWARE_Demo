import React from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  BookOpenCheck,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const LAND_TYPE_COLORS = {
  'Agricultural': '#10b981',
  'Residential': '#38bdf8',
  'Commercial': '#fbbf24',
  'Pasture / Grazing': '#a3e635',
  'Waterbody / Pond': '#06b6d4',
  'Forest / Barren': '#2dd4bf'
};

export const DashboardView = ({
  stats,
  mismatches = [],
  parcels = [],
  onNavigate,
  onSelectParcel,
  onRefreshStats
}) => {
  // Chart 1: Verification Status Data
  const statusPieData = [
    { name: 'Verified', value: stats?.verifiedParcels || 0, color: '#10b981' },
    { name: 'Pending Surveys', value: stats?.pendingSurveys || 0, color: '#f59e0b' },
    { name: 'Mismatch Flagged', value: stats?.mismatchedParcels || 0, color: '#f43f5e' },
    { name: 'Disputed (Court)', value: stats?.disputedParcels || 0, color: '#ec4899' }
  ];

  // Chart 2: Mismatch Types Breakdown
  const mismatchBarData = Object.entries(stats?.mismatchTypeCounts || {}).map(([type, count]) => ({
    type: type.replace(' / Pending Mutation', '').replace('Parcels', ''),
    count
  }));

  // Chart 3: Land Classification
  const landTypeData = Object.entries(stats?.landTypeCounts || {}).map(([type, count]) => ({
    name: type.split(' ')[0],
    count,
    color: LAND_TYPE_COLORS[type] || '#10b981'
  }));

  return (
    <div className="p-6 bg-slate-950 min-h-[calc(100vh-80px)] text-slate-100 space-y-6 overflow-y-auto">
      {/* Top Welcome & Village Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Gram Panchayat Madhabpur &bull; Block Bardhaman Sadar &bull; District Purba Bardhaman (WB)</span>
          </div>
          <h2 className="text-2xl font-black text-green-500 tracking-tight">
            Digital Land Resurvey & Mismatch Information System
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Comparing historical 1359F Cadastral field records with modern Drone Photogrammetry (2cm GSD) and DGPS/RTK ground coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="dash-open-gis-map-btn"
            onClick={() => onNavigate('map')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Open Interactive GIS Map</span>
          </button>
          <button
            id="dash-refresh-btn"
            onClick={onRefreshStats}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Live Metrics"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Parcels */}
        <div 
          onClick={() => onNavigate('map')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold mb-1">
            <span>Total Parcels</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats?.totalParcels || 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{stats?.totalCadastralAreaAcre || 0} Total Acres</div>
        </div>

        {/* Verified Parcels */}
        <div 
          onClick={() => onNavigate('map')}
          className="bg-slate-900 border border-emerald-900/50 hover:border-emerald-700/60 rounded-2xl p-4 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-emerald-400 text-[11px] font-semibold mb-1">
            <span>Verified Ground</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">{stats?.verifiedParcels || 0}</div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">
            {Math.round(((stats?.verifiedParcels || 0) / (stats?.totalParcels || 1)) * 100)}% Resurveyed
          </div>
        </div>

        {/* Pending Surveys */}
        <div 
          onClick={() => onNavigate('map')}
          className="bg-slate-900 border border-amber-900/50 hover:border-amber-700/60 rounded-2xl p-4 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-amber-400 text-[11px] font-semibold mb-1">
            <span>Pending Survey</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">{stats?.pendingSurveys || 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting Flight</div>
        </div>

        {/* Mismatched Parcels */}
        <div 
          onClick={() => onNavigate('mismatches')}
          className="bg-slate-900 border border-rose-900/60 hover:border-rose-700/80 rounded-2xl p-4 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-rose-400 text-[11px] font-semibold mb-1">
            <span>Mismatches</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-300 font-mono">{stats?.mismatchedParcels || 0}</div>
          <div className="text-[10px] text-rose-400/90 mt-0.5">Requires Verification</div>
        </div>

        {/* Disputed Parcels */}
        <div 
          onClick={() => onNavigate('mismatches')}
          className="bg-slate-900 border border-pink-900/60 hover:border-pink-700/80 rounded-2xl p-4 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-pink-400 text-[11px] font-semibold mb-1">
            <span>Disputed</span>
            <ShieldAlert className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-pink-300 font-mono">{stats?.disputedParcels || 0}</div>
          <div className="text-[10px] text-pink-400/90 mt-0.5">Revenue Court</div>
        </div>

        {/* Mutation Pending */}
        <div 
          onClick={() => onNavigate('mutations')}
          className="bg-slate-900 border border-indigo-900/50 hover:border-indigo-700/60 rounded-2xl p-4 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-indigo-400 text-[11px] font-semibold mb-1">
            <span>Mutations</span>
            <BookOpenCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">{stats?.mutationPending || 0}</div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">Virasat / Batwara</div>
        </div>

        {/* Possible Encroachment */}
        <div 
          onClick={() => onNavigate('mismatches')}
          className="bg-slate-900 border border-red-900/60 hover:border-red-700/80 rounded-2xl p-4 shadow-md cursor-pointer transition-all hover:scale-[1.02] col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-red-400 text-[11px] font-semibold mb-1">
            <span>Encroachments</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-300 font-mono">{stats?.possibleEncroachments || 0}</div>
          <div className="text-[10px] text-red-400/90 mt-0.5">Chak Road / Pond</div>
        </div>
      </div>

      {/* 4 Interactive Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Resurvey Verification Status (Donut) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Cadastral Resurvey Status Distribution</span>
              </h3>
              <p className="text-[11px] text-slate-400">Proportion of verified, mismatched and disputed rural plots</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
              {stats?.totalSurveyCoveragePercent || 0}% Coverage
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Mismatch Types Breakdown (Bar) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Anomalies & Mismatch Categories</h3>
              <p className="text-[11px] text-slate-400">Automated classification from GIS spatial difference engine</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mismatchBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="type" stroke="#64748b" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Flagged Parcels" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Land Classification (Bar) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Land-Use & Revenue Classification</h3>
              <p className="text-[11px] text-slate-400">Distribution across Agricultural, Abadi, Commercial, and Gram Sabha</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={landTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Parcels Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Monthly Survey Velocity (Area) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Survey Progress & Verification Velocity</h3>
              <p className="text-[11px] text-slate-400">Cumulative parcels surveyed vs ground verified</p>
            </div>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18% Monthly</span>
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyProgress || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSurveyed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="surveyed" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSurveyed)" name="Total Surveyed" />
                <Area type="monotone" dataKey="verified" stroke="#10b981" fillOpacity={1} fill="url(#colorVerified)" name="Verified" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Action Table: Critical Discrepancies Requiring Field Officer Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Priority Flagged Land Parcels Awaiting Verification</span>
            </h3>
            <p className="text-[11px] text-slate-400">High & critical discrepancies detected between digital cadastre and modern RTK resurvey</p>
          </div>
          <button
            onClick={() => onNavigate('mismatches')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Mismatches ({mismatches.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Plot #</th>
                <th className="py-2.5 px-3">Title Owner</th>
                <th className="py-2.5 px-3">Mismatch Type</th>
                <th className="py-2.5 px-3">Recorded Area</th>
                <th className="py-2.5 px-3">Surveyed Area</th>
                <th className="py-2.5 px-3">Area Delta</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {mismatches.slice(0, 5).map((m) => {
                const targetParcel = parcels.find(p => p.id === m.parcelId || p.plotNumber === m.plotNumber);
                return (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-rose-500 font-mono">{m.plotNumber}</td>
                    <td className="py-3 px-3 font-medium text-slate-300">{m.ownerName}</td>
                    <td className="py-3 px-3">
                      <span className="text-rose-500 font-semibold">{m.mismatchType}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-500">{m.recordedValue}</td>
                    <td className="py-3 px-3 font-mono text-cyan-500">{m.surveyedValue}</td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-400">
                      {m.areaDifferenceAcre > 0 ? `+${m.areaDifferenceAcre}` : m.areaDifferenceAcre} Ac ({m.areaDifferencePercent}%)
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.severity === 'Critical' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {m.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => {
                          if (targetParcel) onSelectParcel(targetParcel);
                          onNavigate('compare');
                        }}
                        className=" bg-blue-200 hover:bg-emerald-300 hover:text-white text-slate-300 font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        Compare GIS
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
