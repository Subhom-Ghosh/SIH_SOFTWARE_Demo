export type UserRole = 'Admin' | 'Survey Officer' | 'Revenue Officer' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: string;
  badgeNumber?: string;
}

export type LandType = 'Agricultural' | 'Residential' | 'Commercial' | 'Pasture / Grazing' | 'Waterbody / Pond' | 'Forest / Barren';

export type SurveyStatus = 'Verified' | 'Pending Verification' | 'Mismatch' | 'Disputed';

export type MismatchType = 
  | 'Boundary Mismatch'
  | 'Area Mismatch'
  | 'Overlapping Parcels'
  | 'Possible Encroachment'
  | 'Ownership Inconsistency'
  | 'Missing / Pending Mutation';

export type MismatchSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [ [ [lng, lat], [lng, lat], ... ] ]
}

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

export type ParcelGeometry = GeoJSONPolygon | GeoJSONMultiPolygon;

export interface LandParcel {
  id: string;
  plotNumber: string; // e.g. "P-101", "Khasra 243/1"
  khataNumber: string; // e.g. "KH-88"
  ownerName: string;
  coOwners?: string[];
  recordedAreaAcre: number; // in Acres
  recordedAreaHectare: number; // in Hectares
  recordedAreaSqM: number;
  landType: LandType;
  village: string;
  gramPanchayat: string;
  tehsil: string;
  district: string;
  state: string;
  surveyStatus: SurveyStatus;
  lastSurveyDate?: string;
  cadastralGeometry: GeoJSONPolygon;
  surveyedGeometry?: GeoJSONPolygon;
  surveyedAreaAcre?: number;
  surveyedAreaSqM?: number;
  mismatchType?: MismatchType;
  mismatchSeverity?: MismatchSeverity;
  mismatchDetails?: string;
  encroachmentGeometry?: GeoJSONPolygon;
  taxStatus?: 'Paid' | 'Pending' | 'Exempt';
  marketValueInr?: number;
  soilClassification?: string;
  irrigationSource?: string;
}

export interface SurveyData {
  id: string;
  parcelId: string;
  plotNumber: string;
  surveyDate: string;
  surveyMethod: 'Drone Photogrammetry' | 'DGPS / RTK Rover' | 'Total Station (ETS)' | 'Hybrid LiDAR + Drone';
  surveyorId: string;
  surveyorName: string;
  surveyedAreaAcre: number;
  surveyedAreaSqM: number;
  surveyedGeometry: GeoJSONPolygon;
  centerLatitude: number;
  centerLongitude: number;
  rtkAccuracyCm: number;
  baseStationRef: string;
  flightAltitudeMeters?: number;
  groundSamplingDistanceCm?: number;
  rawPointCount: number;
  remarks?: string;
}

export interface OwnershipHistory {
  id: string;
  parcelId: string;
  ownerName: string;
  startDate: string;
  endDate?: string;
  transactionType: 'Inheritance (Virasat)' | 'Sale Deed (Bainama)' | 'Family Partition (Batwara)' | 'Government Allotment' | 'Gift Deed (Hibanama)';
  documentReference: string;
  registeredSubRegistrarOffice: string;
  stampDutyPaidInr?: number;
}

export type MutationStatus = 'Approved' | 'Pending Verification' | 'Pending' | 'Rejected' | 'Disputed';

export interface MutationRecord {
  id: string;
  parcelId: string;
  plotNumber: string;
  previousOwner: string;
  newOwner: string;
  mutationType: string;
  mutationDate?: string;
  filingDate?: string;
  status: MutationStatus;
  affectedAreaAcre?: number;
  affectedAreaSqM?: number;
  applicantName?: string;
  documentReference: string;
  tehsildarCaseNo?: string;
  applicantContact?: string;
  remarks?: string;
}

export type MismatchResolutionStatus =
  | 'Pending Field Verification'
  | 'Pending Verification'
  | 'Under Investigation'
  | 'In Review'
  | 'Field Verified'
  | 'Correction Proposed'
  | 'Dispute Raised'
  | 'Verified - Discrepancy Confirmed'
  | 'Resolved - Record Corrected'
  | 'Resolved'
  | 'Disputed - Sent to Revenue Court';

export type SurveyRecord = SurveyData;

export interface MismatchReport {
  id: string;
  parcelId: string;
  plotNumber: string;
  ownerName: string;
  village: string;
  mismatchType: MismatchType;
  recordedValue: string;
  surveyedValue: string;
  areaDifferenceAcre: number;
  areaDifferencePercent: number;
  boundaryOverlapPercent: number; // IoU %
  severity: MismatchSeverity;
  status: 'Pending Field Verification' | 'Under Investigation' | 'Verified - Discrepancy Confirmed' | 'Resolved - Record Corrected' | 'Disputed - Sent to Revenue Court';
  detectedAt: string;
  fieldOfficerAssigned?: string;
  encroachmentSuspectName?: string;
  encroachmentDirection?: string;
}

export interface FieldVerification {
  id: string;
  mismatchId: string;
  parcelId: string;
  plotNumber: string;
  officerId: string;
  officerName: string;
  officerRole: string;
  verificationDate: string;
  gpsLatitude: number;
  gpsLongitude: number;
  gpsAccuracyMeters: number;
  result: 'Verified Match' | 'Boundary Mismatch' | 'Area Mismatch' | 'Possible Encroachment' | 'Dispute';
  boundaryDisputeReason?: string;
  remarks: string;
  uploadedEvidence: string[]; // image URLs / base64
  witnessNames?: string[];
  signatureAcknowledged: boolean;
  status: 'Submitted' | 'Reviewed' | 'Action Taken';
}

export interface AIAnalysisResult {
  id: string;
  sourceImage: string;
  confidenceScore: number;
  detectedParcelsCount: number;
  detectedBoundaries: GeoJSONPolygon[];
  estimatedTotalAreaAcre: number;
  anomaliesDetected: string[];
  modelUsed: string;
  processingTimeMs: number;
}

export interface DashboardStats {
  totalParcels: number;
  totalCadastralAreaAcre: number;
  verifiedParcels: number;
  pendingSurveys: number;
  mismatchedParcels: number;
  disputedParcels: number;
  mutationPending: number;
  possibleEncroachments: number;
  totalSurveyCoveragePercent: number;
  villageSummary: {
    villageName: string;
    totalParcels: number;
    mismatchCount: number;
    verifiedCount: number;
  }[];
  mismatchTypeCounts: Record<MismatchType, number>;
  landTypeCounts: Record<LandType, number>;
  monthlyProgress: { month: string; surveyed: number; verified: number; mismatches: number }[];
}
