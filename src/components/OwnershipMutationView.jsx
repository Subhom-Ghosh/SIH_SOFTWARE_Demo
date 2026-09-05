import React, { useState } from 'react';
import {
  BookOpenCheck,
  Plus,
  FileText,
  GitBranch,
  Calendar
} from 'lucide-react';

export const OwnershipMutationView = ({
  mutations = [],
  parcels = [],
  onSelectParcel,
  onNavigate,
  currentUser = { id: 'USR-01', name: 'Alok Mishra' },
  onAddMutation
}) => {
  const [activeTab, setActiveTab] = useState('khasra');
  const [selectedParcelId, setSelectedParcelId] = useState(parcels[0]?.id || 'p-101');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Mutation Form State
  const [mutationType, setMutationType] = useState('Inheritance (Virasat)');
  const [applicantName, setApplicantName] = useState('');
  const [currentOwner, setCurrentOwner] = useState('');
  const [areaAffected, setAreaAffected] = useState('0.50');
  const [docRef, setDocRef] = useState('');

  const selectedParcel = parcels.find(p => p.id === selectedParcelId) || parcels[0];

  const handleCreateMutation = (e) => {
    e.preventDefault();
    const newMut = {
      id: `MUT-${Date.now().toString().slice(-4)}`,
      parcelId: selectedParcel.id,
      plotNumber: selectedParcel.plotNumber,
      mutationType,
      applicantName,
      previousOwner: currentOwner || selectedParcel.ownerName,
      newOwner: applicantName,
      affectedAreaAcre: parseFloat(areaAffected) || 0.5,
      affectedAreaSqM: Math.round((parseFloat(areaAffected) || 0.5) * 4046.86),
      filingDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      documentReference: docRef || `REG-${Math.floor(100000 + Math.random() * 900000)}/2026`,
      remarks: 'Application filed for field resurvey and boundary partition by revenue court.'
    };

    if (onAddMutation) {
      onAddMutation(newMut);
    }
    setShowAddModal(false);
    setApplicantName('');
    alert(`Mutation petition ${newMut.id} filed successfully for plot ${newMut.plotNumber}.`);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-[calc(100vh-80px)] text-slate-100 space-y-6 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Digital Record of Rights (RoR 7/12 & Khasra-Khatauni)
              </h2>
              <p className="text-xs text-slate-400">
                Official statutory register under UP Revenue Code, unrecorded inheritance mutations, and title chain records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="file-new-mutation-btn"
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>File Mutation / Batwara Petition</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('khasra')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'khasra'
              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Khasra Record Extract</span>
        </button>

        <button
          onClick={() => setActiveTab('mutations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'mutations'
              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Mutation Registry ({mutations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Chain of Title Timeline</span>
        </button>
      </div>

      {/* Tab 1: Khasra Extract */}
      {activeTab === 'khasra' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Parcel Picker */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="text-xs font-bold text-slate-300">Select Land Parcel:</div>
            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {parcels.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedParcelId(p.id);
                    if (onSelectParcel) onSelectParcel(p);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer ${
                    selectedParcelId === p.id
                      ? 'bg-slate-800 border-emerald-500/60 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white font-mono">{p.plotNumber}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.khataNumber}</span>
                  </div>
                  <div className="text-slate-300 mt-1 truncate">{p.ownerName}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>{p.recordedAreaAcre} Acre</span>
                    <span className={p.surveyStatus === 'Verified' ? 'text-emerald-400' : 'text-rose-400'}>
                      {p.surveyStatus}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Khasra Extract Sheet */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            {/* National Revenue Header Format */}
            <div className="border-b-2 border-slate-800 pb-4 text-center">
              <div className="text-[11px] uppercase font-bold tracking-widest text-emerald-400">
                Department of Land Resources &bull; Government of West Bengal
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                খতিয়ান নকল / Form 7-12 Record of Rights
              </h3>
              <div className="text-xs text-slate-400 mt-0.5">
                Village: <span className="text-slate-200 font-semibold">{selectedParcel.village} (Code: 20491)</span> &bull; Tehsil: {selectedParcel.tehsil} &bull; Fasli Year: 1431-1436
              </div>
            </div>

            {/* Official Khasra Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-800">Khata # (খাতা)</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Khasra / Plot #</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Landholder (খাতেদার)</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Tenure Classification</th>
                    <th className="py-2.5 px-3 border-r border-slate-800">Recorded Area</th>
                    <th className="py-2.5 px-3">Land Revenue (খাজনা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr>
                    <td className="py-3 px-3 border-r border-slate-800 font-mono font-bold text-white">
                      {selectedParcel.khataNumber}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-800 font-mono font-bold text-emerald-400">
                      {selectedParcel.plotNumber}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-800 font-semibold">
                      {selectedParcel.ownerName}
                      {selectedParcel.coOwners && (
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          সহ-খাতেদার: {selectedParcel.coOwners.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 border-r border-slate-800">
                      হস্তান্তরযোগ্য ভূমিধারী (Bhumidhar with Transferable Rights)
                    </td>
                    <td className="py-3 px-3 border-r border-slate-800 font-mono text-amber-300">
                      {selectedParcel.recordedAreaAcre} Ac ({selectedParcel.recordedAreaSqM} m²)
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400">₹42.50 / annum</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Resurvey & Modern Survey Status in Ledger */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Resurvey Ground Audit Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedParcel.surveyStatus === 'Verified' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {selectedParcel.surveyStatus}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                Modern DGPS/RTK surveyed area: <span className="font-mono text-cyan-300 font-semibold">{selectedParcel.surveyedAreaAcre || selectedParcel.recordedAreaAcre} Acre</span>. 
                {selectedParcel.mismatchDetails ? ` ${selectedParcel.mismatchDetails}` : ' Boundaries conform to field markers.'}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => onNavigate('compare')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Inspect Cadastral GIS Vector
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Apply for Batwara / Partition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Mutation Registry Table */}
      {activeTab === 'mutations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Mutation ID</th>
                  <th className="py-3 px-4">Plot #</th>
                  <th className="py-3 px-4">Mutation Type</th>
                  <th className="py-3 px-4">Transfer From</th>
                  <th className="py-3 px-4">Transfer To</th>
                  <th className="py-3 px-4">Affected Area</th>
                  <th className="py-3 px-4">Filing Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Document Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {mutations.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{m.id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{m.plotNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{m.mutationType}</td>
                    <td className="py-3 px-4 text-slate-400">{m.previousOwner}</td>
                    <td className="py-3 px-4 font-semibold text-white">{m.newOwner}</td>
                    <td className="py-3 px-4 font-mono text-amber-300">{m.affectedAreaAcre} Ac</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{m.filingDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'Approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : m.status === 'Pending'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{m.documentReference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Statutory Chain of Title History for Plot {selectedParcel.plotNumber}</span>
          </h3>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
            <div className="relative flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 z-10">
                1
              </div>
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">First Cadastral Settlement Record</span>
                  <span className="text-slate-500 font-mono">1952 (1359 Fasli)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Original consolidation allotment recorded in Bandobast register under Zamindari Abolition Act. Recorded area: {selectedParcel.recordedAreaAcre} Acres.
                </p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 z-10">
                2
              </div>
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">Succession / Virasat Mutation</span>
                  <span className="text-slate-500 font-mono">2004</span>
                </div>
                <p className="text-xs text-slate-400">
                  Title transmitted by succession to {selectedParcel.ownerName}.
                </p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 z-10">
                3
              </div>
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">DILRMP High-Precision Drone & RTK Resurvey</span>
                  <span className="text-cyan-400 font-mono font-bold">2026 (Modern)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Modern drone photogrammetry and DGPS rovers captured physical field boundary with 2cm GSD.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: File Mutation Petition */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-emerald-400" />
                <span>File Revenue Mutation / Batwara Petition</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMutation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Land Parcel:</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedParcel.plotNumber} - ${selectedParcel.ownerName} (${selectedParcel.recordedAreaAcre} Ac)`}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-400 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mutation Type:</label>
                <select
                  value={mutationType}
                  onChange={(e) => setMutationType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="Inheritance (Virasat)">Inheritance (Virasat / উত্তরাধিকার)</option>
                  <option value="Sale Deed (Bainama)">Sale Deed (Bainama / বিক্রয় দলিল)</option>
                  <option value="Partition (Batwara)">Partition (Batwara / বণ্টন)</option>
                  <option value="Gift / Danpatra">Gift / Danpatra (দানপত্র)</option>
                  <option value="Court Decree">Revenue Court Decree</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Applicant / New Titleholder:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Verma"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Affected Area (Acres):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={areaAffected}
                    onChange={(e) => setAreaAffected(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sub-Registrar Registry / Will Doc Reference:</label>
                <input
                  type="text"
                  placeholder="e.g. REG-BK1-2026/8941"
                  value={docRef}
                  onChange={(e) => setDocRef(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg cursor-pointer"
                >
                  Submit Petition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
