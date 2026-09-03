import React, { useState, useEffect } from 'react';
import { INITIAL_PARCELS, INITIAL_SURVEYS, INITIAL_MUTATIONS } from './data/demoVillageData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { GisMapView } from './components/GisMapView';
import { ComparisonView } from './components/ComparisonView';
import { MismatchManagerView } from './components/MismatchManagerView';
import { FieldVerificationView } from './components/FieldVerificationView';
import { OwnershipMutationView } from './components/OwnershipMutationView';
import { AiSegmentationView } from './components/AiSegmentationView';
import { SurveyManagementView } from './components/SurveyManagementView';


export function App() {
  // Navigation & Active View
  const [activeView, setActiveView] = useState('dashboard');

  // User Profile & Role
  const [currentUser, setCurrentUser] = useState({
    id: 'USR-01',
    name: 'Dr. Anand Verma, IAS',
    role: 'Admin',
    designation: 'Director of Land Records & Resurvey Commissioner'
  });

  // Core Data Collections
  const [parcels, setParcels] = useState(INITIAL_PARCELS);
  const [mismatches, setMismatches] = useState([]);
  const [surveys, setSurveys] = useState(INITIAL_SURVEYS);
  const [mutations, setMutations] = useState(INITIAL_MUTATIONS);
  const [verifications, setVerifications] = useState([]);
  
  const [stats, setStats] = useState({
    totalParcels: INITIAL_PARCELS.length,
    verifiedParcels: INITIAL_PARCELS.filter(p => p.surveyStatus === 'Verified').length,
    pendingSurveys: INITIAL_PARCELS.filter(p => p.surveyStatus === 'Pending Verification').length,
    mismatchedParcels: INITIAL_PARCELS.filter(p => p.surveyStatus === 'Mismatch').length,
    disputedParcels: INITIAL_PARCELS.filter(p => p.surveyStatus === 'Disputed').length,
    mutationPending: INITIAL_MUTATIONS.filter(m => m.status === 'Pending Verification').length,
    possibleEncroachments: 2,
    totalCadastralAreaAcre: 13.90,
    totalSurveyedAreaAcre: 13.60,
    totalSurveyCoveragePercent: 78,
    villageSummary: [
      {
        villageName: 'Kalyanpur',
        totalParcels: INITIAL_PARCELS.length,
        mismatchCount: INITIAL_PARCELS.filter(p => p.surveyStatus === 'Mismatch').length,
        verifiedCount: INITIAL_PARCELS.filter(p => p.surveyStatus === 'Verified').length
      }
    ],
    landTypeCounts: {
      'Agricultural': 4,
      'Residential': 1,
      'Commercial': 1,
      'Pasture / Grazing': 1,
      'Waterbody / Pond': 1,
      'Forest / Barren': 0
    },
    mismatchTypeCounts: {
      'Area Mismatch': 2,
      'Boundary Mismatch': 1,
      'Overlapping Parcels': 1,
      'Possible Encroachment': 2,
      'Ownership Inconsistency': 0,
      'Missing / Pending Mutation': 1
    },
    monthlyProgress: [
      { month: 'Jan', surveyed: 8, verified: 6, mismatches: 1 },
      { month: 'Feb', surveyed: 14, verified: 10, mismatches: 2 },
      { month: 'Mar', surveyed: 21, verified: 16, mismatches: 3 },
      { month: 'Apr', surveyed: 28, verified: 22, mismatches: 5 }
    ]
  });

  const [selectedParcel, setSelectedParcel] = useState(INITIAL_PARCELS[0]);
  const [isDetecting, setIsDetecting] = useState(false);

  // Fetch initial data from backend API
  const fetchData = async () => {
    try {
      const [parcelsRes, statsRes, mismatchesRes, surveysRes, mutationsRes] = await Promise.all([
        fetch('/api/parcels'),
        fetch('/api/dashboard/statistics'),
        fetch('/api/mismatches'),
        fetch('/api/surveys'),
        fetch('/api/mutations')
      ]);

      if (parcelsRes.ok) {
        const parcelsData = await parcelsRes.json();
        setParcels(parcelsData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (mismatchesRes.ok) {
        const mismatchesData = await mismatchesRes.json();
        setMismatches(mismatchesData);
      }
      if (surveysRes.ok) {
        const surveysData = await surveysRes.json();
        setSurveys(surveysData);
      }
      if (mutationsRes.ok) {
        const mutationsData = await mutationsRes.json();
        setMutations(mutationsData);
      }
    } catch (err) {
      console.warn('Using local fallback state:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Role Switcher Handler
  const handleRoleChange = (newRole) => {
    let name = 'Dr. Anand Verma, IAS';
    let designation = 'Director of Land Records & Resurvey Commissioner';

    if (newRole === 'Survey Officer') {
      name = 'Suresh Patel';
      designation = 'Senior Drone & RTK Survey Officer';
    } else if (newRole === 'Revenue Officer') {
      name = 'Rajeshwar Nath Pandey';
      designation = 'Tehsildar / Assistant Collector, Sadar Varanasi';
    } else if (newRole === 'Viewer') {
      name = 'Rameshwar Yadav';
      designation = 'Gram Sabha Resident / Citizen';
    }

    setCurrentUser({
      id: `USR-${newRole.toLowerCase().slice(0, 3)}`,
      name,
      role: newRole,
      designation
    });
  };

  // Run automated GIS mismatch detection
  const handleRunAutoDetection = async () => {
    setIsDetecting(true);
    try {
      const res = await fetch('/api/gis/calculate-mismatches', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMismatches(data.mismatches || []);
        await fetchData(); // refresh stats
        alert(`Spatial GIS analysis completed! Detected ${data.mismatches?.length || 0} discrepancy records.`);
      }
    } catch (err) {
      console.error('Error running detection:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  // Add new survey geometry from map drawing tool
  const handleAddSurveyGeometry = async (parcelId, geometry) => {
    const updated = parcels.map((p) => {
      if (p.id === parcelId) {
        return {
          ...p,
          surveyedGeometry: geometry,
          surveyStatus: 'Pending Verification',
          lastSurveyDate: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    });
    setParcels(updated);
  };

  // Update mismatch resolution status
  const handleUpdateMismatchStatus = (mismatchId, newStatus) => {
    const updated = mismatches.map((m) => (m.id === mismatchId ? { ...m, status: newStatus } : m));
    setMismatches(updated);
  };

  // Handle Field Verification Submission
  const handleVerificationSubmitted = (verification) => {
    setVerifications([verification, ...verifications]);
    // update parcel status if verified
    if (verification.result === 'Verified Match') {
      setParcels(parcels.map(p => p.id === verification.parcelId ? { ...p, surveyStatus: 'Verified' } : p));
    }
  };

  // Handle New Mutation Filing
  const handleAddMutation = (newMutation) => {
    setMutations([newMutation, ...mutations]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onNavigate={setActiveView}
        activeView={activeView}
        mismatchCount={stats.mismatchedParcels}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          mismatchCount={stats.mismatchedParcels}
          onAutoDetect={handleRunAutoDetection}
          isDetecting={isDetecting}
        />

        {/* Dynamic Center View Container */}
        <main className="flex-1 overflow-y-auto relative bg-slate-950">
          {activeView === 'dashboard' && (
            <DashboardView
              stats={stats}
              mismatches={mismatches}
              parcels={parcels}
              onNavigate={setActiveView}
              onSelectParcel={setSelectedParcel}
              onRefreshStats={fetchData}
            />
          )}

          {activeView === 'map' && (
            <GisMapView
              parcels={parcels}
              selectedParcel={selectedParcel}
              onSelectParcel={setSelectedParcel}
              onNavigate={setActiveView}
              onAddSurveyGeometry={handleAddSurveyGeometry}
            />
          )}

          {activeView === 'compare' && (
            <ComparisonView
              parcels={parcels}
              selectedParcel={selectedParcel}
              onSelectParcel={setSelectedParcel}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'mismatches' && (
            <MismatchManagerView
              mismatches={mismatches}
              parcels={parcels}
              onSelectParcel={setSelectedParcel}
              onNavigate={setActiveView}
              onUpdateStatus={handleUpdateMismatchStatus}
            />
          )}

          {activeView === 'field-verification' && (
            <FieldVerificationView
              parcels={parcels}
              selectedParcel={selectedParcel}
              onSelectParcel={setSelectedParcel}
              currentUser={currentUser}
              onVerificationSubmitted={handleVerificationSubmitted}
            />
          )}

          {activeView === 'mutations' && (
            <OwnershipMutationView
              mutations={mutations}
              parcels={parcels}
              onSelectParcel={setSelectedParcel}
              onNavigate={setActiveView}
              currentUser={currentUser}
              onAddMutation={handleAddMutation}
            />
          )}

          {activeView === 'ai-segmentation' && (
            <AiSegmentationView
              onNavigate={setActiveView}
              parcels={parcels}
            />
          )}

          {activeView === 'surveys' && (
            <SurveyManagementView
              surveys={surveys}
              onNavigate={setActiveView}
            />
          )}

          
        </main>
      </div>
    </div>
  );
}
export default App;
