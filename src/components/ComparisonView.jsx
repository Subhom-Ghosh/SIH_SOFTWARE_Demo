import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { compareParcels } from '../utils/gisCalculations';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCheck,
  Smartphone
} from 'lucide-react';

export const ComparisonView = ({
  parcels = [],
  selectedParcel = null,
  onSelectParcel,
  onNavigate
}) => {
  const [activeParcelId, setActiveParcelId] = useState(
    selectedParcel ? selectedParcel.id : (parcels.find(p => p.surveyStatus === 'Mismatch')?.id || parcels[0]?.id)
  );

  const [viewMode, setViewMode] = useState('split');
  const [overlaySlider, setOverlaySlider] = useState(50); // 0 = 100% Cadastral, 100 = 100% Resurvey

  const currentParcel = parcels.find(p => p.id === activeParcelId) || parcels[0];
  const hasMismatch = currentParcel?.surveyStatus === 'Mismatch' || currentParcel?.surveyStatus === 'Disputed';
  const isPendingVerification = currentParcel?.surveyStatus === 'Pending Verification';

  // GIS comparison computation
  const comparison = currentParcel && currentParcel.surveyedGeometry
    ? compareParcels(currentParcel.cadastralGeometry, currentParcel.surveyedGeometry, currentParcel.recordedAreaAcre)
    : {
        recordedAreaAcre: currentParcel?.recordedAreaAcre || 1.0,
        surveyedAreaAcre: currentParcel?.recordedAreaAcre || 1.0,
        cadAreaSqM: currentParcel?.recordedAreaSqM || 4047,
        surAreaSqM: currentParcel?.recordedAreaSqM || 4047,
        diffAreaAcre: 0,
        diffPercent: 0,
        iouPercent: 100,
        overlapPercent: 100,
        mismatchType: 'None',
        severity: 'Low',
        encroachmentGeom: undefined,
        isMismatch: false
      };

  // Map references
  const leftMapRef = useRef(null);
  const rightMapRef = useRef(null);
  const overlayMapRef = useRef(null);

  const leftMapInstance = useRef(null);
  const rightMapInstance = useRef(null);
  const overlayMapInstance = useRef(null);

  const overlayCadastralPolygonRef = useRef(null);
  const overlaySurveyedPolygonRef = useRef(null);

  // Sync Split Maps
  useEffect(() => {
    if (viewMode !== 'split' || !leftMapRef.current || !rightMapRef.current || !currentParcel) return;

    if (leftMapInstance.current) {
      try {
        leftMapInstance.current.remove();
      } catch (e) {
        console.warn('left map cleanup:', e);
      }
      leftMapInstance.current = null;
    }
    if (rightMapInstance.current) {
      try {
        rightMapInstance.current.remove();
      } catch (e) {
        console.warn('right map cleanup:', e);
      }
      rightMapInstance.current = null;
    }

    if (leftMapRef.current && leftMapRef.current._leaflet_id) {
      delete leftMapRef.current._leaflet_id;
    }
    if (rightMapRef.current && rightMapRef.current._leaflet_id) {
      delete rightMapRef.current._leaflet_id;
    }

    const coords = currentParcel.cadastralGeometry.coordinates[0];
    const centerLat = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;
    const centerLng = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;

    // 1. Left Map: Historical Cadastral Map (1359 Fasli)
    const mapL = L.map(leftMapRef.current, {
      center: [centerLat, centerLng],
      zoom: 18,
      zoomControl: false
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20
    }).addTo(mapL);

    // Cadastral Polygon (Amber)
    const cadLatLngs = currentParcel.cadastralGeometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
    L.polygon(cadLatLngs, {
      color: '#f59e0b',
      weight: 3,
      fillColor: '#f59e0b',
      fillOpacity: 0.35
    }).addTo(mapL);

    // 2. Right Map: Modern Drone & RTK GNSS Resurvey
    const mapR = L.map(rightMapRef.current, {
      center: [centerLat, centerLng],
      zoom: 18,
      zoomControl: false
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20
    }).addTo(mapR);

    // Surveyed Polygon (Cyan/Rose)
    if (currentParcel.surveyedGeometry) {
      const surLatLngs = currentParcel.surveyedGeometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
      L.polygon(surLatLngs, {
        color: hasMismatch ? '#f43f5e' : isPendingVerification ? '#f59e0b' : '#10b981',
        weight: 3,
        fillColor: hasMismatch ? '#f43f5e' : isPendingVerification ? '#f59e0b' : '#10b981',
        fillOpacity: 0.4
      }).addTo(mapR);
    }

    // Synchronize panning
    mapL.on('move', () => {
      mapR.setView(mapL.getCenter(), mapL.getZoom(), { animate: false });
    });
    mapR.on('move', () => {
      mapL.setView(mapR.getCenter(), mapR.getZoom(), { animate: false });
    });

    leftMapInstance.current = mapL;
    rightMapInstance.current = mapR;

    return () => {
      if (leftMapInstance.current) {
        try {
          leftMapInstance.current.remove();
        } catch (e) {
          console.warn('left map remove:', e);
        }
        leftMapInstance.current = null;
      }
      if (rightMapInstance.current) {
        try {
          rightMapInstance.current.remove();
        } catch (e) {
          console.warn('right map remove:', e);
        }
        rightMapInstance.current = null;
      }
    };
  }, [viewMode, currentParcel]);

  // Synchronize Overlay Map
  useEffect(() => {
    if (viewMode !== 'overlay' || !overlayMapRef.current || !currentParcel) return;

    if (overlayMapInstance.current) {
      try {
        overlayMapInstance.current.remove();
      } catch (e) {
        console.warn('overlay map cleanup:', e);
      }
      overlayMapInstance.current = null;
    }

    if (overlayMapRef.current && overlayMapRef.current._leaflet_id) {
      delete overlayMapRef.current._leaflet_id;
    }

    const coords = currentParcel.cadastralGeometry.coordinates[0];
    const centerLat = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;
    const centerLng = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;

    const map = L.map(overlayMapRef.current, {
      center: [centerLat, centerLng],
      zoom: 18,
      zoomControl: false
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20
    }).addTo(map);

    // Cadastral Polygon (Amber)
    const cadLatLngs = currentParcel.cadastralGeometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
    const cadPoly = L.polygon(cadLatLngs, {
      color: '#f59e0b',
      weight: 3,
      fillColor: '#f59e0b',
      fillOpacity: (100 - overlaySlider) / 200 + 0.1,
      dashArray: '4, 4'
    }).addTo(map);
    overlayCadastralPolygonRef.current = cadPoly;

    // Surveyed Polygon (Cyan/Rose)
    if (currentParcel.surveyedGeometry) {
      const surLatLngs = currentParcel.surveyedGeometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
      const surPoly = L.polygon(surLatLngs, {
        color: hasMismatch ? '#f43f5e' : isPendingVerification ? '#f59e0b' : '#10b981',
        weight: 3,
        fillColor: hasMismatch ? '#f43f5e' : isPendingVerification ? '#f59e0b' : '#10b981',
        fillOpacity: (overlaySlider) / 200 + 0.1
      }).addTo(map);
      overlaySurveyedPolygonRef.current = surPoly;
    } else {
      overlaySurveyedPolygonRef.current = null;
    }

    // Encroachment geometry if present
    if (comparison.encroachmentGeom) {
      const encLatLngs = comparison.encroachmentGeom.coordinates[0].map(([lng, lat]) => [lat, lng]);
      L.polygon(encLatLngs, {
        color: '#ef4444',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.75,
        dashArray: '2, 3'
      }).addTo(map);
    }

    overlayMapInstance.current = map;

    return () => {
      if (overlayMapInstance.current) {
        try {
          overlayMapInstance.current.remove();
        } catch (e) {
          console.warn('overlay map remove:', e);
        }
        overlayMapInstance.current = null;
      }
      overlayCadastralPolygonRef.current = null;
      overlaySurveyedPolygonRef.current = null;
    };
  }, [viewMode, currentParcel, hasMismatch, isPendingVerification]);

  // Dynamically update overlay opacities when slider changes without recreating the map
  useEffect(() => {
    if (overlayCadastralPolygonRef.current) {
      overlayCadastralPolygonRef.current.setStyle({
        fillOpacity: (100 - overlaySlider) / 200 + 0.1
      });
    }
    if (overlaySurveyedPolygonRef.current) {
      overlaySurveyedPolygonRef.current.setStyle({
        fillOpacity: overlaySlider / 200 + 0.1
      });
    }
  }, [overlaySlider]);

  const handleExportPDF = () => {
    alert(`Generating Official GIS Mismatch Dossier for Plot ${currentParcel.plotNumber} (${currentParcel.ownerName}) with RTK coordinates and Cadastral comparison matrix.`);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-[calc(100vh-80px)] text-slate-100 space-y-6 overflow-y-auto">
      {/* Top Header & Parcel Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-black tracking-tight flex items-center gap-2">
                <span>Old vs. Modern Survey Geometric Comparison</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  Cadastral 1359F ↔ DGPS/Drone Resurvey
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical polygon subtraction, area delta calculation, IoU overlap score, and encroachment vectorization.
              </p>
            </div>
          </div>
        </div>

        {/* Parcel Selector Dropdown */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-black font-medium">Select Parcel:</div>
          <select
            id="compare-parcel-select"
            value={activeParcelId}
            onChange={(e) => {
              setActiveParcelId(e.target.value);
              const p = parcels.find(item => item.id === e.target.value);
              if (p) onSelectParcel(p);
            }}
            className="bg-slate-800 border border-slate-700 text-black text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer min-w-[200px]"
          >
            {parcels.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                {p.plotNumber} - {p.ownerName} ({p.surveyStatus})
              </option>
            ))}
          </select>

          {/* Mode Switcher (Split vs Overlay) */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex text-xs">
            <button
              id="compare-mode-split-btn"
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'split' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Side-by-Side
            </button>
            <button
              id="compare-mode-overlay-btn"
              onClick={() => setViewMode('overlay')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'overlay' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overlay Slider
            </button>
          </div>
        </div>
      </div>

      {/* Main Comparison Section: Maps & Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Interactive Comparison Map Canvas */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500"></span>
                <span>Cadastral Boundary</span>
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <span className="w-3 h-3 rounded-full bg-cyan-500/40 border border-cyan-400"></span>
                <span>Resurvey Boundary</span>
              </span>
              {hasMismatch && (
                <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <span className="w-3 h-3 rounded-full bg-rose-500/60 border border-rose-500 animate-pulse"></span>
                  <span>Discrepancy</span>
                </span>
              )}
            </div>

            {viewMode === 'overlay' && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-[10px] text-amber-400">Cadastral</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overlaySlider}
                  onChange={(e) => setOverlaySlider(Number(e.target.value))}
                  className="w-32 accent-emerald-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-cyan-400">Modern</span>
              </div>
            )}
          </div>

          {/* Map Container Area */}
          {viewMode === 'split' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-[420px] rounded-xl overflow-hidden border border-slate-800">
              {/* Left: Cadastral Map */}
              <div className="relative h-full">
                <div ref={leftMapRef} className="w-full h-full" />
                <div className="absolute top-2 left-2 z-[400] bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/40 text-[11px] font-bold text-amber-300">
                  Cadastral Record (1359 Fasli)
                </div>
                <div className="absolute bottom-2 left-2 z-[400] bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                  Area: {currentParcel.recordedAreaAcre} Ac ({currentParcel.recordedAreaSqM} sq.m)
                </div>
              </div>

              {/* Right: Resurvey Map */}
              <div className="relative h-full">
                <div ref={rightMapRef} className="w-full h-full" />
                <div className="absolute top-2 left-2 z-[400] bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/40 text-[11px] font-bold text-cyan-300">
                  Modern Drone/RTK Resurvey
                </div>
                <div className="absolute bottom-2 left-2 z-[400] bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                  Area: {currentParcel.surveyedAreaAcre || currentParcel.recordedAreaAcre} Ac ({(currentParcel.surveyedAreaSqM || currentParcel.recordedAreaSqM)} sq.m)
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-[420px] rounded-xl overflow-hidden border border-slate-800">
              <div ref={overlayMapRef} className="w-full h-full" />
              <div className="absolute top-2 left-2 z-[400] bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold text-white flex items-center gap-2">
                <span>Overlay Transparency: {overlaySlider}% Resurvey</span>
              </div>
            </div>
          )}

          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Coordinate System: WGS 84 (EPSG:4326) / UTM Zone 44N</span>
            <span className="text-emerald-400 font-medium">RTK Base Reference: CORS-BARDHAMAN-03</span>
          </div>
        </div>

        {/* Right 5 Columns: Discrepancy Matrix & Verdict Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            {/* Status Announcement Banner */}
            {hasMismatch ? (
              <div className="bg-rose-950/50 border border-rose-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-sm uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 animate-bounce" />
                    <span>MISMATCH DETECTED</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 text-[10px] font-bold uppercase font-mono">
                    {comparison.severity} Severity
                  </span>
                </div>
                <div className="text-xs font-bold text-red-700 ">
                  {currentParcel.mismatchType || comparison.mismatchType}
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {currentParcel.mismatchDetails || 'Modern surveyed polygon differs beyond the 3% statutory tolerance limit.'}
                </p>
                <div className="mt-2 text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-1 rounded border border-amber-800/40">
                  Status: "Pending Field Verification" (No automated legal title change)
                </div>
              </div>
            ) : isPendingVerification ? (
              <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4" />
                  <span>PENDING VERIFICATION</span>
                </div>
                <p className="text-[11px] text-amber-200 mt-1">
                  This parcel has not been field-verified yet. The geometric measurements below are for review only.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PERFECT GEOMETRIC MATCH</span>
                </div>
                <p className="text-[11px] text-emerald-200 mt-1">
                  Modern RTK drone survey coordinates match historical cadastral boundaries within ±0.5m tolerance.
                </p>
              </div>
            )}

            {/* Side-by-Side Numerical Metric Comparison */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-3.5 space-y-2.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Area & Geometric Metric Delta
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-700/40">
                  <div className="text-[10px] font-bold text-amber-800">Recorded Area</div>
                  <div className="text-sm font-extrabold text-amber-400 mt-0.5 font-mono">
                    {comparison.recordedAreaAcre} Ac
                  </div>
                  <div className="text-[10px] text-slate-400">{comparison.cadAreaSqM} m²</div>
                </div>

                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-700/40">
                  <div className="text-[10px] font-bold text-cyan-400">Surveyed Area</div>
                  <div className="text-sm font-extrabold text-cyan-400 mt-0.5 font-mono">
                    {comparison.surveyedAreaAcre} Ac
                  </div>
                  <div className="text-[10px] text-slate-400">{comparison.surAreaSqM} m²</div>
                </div>

                <div className={`p-2 rounded-lg border ${
                  hasMismatch
                    ? 'bg-rose-950/40 font-bold border-rose-800/50 text-rose-600'
                    : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                }`}>
                  <div className="text-[10px]">Difference</div>
                  <div className="text-sm font-extrabold mt-0.5 font-mono">
                    {comparison.diffAreaAcre > 0 ? `+${comparison.diffAreaAcre}` : comparison.diffAreaAcre} Ac
                  </div>
                  <div className="text-[10px] font-mono">
                    ({comparison.diffPercent > 0 ? `+${comparison.diffPercent}` : comparison.diffPercent}%)
                  </div>
                </div>
              </div>

              {/* Spatial Overlap / IoU Bar */}
              <div className="pt-2 border-t border-slate-700/60">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Spatial IoU (Boundary Overlap):</span>
                  <span className="font-bold text-white font-mono">{comparison.iouPercent}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/50">
                  <div
                    className={`h-full font-bold rounded-full transition-all ${
                      comparison.iouPercent > 92 ? 'bg-emerald-00' : comparison.iouPercent > 80 ? 'bg-amber-300' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, comparison.iouPercent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Land Ownership Metadata */}
            <div className="space-y-1.5 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Plot Number:</span>
                <span className="font-bold text-gray-700">{currentParcel.plotNumber} ({currentParcel.khataNumber})</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Title Owner:</span>
                <span className="font-semibold text-slate-200">{currentParcel.ownerName}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Village / Tehsil:</span>
                <span className="text-slate-200">{currentParcel.village}, Tehsil {currentParcel.tehsil}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400">Survey Method:</span>
                <span className="text-slate-200">Drone Photogrammetry + RTK Rover</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2 mt-4">
            <button
              id="dispatch-field-verification-btn"
              onClick={() => onNavigate('field-verification')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch Field Officer Verification Flow</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="export-mismatch-dossier-btn"
                onClick={handleExportPDF}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export GIS Dossier</span>
              </button>

              <button
                onClick={() => onNavigate('mutations')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>View Mutation Logs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
