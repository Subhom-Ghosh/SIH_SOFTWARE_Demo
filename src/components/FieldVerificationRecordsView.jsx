import React from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MapPin,
  ShieldAlert,
  UserRound
} from 'lucide-react';

const resultStyles = {
  'Verified Match': 'bg-emerald-950 text-emerald-300 border-emerald-800',
  'Possible Encroachment': 'bg-red-950 text-red-300 border-red-800',
  'Boundary Mismatch': 'bg-amber-950 text-amber-300 border-amber-800',
  'Area Mismatch': 'bg-rose-950 text-rose-300 border-rose-800',
  Dispute: 'bg-pink-950 text-pink-300 border-pink-800'
};

const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString();
};

const statusLabels = {
  Submitted: 'Pending Official Review',
  Reviewed: 'Reviewed by Official',
  'Action Taken': 'Issue Resolved / Action Taken'
};

const statusStyles = {
  Submitted: 'bg-amber-950 text-red-500 border-amber-800 font-bold',
  Reviewed: 'bg-sky-950 text-sky-300 border-sky-800',
  'Action Taken': 'bg-emerald-950 text-emerald-300 border-emerald-800'
};

export const FieldVerificationRecordsView = ({ verifications = [], onNavigate, onStatusChange }) => {
  return (
    <div className="min-h-[calc(100vh-80px)] overflow-y-auto bg-slate-950 p-4 text-slate-100 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-emerald-300">Submitted Verification Records</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">Official field reports stored in the Digital Land Information System.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('field-verification')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            New Field Verification
          </button>
        </div>

        {verifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-400">
            No field verification records have been submitted yet.
          </div>
        ) : (
          verifications.map((verification) => (
            <article key={verification.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-violet-700">{verification.plotNumber}</h3>
                    <span className="font-mono text-[11px] text-slate-400">{verification.id}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-emerald-400" />{formatDate(verification.verificationDate)}</span>
                    <span className={`flex items-center gap-1 rounded-md border px-2 py-1 font-semibold ${statusStyles[verification.status] || statusStyles.Submitted}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {statusLabels[verification.status] || statusLabels.Submitted}
                    </span>
                  </div>
                </div>
                <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${resultStyles[verification.result] || 'border-slate-700 bg-slate-800 text-slate-200'}`}>
                  {verification.result}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-800/50 bg-amber-950/30 p-3">
                <div>
                  <div className="text-xs font-bold text-amber-900">Official Resolution Status</div>
                  <div className="mt-0.5 text-[11px] text-amber-900/70 font-bold">
                    Officials can review this report and mark the issue as resolved after action.
                  </div>
                </div>
                <select
                  aria-label={`Update official status for ${verification.plotNumber}`}
                  value={verification.status || 'Submitted'}
                  onChange={(event) => onStatusChange && onStatusChange(verification.id, event.target.value)}
                  className="rounded-lg border border-amber-700 bg-slate-900 px-2.5 py-2 text-xs font-semibold text-red-700 outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Submitted">Pending Official Review</option>
                  <option value="Reviewed">Reviewed by Official</option>
                  <option value="Action Taken">Issue Resolved / Action Taken</option>
                </select>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400"><FileText className="h-3.5 w-3.5 text-cyan-400" />Parcel Reference</div>
                  <div className="mt-1 text-sm font-semibold text-black">{verification.parcelId}</div>
                  <div className="text-[11px] text-slate-400">Mismatch: {verification.mismatchId}</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400"><UserRound className="h-3.5 w-3.5 text-amber-400" />Field Officer</div>
                  <div className="mt-1 text-sm font-semibold text-black">{verification.officerName}</div>
                  <div className="text-[11px] text-slate-400">{verification.officerRole} ({verification.officerId})</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400"><MapPin className="h-3.5 w-3.5 text-emerald-400" />RTK Location</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-emerald-700">{verification.gpsLatitude}° N</div>
                  <div className="font-mono text-[11px] text-slate-400">{verification.gpsLongitude}° E, +/-{verification.gpsAccuracyMeters}m</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400"><ShieldAlert className="h-3.5 w-3.5 text-rose-400" />Signature</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-700">{verification.signatureAcknowledged ? 'Acknowledged' : 'Not acknowledged'}</div>
                  <div className="text-[11px] text-slate-400">Official submission record</div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Officer Remarks</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200">{verification.remarks || 'No remarks submitted.'}</p>
                  <div className="mt-3 text-[10px] font-bold uppercase text-slate-400">Witnesses</div>
                  <p className="mt-1 text-xs text-slate-300">{verification.witnessNames?.length ? verification.witnessNames.join(', ') : 'No witnesses recorded.'}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Uploaded Evidence</div>
                  {verification.uploadedEvidence?.length ? (
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {verification.uploadedEvidence.map((photo, index) => (
                        <a key={`${verification.id}-evidence-${index}`} href={photo} target="_blank" rel="noreferrer" className="aspect-video overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
                          <img src={photo} alt={`Evidence ${index + 1} for ${verification.plotNumber}`} className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-400">No evidence uploaded.</p>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
