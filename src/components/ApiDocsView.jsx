import React, { useState } from 'react';
import { FileCode2, Terminal } from 'lucide-react';

export const ApiDocsView = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET /api/parcels');
  const [testResponse, setTestResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/parcels',
      desc: 'Retrieve all rural land parcels with GeoJSON cadastral & resurvey geometries.',
      sampleRequest: null
    },
    {
      method: 'GET',
      path: '/api/dashboard/statistics',
      desc: 'Get executive KPI statistics, mismatch aggregates, and survey velocity.',
      sampleRequest: null
    },
    {
      method: 'GET',
      path: '/api/mismatches',
      desc: 'Query detected land boundary, area, and encroachment mismatches.',
      sampleRequest: null
    },
    {
      method: 'POST',
      path: '/api/gis/calculate-mismatches',
      desc: 'Trigger backend GIS geometry subtraction and IoU comparison engine.',
      sampleRequest: {}
    },
    {
      method: 'POST',
      path: '/api/field-verification',
      desc: 'Submit field officer verification record with RTK GPS coords and photo evidence.',
      sampleRequest: {
        mismatchId: 'MIS-101',
        parcelId: 'p-125',
        plotNumber: 'P-125',
        officerId: 'USR-02',
        officerName: 'Suresh Patel',
        officerRole: 'Field Survey Officer',
        gpsLatitude: 23.2508,
        gpsLongitude: 87.8506,
        result: 'Area Mismatch',
        remarks: 'Physical field bund shifted 1.8m south.',
        uploadedEvidence: ['https://example.com/photo.jpg'],
        witnessNames: ['Moti Lal (Gram Pradhan)']
      }
    },
    {
      method: 'POST',
      path: '/api/ai/detect-boundaries',
      desc: 'Vectorize parcel boundaries from aerial drone orthophoto imagery using AI.',
      sampleRequest: {
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
        village: 'Madhabpur',
        resolutionGsdCm: 2.0
      }
    }
  ];

  const handleTestEndpoint = async (ep) => {
    setIsLoading(true);
    try {
      let res;
      if (ep.method === 'GET') {
        res = await fetch(ep.path);
      } else {
        res = await fetch(ep.path, {
          method: ep.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ep.sampleRequest || {})
        });
      }
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setTestResponse(JSON.stringify({ error: err.message || 'API request failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-[calc(100vh-80px)] text-slate-100 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                REST API, PostGIS GIS Engine & Python AI Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Direct endpoints for DILRMP land-record integration, boundary calculations, and field verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Endpoints + Interactive Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Endpoint List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="text-xs font-bold text-slate-300 mb-2">Available REST Endpoints</div>
          <div className="space-y-2">
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint === `${ep.method} ${ep.path}`;
              return (
                <div
                  key={ep.path}
                  onClick={() => {
                    setSelectedEndpoint(`${ep.method} ${ep.path}`);
                    handleTestEndpoint(ep);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ep.method === 'GET' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-bold text-slate-100">{ep.path}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{ep.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Interactive Response Terminal */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-white">{selectedEndpoint}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Status: 200 OK</span>
            </div>

            <div className="mt-3 bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-emerald-300 max-h-[380px] overflow-y-auto">
              {isLoading ? (
                <div className="text-slate-400">Executing API request...</div>
              ) : testResponse ? (
                <pre>{testResponse}</pre>
              ) : (
                <div className="text-slate-500">Click any endpoint on the left to execute live test call.</div>
              )}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono">
            Database Schema: PostgreSQL + PostGIS (Geometry: MultiPolygon EPSG:4326)
          </div>
        </div>
      </div>
    </div>
  );
};
