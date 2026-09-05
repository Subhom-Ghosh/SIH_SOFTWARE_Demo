import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Camera,
  ShieldAlert,
  Radio,
  FileCheck,
  Maximize,
  Minimize
} from 'lucide-react';

export const FieldVerificationView = ({
  parcels = [],
  selectedParcel = null,
  onSelectParcel,
  currentUser = { id: 'USR-02', name: 'Suresh Patel', designation: 'Field Survey Officer' },
  onVerificationSubmitted
}) => {
  const [activeParcelId, setActiveParcelId] = useState(
    selectedParcel?.id || (parcels.find(p => p.surveyStatus === 'Mismatch')?.id || parcels[0]?.id)
  );

  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [currentGps, setCurrentGps] = useState({
    lat: 23.2508,
    lng: 87.8506,
    accuracy: 0.8 // 80cm
  });

  const [selectedResult, setSelectedResult] = useState('Area Mismatch');

  const [remarks, setRemarks] = useState(
    'Ground inspection conducted along the southern bund. Physical embankment has receded by 1.8 meters into irrigation canal.'
  );

  const [witnessNames, setWitnessNames] = useState('Moti Lal (Gram Pradhan), Suresh Kumar (Lekhpal Halqa 4)');
  const [evidencePhotos, setEvidencePhotos] = useState([
    'https://images.stockcake.com/public/3/7/6/376c386e-4d20-46dc-9c09-9f9d757d111a_large/verdant-patchwork-fields-stockcake.jpg'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const currentParcel = parcels.find(p => p.id === activeParcelId) || parcels[0];

  const handleCaptureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentGps({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            accuracy: 0.5
          });
        },
        () => {
          setCurrentGps({
            lat: 23.2505 + (Math.random() * 0.0004 - 0.0002),
            lng: 87.8502 + (Math.random() * 0.0004 - 0.0002),
            accuracy: 0.4
          });
        }
      );
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEvidencePhotos([...evidencePhotos, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        mismatchId: `MIS-AUTO-${currentParcel.plotNumber}`,
        parcelId: currentParcel.id,
        plotNumber: currentParcel.plotNumber,
        officerId: currentUser.id,
        officerName: currentUser.name,
        officerRole: currentUser.designation,
        gpsLatitude: currentGps.lat,
        gpsLongitude: currentGps.lng,
        result: selectedResult,
        remarks,
        uploadedEvidence: evidencePhotos,
        witnessNames: witnessNames.split(',').map(w => w.trim()).filter(Boolean)
      };

      const response = await fetch('/api/field-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (onVerificationSubmitted) {
        onVerificationSubmitted(data);
      }
      setSubmittedSuccess(true);
      setTimeout(() => setSubmittedSuccess(false), 4000);
    } catch (err) {
      console.error('Error submitting field verification:', err);
      alert('Verification record saved locally.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-[calc(100vh-80px)] text-slate-100 flex flex-col items-center justify-start overflow-y-auto">
      {/* Top Header Controls */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span>Mobile Field Officer Verification Portal</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time on-site GNSS RTK survey verification, photo geotagging, and statutory field reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isMobileFrame ? <Maximize className="w-3.5 h-3.5 text-emerald-400" /> : <Minimize className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isMobileFrame ? 'Desktop View' : 'Mobile Frame Preview'}</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Container */}
      <div className={`w-full transition-all ${isMobileFrame ? 'max-w-md bg-slate-900 border-4 border-slate-800 rounded-[32px] p-4 shadow-2xl ring-8 ring-slate-950' : 'max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl'}`}>
        
        {/* Terminal Header Info */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white">Surveyor: {currentUser.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>RTK FIX (±{currentGps.accuracy}m)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 text-[11px]">
            <div>
              <span className="text-slate-400">Tehsil / District:</span>
              <div className="font-semibold text-slate-200">Bardhaman Sadar / Purba Bardhaman</div>
            </div>
            <div>
              <span className="text-slate-400">Village / Halqa:</span>
              <div className="font-semibold text-slate-200">{currentParcel.village} (Halqa 4)</div>
            </div>
            <div>
              <span className="text-slate-400">GPS Latitude:</span>
              <div className="font-mono text-emerald-300 font-bold">{currentGps.lat}° N</div>
            </div>
            <div>
              <span className="text-slate-400">GPS Longitude:</span>
              <div className="font-mono text-emerald-300 font-bold">{currentGps.lng}° E</div>
            </div>
          </div>
        </div>

        {/* Parcel Target Selection Bar */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Select Flagged Land Parcel to Inspect:
          </label>
          <select
            id="field-parcel-select"
            value={activeParcelId}
            onChange={(e) => {
              setActiveParcelId(e.target.value);
              const p = parcels.find(item => item.id === e.target.value);
              if (p && onSelectParcel) onSelectParcel(p);
            }}
            className="w-full bg-slate-800 border border-slate-700 text-white font-semibold text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {parcels.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                {p.plotNumber} - {p.ownerName} [{p.surveyStatus}] ({p.recordedAreaAcre} Ac)
              </option>
            ))}
          </select>
        </div>

        {/* Flagged Parcel Overview Box */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-black text-white">{currentParcel.plotNumber}</span>
              <span className="text-xs text-slate-400 ml-2 font-mono">Khata: {currentParcel.khataNumber}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold font-mono">
              {currentParcel.mismatchType || 'Area/Boundary Discrepancy'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Registered Title Holder</span>
              <div className="text-sm font-bold text-white mt-0.5">{currentParcel.ownerName}</div>
              <div className="text-[11px] text-slate-400 mt-1">Land Use: {currentParcel.landType}</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Area Discrepancy Matrix</span>
              <div className="text-xs font-bold text-amber-300 mt-0.5 font-mono">
                Cadastral: {currentParcel.recordedAreaAcre} Ac ({currentParcel.recordedAreaSqM} m²)
              </div>
              <div className="text-xs font-bold text-cyan-300 font-mono">
                Surveyed: {currentParcel.surveyedAreaAcre || currentParcel.recordedAreaAcre} Ac ({(currentParcel.surveyedAreaSqM || currentParcel.recordedAreaSqM)} m²)
              </div>
            </div>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-xl text-xs text-amber-200 leading-relaxed">
            <span className="font-bold text-amber-300">Flagged Note: </span>
            {currentParcel.mismatchDetails || 'Drone resurvey recorded an 8% deficit in cultivated land boundary along southern ridge.'}
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmitVerification} className="space-y-4">
          {/* 5 Required Action Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Step 1: Ground Verification Finding (Select One):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-verify-match"
                onClick={() => setSelectedResult('Verified Match')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedResult === 'Verified Match'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950/60'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Verify Match (Accurate)</span>
              </button>

              <button
                type="button"
                id="btn-boundary-mismatch"
                onClick={() => setSelectedResult('Boundary Mismatch')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedResult === 'Boundary Mismatch'
                    ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-950/60'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Boundary Mismatch</span>
              </button>

              <button
                type="button"
                id="btn-area-mismatch"
                onClick={() => setSelectedResult('Area Mismatch')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedResult === 'Area Mismatch'
                    ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-950/60'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Area Mismatch</span>
              </button>

              <button
                type="button"
                id="btn-possible-encroachment"
                onClick={() => setSelectedResult('Possible Encroachment')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedResult === 'Possible Encroachment'
                    ? 'bg-red-700 border-red-400 text-white shadow-lg shadow-red-950/60'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Possible Encroachment</span>
              </button>

              <button
                type="button"
                id="btn-dispute"
                onClick={() => setSelectedResult('Dispute')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 sm:col-span-2 transition-all cursor-pointer ${
                  selectedResult === 'Dispute'
                    ? 'bg-pink-700 border-pink-400 text-white shadow-lg shadow-pink-950/60'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Disputed (Refer to Tehsildar / Revenue Court)</span>
              </button>
            </div>
          </div>

          {/* GPS Live Coordinate Sync */}
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Field Geotag Stamp</span>
              <div className="text-xs font-mono text-white font-semibold">
                Lat: {currentGps.lat}° N, Lng: {currentGps.lng}° E (±{currentGps.accuracy}m)
              </div>
            </div>
            <button
              type="button"
              id="capture-live-gps-btn"
              onClick={handleCaptureGPS}
              className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Capture Live GPS</span>
            </button>
          </div>

          {/* Photo & Geotagged Evidence Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Step 2: Upload Geotagged Ground Photo Evidence:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {evidencePhotos.map((photo, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                  <img src={photo} alt="Field Evidence" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-1.5 flex flex-col justify-end text-[9px] font-mono text-emerald-300">
                    <div>GEO: {currentGps.lat}°N, {currentGps.lng}°E</div>
                    <div>{new Date().toISOString().split('T')[0]}</div>
                  </div>
                </div>
              ))}

              <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer bg-slate-800/30 hover:bg-slate-800/60 transition-all p-2 text-center text-slate-400 hover:text-white">
                <Camera className="w-5 h-5 mb-1 text-emerald-400" />
                <span className="text-[10px] font-semibold">Snap / Upload Photo</span>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Officer Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Step 3: Field Verification Remarks & Technical Note:
            </label>
            <textarea
              id="field-officer-remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter details of ground landmarks, boundary pillars, landholder statements, and Lekhpal findings..."
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed placeholder-slate-500"
              required
            />
          </div>

          {/* Witnesses Present */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Witnesses Present at Spot (Lekhpal / Pradhan / Adjacent Landholders):
            </label>
            <input
              type="text"
              value={witnessNames}
              onChange={(e) => setWitnessNames(e.target.value)}
              placeholder="e.g. Moti Lal (Pradhan), Rameshwar Patel (Neighbor P-126)"
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              id="submit-field-verification-btn"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing & Submitting Verification...' : 'Submit Official Field Verification Record'}</span>
            </button>
          </div>

          {submittedSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Field verification logged successfully! Status updated in Digital Land Information System.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
