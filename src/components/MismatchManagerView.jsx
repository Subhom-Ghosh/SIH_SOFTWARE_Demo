import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  FileSpreadsheet
} from 'lucide-react';

export const MismatchManagerView = ({
  mismatches = [],
  parcels = [],
  onSelectParcel,
  onNavigate,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredMismatches = mismatches.filter((m) => {
    const matchesSearch =
      searchQuery === '' ||
      m.plotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'All' || m.severity === severityFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesType = typeFilter === 'All' || m.mismatchType === typeFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const exportCSV = () => {
    const headers = 'Mismatch ID,Plot Number,Owner Name,Type,Recorded Area,Surveyed Area,Area Delta,Severity,Status,Assigned Officer\n';
    const rows = filteredMismatches
      .map(m => `"${m.id}","${m.plotNumber}","${m.ownerName}","${m.mismatchType}","${m.recordedValue}","${m.surveyedValue}","${m.areaDifferenceAcre} Ac","${m.severity}","${m.status}","${m.assignedOfficer || 'Unassigned'}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kalyanpur_land_mismatch_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 bg-slate-950 min-h-[calc(100vh-80px)] text-slate-100 space-y-6 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Mismatch & Discrepancy Resolution Management
              </h2>
              <p className="text-xs text-slate-400">
                Automated detection of boundary shifts, area shrinkages, informal partitions, and public encroachment anomalies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="export-mismatch-csv-btn"
            onClick={exportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Plot (P-125), Owner Name, Mismatch ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="text-slate-400 text-[11px] font-semibold">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="text-slate-400 text-[11px] font-semibold">Resolution:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="In Review">In Review</option>
            <option value="Field Verified">Field Verified</option>
            <option value="Correction Proposed">Correction Proposed</option>
            <option value="Dispute Raised">Dispute Raised</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Mismatch Type Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="text-slate-400 text-[11px] font-semibold">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Area Mismatch">Area Mismatch</option>
            <option value="Boundary Shift">Boundary Shift</option>
            <option value="Encroachment">Encroachment</option>
            <option value="Unrecorded Mutation">Unrecorded Mutation</option>
            <option value="Disputed Boundary">Disputed Boundary</option>
          </select>
        </div>
      </div>

      {/* Mismatches List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Plot #</th>
                <th className="py-3 px-4">Owner & Village</th>
                <th className="py-3 px-4">Mismatch Category</th>
                <th className="py-3 px-4">Recorded vs Surveyed</th>
                <th className="py-3 px-4">Area Delta</th>
                <th className="py-3 px-4">IoU Overlap</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Resolution Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredMismatches.map((m) => {
                const targetParcel = parcels.find(p => p.id === m.parcelId || p.plotNumber === m.plotNumber);
                return (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-white font-mono text-sm">{m.plotNumber}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{m.id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{m.ownerName}</div>
                      <div className="text-[10px] text-slate-400">Kalyanpur (Khata {targetParcel?.khataNumber || 'K-44'})</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-rose-300">{m.mismatchType}</div>
                      <div className="text-[11px] text-slate-400 max-w-xs truncate">{m.description}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-amber-300">Rec: {m.recordedValue}</div>
                      <div className="text-cyan-300">Sur: {m.surveyedValue}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                      {m.areaDifferenceAcre > 0 ? `+${m.areaDifferenceAcre}` : m.areaDifferenceAcre} Ac
                      <div className="text-[10px] font-normal">({m.areaDifferencePercent}%)</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                      {m.boundaryIoU ? `${m.boundaryIoU}%` : '88.5%'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        m.severity === 'Critical'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : m.severity === 'High'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {m.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={m.status}
                        onChange={(e) => onUpdateStatus && onUpdateStatus(m.id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-[11px] font-semibold text-white rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="Pending Verification">Pending Verification</option>
                        <option value="In Review">In Review</option>
                        <option value="Field Verified">Field Verified</option>
                        <option value="Correction Proposed">Correction Proposed</option>
                        <option value="Dispute Raised">Dispute Raised</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            if (targetParcel && onSelectParcel) onSelectParcel(targetParcel);
                            onNavigate('compare');
                          }}
                          className="bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 font-semibold px-2.5 py-1 rounded-lg transition-all text-xs cursor-pointer"
                          title="Open GIS Geometry Comparison"
                        >
                          Compare
                        </button>
                        <button
                          onClick={() => {
                            if (targetParcel && onSelectParcel) onSelectParcel(targetParcel);
                            onNavigate('field-verification');
                          }}
                          className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-2.5 py-1 rounded-lg transition-all text-xs cursor-pointer"
                          title="Launch Field Officer Mode"
                        >
                          Verify
                        </button>
                      </div>
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
