import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Search,
  Filter,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { calculatePolygonMetrics } from '../utils/gisCalculations';

export const GisMapView = ({
  parcels = [],
  selectedParcel = null,
  onSelectParcel,
  onNavigate,
  onAddSurveyGeometry
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef({
    cadastral: L.layerGroup(),
    surveyed: L.layerGroup(),
    mismatch: L.layerGroup(),
    ai: L.layerGroup(),
    droneOverlay: null
  });

  // Layer Visibility Toggles
  const [showCadastral, setShowCadastral] = useState(true);
  const [showSurveyed, setShowSurveyed] = useState(true);
  const [showMismatches, setShowMismatches] = useState(true);
  const [showDroneMosaic, setShowDroneMosaic] = useState(true);
  const [droneOpacity, setDroneOpacity] = useState(0.75);
  const [basemapType, setBasemapType] = useState('satellite');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [landTypeFilter, setLandTypeFilter] = useState('All');
  const [mismatchFilter, setMismatchFilter] = useState('All');

  // Drawing & Measurement Mode
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawPoints, setDrawPoints] = useState([]);
  const drawLayerRef = useRef(L.layerGroup());
  const [measuredMetrics, setMeasuredMetrics] = useState(null);

  // Filtered parcels
  const filteredParcels = parcels.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.plotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.khataNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.surveyStatus === statusFilter;
    const matchesLandType = landTypeFilter === 'All' || p.landType === landTypeFilter;
    const matchesMismatch =
      mismatchFilter === 'All' ||
      (mismatchFilter === 'Has Mismatch' && p.surveyStatus === 'Mismatch') ||
      (mismatchFilter === 'Disputed' && p.surveyStatus === 'Disputed') ||
      (mismatchFilter === 'Verified' && p.surveyStatus === 'Verified') ||
      p.mismatchType === mismatchFilter;

    return matchesSearch && matchesStatus && matchesLandType && matchesMismatch;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (err) {
        console.warn('Map cleanup warning:', err);
      }
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    // Village Madhabpur Center, Purba Bardhaman, West Bengal
    const map = L.map(mapContainerRef.current, {
      center: [23.25, 87.85],
      zoom: 17,
      minZoom: 14,
      maxZoom: 21,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    resizeObserver.observe(mapContainerRef.current);

    // Layer groups
    layersGroupRef.current.cadastral.addTo(map);
    layersGroupRef.current.surveyed.addTo(map);
    layersGroupRef.current.mismatch.addTo(map);
    layersGroupRef.current.ai.addTo(map);
    drawLayerRef.current.addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {
          console.warn('Map remove warning:', err);
        }
        mapInstanceRef.current = null;
      }
      resizeObserver.disconnect();
    };
  }, []);

  // Update Basemap Tiles
  const tileLayerRef = useRef(null);
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = '&copy; Esri &mdash; High-Resolution Satellite';

    if (basemapType === 'street') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    } else if (basemapType === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CartoDB Dark Matter';
    }

    tileLayerRef.current = L.tileLayer(url, {
      maxZoom: 20,
      attribution
    }).addTo(map);
  }, [basemapType]);

  // Update Drone Orthomosaic Overlay
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (layersGroupRef.current.droneOverlay) {
      map.removeLayer(layersGroupRef.current.droneOverlay);
      layersGroupRef.current.droneOverlay = null;
    }

    if (showDroneMosaic) {
      const imageBounds = [
        [23.2480, 87.8460],
        [23.2545, 87.8535]
      ];

      const droneImageUrl = 'https://thumbs.dreamstime.com/b/aerial-view-patchwork-fields-verdant-countryside-yellow-green-brown-crops-create-colorful-pattern-trees-border-farm-land-367484072.jpg';

      const overlay = L.imageOverlay(droneImageUrl, imageBounds, {
        opacity: droneOpacity,
        interactive: false
      });
      overlay.addTo(map);
      layersGroupRef.current.droneOverlay = overlay;

      if (window.innerWidth < 640) {
        map.fitBounds(imageBounds, {
          padding: [16, 16],
          maxZoom: 19,
          animate: false
        });
        map.setZoom(Math.min(map.getZoom() + 2, 19), { animate: false });
      }
    }
  }, [showDroneMosaic, droneOpacity]);

  // Render Parcel Polygons
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    layersGroupRef.current.cadastral.clearLayers();
    layersGroupRef.current.surveyed.clearLayers();
    layersGroupRef.current.mismatch.clearLayers();

    filteredParcels.forEach((parcel) => {
      const isSelected = selectedParcel?.id === parcel.id;

      // 1. Cadastral Layer (Orange/Amber)
      if (showCadastral && parcel.cadastralGeometry) {
        const latLngs = parcel.cadastralGeometry.coordinates[0].map(([lng, lat]) => [lat, lng]);

        const poly = L.polygon(latLngs, {
          color: isSelected ? '#fbbf24' : '#f59e0b',
          weight: isSelected ? 4 : 2,
          fillColor: '#f59e0b',
          fillOpacity: isSelected ? 0.45 : 0.15,
          dashArray: '4, 4'
        });

        // Tooltip label
        poly.bindTooltip(
          `<div class="text-[11px] font-bold text-amber-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-amber-500/40">
            ${parcel.plotNumber}
          </div>`,
          { permanent: true, direction: 'center', className: 'custom-leaflet-tooltip' }
        );

        poly.on('click', () => {
          onSelectParcel(parcel);
        });

        poly.addTo(layersGroupRef.current.cadastral);
      }

      // 2. Modern Surveyed RTK Layer (Cyan/Emerald/Rose based on status)
      if (showSurveyed && parcel.surveyedGeometry) {
        const latLngs = parcel.surveyedGeometry.coordinates[0].map(([lng, lat]) => [lat, lng]);

        let strokeColor = '#06b6d4'; // cyan
        let fillColor = '#06b6d4';

        if (parcel.surveyStatus === 'Verified') {
          strokeColor = '#10b981'; // emerald
          fillColor = '#10b981';
        } else if (parcel.surveyStatus === 'Mismatch') {
          strokeColor = '#f43f5e'; // rose
          fillColor = '#f43f5e';
        } else if (parcel.surveyStatus === 'Disputed') {
          strokeColor = '#ec4899'; // pink/magenta
          fillColor = '#ec4899';
        }

        const poly = L.polygon(latLngs, {
          color: strokeColor,
          weight: isSelected ? 4 : 2.5,
          fillColor: fillColor,
          fillOpacity: isSelected ? 0.5 : 0.25
        });

        poly.on('click', () => {
          onSelectParcel(parcel);
        });

        poly.addTo(layersGroupRef.current.surveyed);
      }

      // 3. Encroachment / Mismatch Highlight Layer (Striped Warning)
      if (showMismatches && parcel.encroachmentGeometry && (parcel.surveyStatus === 'Mismatch' || parcel.surveyStatus === 'Disputed')) {
        const latLngs = parcel.encroachmentGeometry.coordinates[0].map(([lng, lat]) => [lat, lng]);

        const poly = L.polygon(latLngs, {
          color: '#ef4444',
          weight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.65,
          dashArray: '2, 3'
        });

        poly.bindPopup(`
          <div class="p-1 text-xs">
            <div class="font-bold text-rose-600 flex items-center gap-1">
              <span>⚠️ Possible Encroachment</span>
            </div>
            <div class="text-slate-700 mt-1">${parcel.mismatchDetails || 'Surveyed area extends beyond Cadastral boundary'}</div>
          </div>
        `);

        poly.addTo(layersGroupRef.current.mismatch);
      }
    });
  }, [filteredParcels, selectedParcel, showCadastral, showSurveyed, showMismatches]);

  // Fit the selected parcel and its nearest neighbors inside the map viewport.
  useEffect(() => {
    if (!mapInstanceRef.current || filteredParcels.length === 0) return;

    const getParcelCenter = (parcel) => {
      const geometry = parcel.surveyedGeometry || parcel.cadastralGeometry;
      const coordinates = geometry?.coordinates?.[0];
      if (!coordinates?.length) return null;

      return coordinates.reduce(
        ([latSum, lngSum], [lng, lat]) => [latSum + lat, lngSum + lng],
        [0, 0]
      ).map((value) => value / coordinates.length);
    };

    const selectedCenter = selectedParcel && getParcelCenter(selectedParcel);
    const parcelsToFit = selectedCenter
      ? [...filteredParcels]
        .sort((first, second) => {
          const firstCenter = getParcelCenter(first);
          const secondCenter = getParcelCenter(second);
          const firstDistance = firstCenter
            ? Math.hypot(firstCenter[0] - selectedCenter[0], firstCenter[1] - selectedCenter[1])
            : Number.POSITIVE_INFINITY;
          const secondDistance = secondCenter
            ? Math.hypot(secondCenter[0] - selectedCenter[0], secondCenter[1] - selectedCenter[1])
            : Number.POSITIVE_INFINITY;
          return firstDistance - secondDistance;
        })
        .slice(0, 9)
      : filteredParcels;

    const bounds = L.latLngBounds([]);
    parcelsToFit.forEach((parcel) => {
      const geometry = parcel.surveyedGeometry || parcel.cadastralGeometry;
      geometry?.coordinates?.[0]?.forEach(([lng, lat]) => bounds.extend([lat, lng]));
    });

    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [24, 24],
        maxZoom: 18,
        animate: true
      });
    }
  }, [filteredParcels, selectedParcel]);

  // Handle Interactive Drawing & Measurement
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e) => {
      if (!isDrawingMode) return;
      const newPt = [e.latlng.lat, e.latlng.lng];
      const updated = [...drawPoints, newPt];
      setDrawPoints(updated);

      if (updated.length >= 3) {
        // Calculate polygon metrics live
        const geoCoords = updated.map(([lat, lng]) => [lng, lat]);
        geoCoords.push(geoCoords[0]); // close loop
        const metrics = calculatePolygonMetrics({ type: 'Polygon', coordinates: [geoCoords] });
        setMeasuredMetrics({
          areaAcre: metrics.areaAcre,
          areaSqM: metrics.areaSqM,
          perimeter: metrics.perimeterMeters
        });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingMode, drawPoints]);

  // Render Drawn Points & Shape
  useEffect(() => {
    drawLayerRef.current.clearLayers();
    if (drawPoints.length === 0) return;

    // Draw vertex markers
    drawPoints.forEach((pt) => {
      const marker = L.circleMarker(pt, {
        radius: 6,
        color: '#10b981',
        fillColor: '#ffffff',
        fillOpacity: 1,
        weight: 2
      });
      drawLayerRef.current.addLayer(marker);
    });

    if (drawPoints.length >= 2) {
      const line = L.polyline(drawPoints, { color: '#10b981', weight: 3, dashArray: '4, 4' });
      drawLayerRef.current.addLayer(line);
    }

    if (drawPoints.length >= 3) {
      const poly = L.polygon(drawPoints, { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.35, weight: 3 });
      drawLayerRef.current.addLayer(poly);
    }
  }, [drawPoints]);

  const resetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([23.25, 87.85], 17, { duration: 1 });
  };

  const handleFinishDraw = () => {
    if (drawPoints.length < 3) {
      alert('Please click at least 3 points on the map to define a closed polygon.');
      return;
    }
    const geoCoords = drawPoints.map(([lat, lng]) => [lng, lat]);
    geoCoords.push(geoCoords[0]); // close polygon
    const newGeom = { type: 'Polygon', coordinates: [geoCoords] };

    if (selectedParcel && onAddSurveyGeometry) {
      onAddSurveyGeometry(selectedParcel.id, newGeom);
      alert(`New surveyed geometry applied to plot ${selectedParcel.plotNumber}!`);
    } else {
      alert(`Captured polygon with Area: ${measuredMetrics?.areaAcre} Acres (${measuredMetrics?.areaSqM} sq.m). Select a parcel to bind survey.`);
    }

    setIsDrawingMode(false);
    setDrawPoints([]);
    setMeasuredMetrics(null);
  };

  return (
    <div className="relative w-full h-[calc(100dvh-80px)] sm:h-[calc(100vh-80px)] flex overflow-hidden bg-slate-950">
      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        className={`h-full z-0 cursor-crosshair transition-[width] duration-300 ${
          selectedParcel ? 'w-full sm:w-[calc(100%-25rem)]' : 'w-full'
        }`}
      />

      {/* Top Floating Map Controls Toolbar */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-auto z-10 flex flex-wrap items-center gap-2 max-w-none sm:max-w-[calc(100%-420px)]">
        {/* Search Input */}
        <div className="relative bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl flex items-center px-3 py-1.5 w-full sm:w-auto sm:min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            id="map-plot-search-input"
            type="text"
            placeholder="Search Plot (P-125), Owner, Khata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-red-800 placeholder-slate-400 focus:outline-none w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-xl flex items-center gap-1.5 text-xs text-slate-300">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <select
            id="map-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-emerald-600 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-slate-900 text-slate-200">All Statuses ({parcels.length})</option>
            <option value="Verified" className="bg-slate-900 text-emerald-400">Verified ({parcels.filter(p => p.surveyStatus === 'Verified').length})</option>
            <option value="Mismatch" className="bg-slate-900 text-rose-400">Mismatch ({parcels.filter(p => p.surveyStatus === 'Mismatch').length})</option>
            <option value="Disputed" className="bg-slate-900 text-pink-400">Disputed ({parcels.filter(p => p.surveyStatus === 'Disputed').length})</option>
            <option value="Pending Verification" className="bg-slate-900 text-amber-400">Pending Verification</option>
          </select>
        </div>

        {/* Land Type Filter */}
        <div className="hidden sm:flex bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-xl items-center gap-1.5 text-xs text-slate-300">
          <select
            id="map-landtype-filter"
            value={landTypeFilter}
            onChange={(e) => setLandTypeFilter(e.target.value)}
            className="bg-transparent text-xs text-amber-600 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-slate-900 text-slate-200">All Land Types</option>
            <option value="Agricultural" className="bg-slate-900 text-emerald-600">Agricultural</option>
            <option value="Residential" className="bg-slate-900 text-sky-600">Residential (Abadi)</option>
            <option value="Commercial" className="bg-slate-900 text-amber-600">Commercial</option>
            <option value="Pasture / Grazing" className="bg-slate-900 text-lime-600">Pasture (Charagah)</option>
            <option value="Waterbody / Pond" className="bg-slate-900 text-cyan-600">Waterbody (Pokhari)</option>
            <option value="Forest / Barren" className="bg-slate-900 text-teal-600">Forest / Barren</option>
          </select>
        </div>

        {/* Draw & Survey Tool Button */}
        <button
          id="map-draw-survey-btn"
          onClick={() => {
            setIsDrawingMode(!isDrawingMode);
            setDrawPoints([]);
            setMeasuredMetrics(null);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xl transition-all cursor-pointer ${
            isDrawingMode
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>{isDrawingMode ? 'Cancel Drawing' : 'Draw / Resurvey Polygon'}</span>
        </button>

        {/* Reset View */}
        <button
          id="map-reset-bounds-btn"
          onClick={resetView}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs font-medium flex items-center gap-1 shadow-xl cursor-pointer"
          title="Zoom to Village Bounds"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Reset Extent</span>
        </button>
      </div>

      {/* Drawing Active Overlay Floating Bar */}
      {isDrawingMode && (
        <div className="absolute top-16 left-2 right-2 sm:left-4 sm:right-auto z-20 bg-slate-900/95 border border-emerald-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-md text-xs text-slate-200">
          <div className="flex items-center justify-between font-bold text-emerald-400 mb-1">
            <span className="flex items-center gap-1.5">
              <PenTool className="w-4 h-4" />
              <span>Interactive RTK Boundary Capture Mode</span>
            </span>
            <span className="bg-emerald-950 px-2 py-0.5 rounded text-[10px] text-emerald-300 border border-emerald-800">
              {drawPoints.length} Points Plotted
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Click on map to mark parcel boundary corners (vertices).
          </p>

          {measuredMetrics && (
            <div className="bg-slate-800/90 p-2 rounded-lg mb-2.5 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-400">Calculated Area:</span>
                <div className="text-emerald-300 font-bold">{measuredMetrics.areaAcre} Acres</div>
                <div className="text-slate-400 text-[10px]">({measuredMetrics.areaSqM.toLocaleString()} sq.m)</div>
              </div>
              <div>
                <span className="text-slate-400">Perimeter:</span>
                <div className="text-slate-200 font-bold">{measuredMetrics.perimeter} meters</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              id="confirm-draw-polygon-btn"
              onClick={handleFinishDraw}
              disabled={drawPoints.length < 3}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Confirm & Save Survey Boundary
            </button>
            <button
              onClick={() => { setDrawPoints([]); setMeasuredMetrics(null); }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-2.5 rounded-lg text-xs cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}



      {/* Right Slide-Out: Selected Parcel Inspection Panel */}
      {selectedParcel && (
        <div className="hidden sm:flex absolute top-4 right-4 bottom-4 sm:w-96 z-20 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-5 flex-col justify-between overflow-y-auto text-slate-100 animate-in slide-in-from-right-4 duration-300">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-blue-500 tracking-tight">{selectedParcel.plotNumber}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-blue-700 border border-blue-900 font-mono">
                    {selectedParcel.khataNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Village: <span className="text-slate-200 font-medium">{selectedParcel.village}</span>, Tehsil: {selectedParcel.tehsil}
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {selectedParcel.surveyStatus === 'Verified' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Verified
                  </span>
                )}
                {selectedParcel.surveyStatus === 'Mismatch' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white border border-rose-800 text-xs font-bold animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                    Mismatch
                  </span>
                )}
                {selectedParcel.surveyStatus === 'Disputed' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-950 text-pink-300 border border-pink-800 text-xs font-bold">
                    <ShieldAlert className="w-3.5 h-3.5 text-pink-400" />
                    Disputed
                  </span>
                )}
                {selectedParcel.surveyStatus === 'Pending Verification' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Pending
                  </span>
                )}
              </div>
            </div>

            {/* Owner & Property Record Details */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Registered Title Holder</div>
                <div className="text-sm font-bold text-blue-500 mt-0.5">{selectedParcel.ownerName}</div>
                {selectedParcel.coOwners && selectedParcel.coOwners.length > 0 && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    Co-owners: {selectedParcel.coOwners.join(', ')}
                  </div>
                )}
              </div>

              {/* Area Comparison Metric Box */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-xl">
                  <div className="text-[10px] text-yellow-700  font-semibold uppercase">Cadastral Record Area</div>
                  <div className="text-base font-extrabold text-amber-700 mt-0.5 font-mono">
                    {selectedParcel.recordedAreaAcre} <span className="text-xs font-normal">Acre</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">({selectedParcel.recordedAreaSqM.toLocaleString()} sq.m)</div>
                </div>

                <div className="bg-cyan-950/30 border border-cyan-800/40 p-2.5 rounded-xl">
                  <div className="text-[10px] text-cyan-500 font-semibold uppercase">Modern Survey Area</div>
                  <div className="text-base font-extrabold text-cyan-800 mt-0.5 font-mono">
                    {selectedParcel.surveyedAreaAcre || selectedParcel.recordedAreaAcre} <span className="text-xs font-normal">Acre</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ({(selectedParcel.surveyedAreaSqM || selectedParcel.recordedAreaSqM).toLocaleString()} sq.m)
                  </div>
                </div>
              </div>

              {/* Mismatch Alert Box if present */}
              {selectedParcel.surveyStatus === 'Mismatch' || selectedParcel.surveyStatus === 'Disputed' ? (
                <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs mb-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{selectedParcel.mismatchType || 'Discrepancy Detected'}</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-rose-900 text-rose-200 font-mono">
                      {selectedParcel.mismatchSeverity || 'High'} Severity
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {selectedParcel.mismatchDetails}
                  </p>
                </div>
              ) : null}

              {/* Additional Land Record Attributes */}
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Land Classification:</span>
                  <span className="font-semibold text-slate-200">{selectedParcel.landType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Estimated Market Value:</span>
                  <span className="font-semibold text-emerald-400 font-mono">
                    ₹{((selectedParcel.marketValueInr || 2500000) / 100000).toFixed(2)} Lakh
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Soil & Irrigation:</span>
                  <span className="text-slate-200 truncate max-w-[180px]">{selectedParcel.irrigationSource || 'Canal Minor'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Last Drone/RTK Survey:</span>
                  <span className="text-slate-200 font-mono">{selectedParcel.lastSurveyDate || '2026-06-14'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              id="parcel-compare-old-new-btn"
              onClick={() => onNavigate('compare')}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <span>Compare Old vs New Survey</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              id="parcel-field-verify-btn"
              onClick={() => onNavigate('field-verification')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              <span>Open in Field Officer Verification</span>
            </button>

            <button
              onClick={() => onSelectParcel(null)}
              className="w-full text-slate-400 hover:text-slate-200 text-[11px] py-1 text-center cursor-pointer"
            >
              Close Inspection Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
