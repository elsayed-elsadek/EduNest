
import { type FC, useState } from 'react';
import { Download, Share2, Award, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import type { Certificate } from '../../../../types/student-role-types/Certificate.types';

// ── helpers 
const rankLabel = (r: number) => `Rank ${r}`;

// ── PDF generator
async function downloadCertificateAsPdf(cert: Certificate): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf = (await import('html2pdf.js')).default as any;
  const el = document.getElementById(`cert-doc-${cert.id}`);
  if (!el) return;
  await html2pdf()
    .set({
      margin:      0,
      filename:    `EduNest-${cert.mentorshipTitle.replace(/\s+/g, '-')}.pdf`,
      image:       { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF:       { unit: 'px', format: [794, 562], orientation: 'landscape' },
    })
    .from(el)
    .save();
}

async function shareCertificateAsPdf(cert: Certificate): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf = (await import('html2pdf.js')).default as any;
  const el = document.getElementById(`cert-doc-${cert.id}`);
  if (!el) return;
  const blob: Blob = await html2pdf()
    .set({ margin: 0, image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 3 }, jsPDF: { unit: 'px', format: [794, 562], orientation: 'landscape' } })
    .from(el).outputPdf('blob');
  const file = new File([blob], `EduNest-${cert.mentorshipTitle}.pdf`, { type: 'application/pdf' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: 'EduNest Certificate', files: [file] }).catch(() => {});
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
  }
}

// ── Certificate document (hidden, PDF source) ─────────────────────────────────
const CertificateDocument: FC<{ cert: Certificate }> = ({ cert }) => (
  <div
    id={`cert-doc-${cert.id}`}
    style={{
      width: '794px', height: '562px',
      background: '#FAFAF2',
      border: '14px solid #0c2d48',
      outline: '4px solid #C9A84C', outlineOffset: '-22px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      position: 'relative',
      padding: '44px 64px', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflow: 'hidden',
    }}
  >
    {(['top-left','top-right','bottom-left','bottom-right'] as const).map(pos => {
      const [v, h] = pos.split('-');
      return (
        <div key={pos} style={{
          position: 'absolute', [v]: 28, [h]: 28, width: 40, height: 40,
          borderTop: v==='top' ? '3px solid #C9A84C' : 'none',
          borderBottom: v==='bottom' ? '3px solid #C9A84C' : 'none',
          borderLeft: h==='left' ? '3px solid #C9A84C' : 'none',
          borderRight: h==='right' ? '3px solid #C9A84C' : 'none',
        }} />
      );
    })}
    {([-170, 170] as number[]).map(x =>
      (['top','bottom'] as const).map(v => (
        <div key={`${x}-${v}`} style={{ position:'absolute',[v]:50,left:'50%',transform:`translateX(calc(-50% + ${x}px))`,fontSize:90,opacity:0.05,userSelect:'none',pointerEvents:'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen style={{ width: '90px', height: '90px' }} />
        </div>
      ))
    )}
    <div style={{ textAlign:'center', marginBottom:18 }}>
      <p style={{ fontSize:13,letterSpacing:5,color:'#0c2d48',fontFamily:'sans-serif',fontWeight:700,margin:0,textTransform:'uppercase' }}>Official Certification</p>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:8 }}>
        <div style={{ width:26,height:26,background:'#0c2d48',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <span style={{ color:'#C9A84C',fontSize:13,fontWeight:900,fontFamily:'sans-serif' }}>E</span>
        </div>
        <span style={{ fontSize:17,fontFamily:'sans-serif',fontWeight:700,color:'#0c2d48' }}>Edu<span style={{ color:'#C9A84C' }}>Nest</span></span>
      </div>
      <div style={{ width:200,height:1,background:'#0c2d48',margin:'12px auto 0' }} />
    </div>
    <p style={{ fontSize:40,fontWeight:700,color:'#0c2d48',margin:'0 0 6px',textAlign:'center',letterSpacing:1 }}>{cert.studentFullName}</p>
    <div style={{ color:'#C9A84C',fontSize:20,margin:'0 0 14px',lineHeight:1 }}>〜</div>
    <p style={{ fontSize:21,fontWeight:400,color:'#333',margin:'0 0 24px',textAlign:'center' }}>{cert.mentorshipTitle}</p>
    <div style={{ display:'flex',width:'100%',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22 }}>
      <div>
        <p style={{ fontSize:10,letterSpacing:3,color:'#888',fontFamily:'sans-serif',margin:'0 0 4px',textTransform:'uppercase' }}>Lead Mentor</p>
        <p style={{ fontSize:15,color:'#0c2d48',margin:0,fontWeight:600 }}>{cert.mentorFullName}</p>
        <p style={{ fontSize:10,letterSpacing:3,color:'#888',fontFamily:'sans-serif',margin:'12px 0 4px',textTransform:'uppercase' }}>Date of Issue</p>
        <p style={{ fontSize:15,color:'#0c2d48',margin:0 }}>{cert.issuedAt}</p>
      </div>
      <p style={{ fontSize:15,fontWeight:700,color:'#0c2d48',margin:0 }}>Academic Rank: {rankLabel(cert.rank)}</p>
    </div>
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center' }}>
      <div style={{ width:96,height:96,borderRadius:'50%',background:'radial-gradient(circle at 35% 35%, #F5D98C, #C9A84C 50%, #8B6914)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(0,0,0,0.25)',position:'relative' }}>
        <div style={{ position:'absolute',inset:6,borderRadius:'50%',border:'2px dashed rgba(255,255,255,0.5)' }} />
        <span style={{ fontSize:8,fontFamily:'sans-serif',fontWeight:900,color:'#fff',letterSpacing:1.5,textTransform:'uppercase',textAlign:'center',lineHeight:1.4,whiteSpace:'pre-line' }}>{'EDUNEST\nACADEMY'}</span>
        <div style={{ width:26,height:26,background:'#0c2d48',borderRadius:5,margin:'3px 0',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <span style={{ color:'#C9A84C',fontSize:11,fontWeight:900,fontFamily:'sans-serif' }}>E</span>
        </div>
        <span style={{ fontSize:6.5,fontFamily:'sans-serif',fontWeight:700,color:'#fff',letterSpacing:1,textTransform:'uppercase' }}>OFFICIAL SEAL</span>
      </div>
    </div>
  </div>
);

// ── Certificate modal 
const CertificateModal: FC<{ cert: Certificate; onClose: () => void }> = ({ cert, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [sharing,     setSharing]     = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex flex-col items-center gap-5">
        <div className="shadow-2xl rounded-lg overflow-hidden" style={{ transform:'scale(0.83)', transformOrigin:'center center' }}>
          <CertificateDocument cert={cert} />
        </div>
        <div className="flex gap-3">
          <button onClick={async () => { setDownloading(true); await downloadCertificateAsPdf(cert); setDownloading(false); }}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-3 bg-[#0c2d48] text-white text-sm font-bold rounded-xl hover:bg-[#0a2438] transition-colors shadow-lg disabled:opacity-60">
            <Download className="w-4 h-4" />
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
          <button onClick={async () => { setSharing(true); await shareCertificateAsPdf(cert); setSharing(false); }}
            disabled={sharing}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60">
            <Share2 className="w-4 h-4" />
            {sharing ? 'Preparing…' : 'Share as PDF'}
          </button>
          <button onClick={onClose} className="px-6 py-3 bg-white border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Certificate card 
const CertificateCard: FC<{ cert: Certificate; onView: (c: Certificate) => void }> = ({ cert, onView }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow relative">
    {/* Hidden PDF source */}
    <div style={{ position:'absolute', left:'-9999px', top:0, pointerEvents:'none' }}>
      <CertificateDocument cert={cert} />
    </div>

    <div className="flex items-center gap-3">
      <span className="px-3 py-1 text-[10px] font-bold tracking-widest text-[#0c2d48] border border-[#0c2d48]/30 rounded-full uppercase">
        Official Credential
      </span>
      <span className="flex items-center gap-1.5 text-sm font-bold text-amber-600">
        <Award className="w-4 h-4" />
        {rankLabel(cert.rank)}
      </span>
    </div>

    <h2 className="text-2xl font-bold text-gray-900">Mentorship: {cert.mentorshipTitle}</h2>

    <div className="grid grid-cols-2 gap-y-5">
      {[
        { label: 'Student Scholar', value: cert.studentFullName },
        { label: 'Lead Mentor',     value: cert.mentorFullName  },
        { label: 'Conferred Date',  value: cert.issuedAt        },
        { label: 'Credential ID',   value: cert.credentialId, mono: true },
      ].map(({ label, value, mono }) => (
        <div key={label}>
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">{label}</p>
          <p className={`text-sm text-gray-900 ${mono ? 'font-mono' : 'font-semibold'}`}>{value}</p>
        </div>
      ))}
    </div>

    <div className="flex items-center gap-3 pt-1">
      <button onClick={() => onView(cert)}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#0c2d48] text-white text-sm font-bold rounded-xl hover:bg-[#0a2438] transition-colors">
        <Download className="w-4 h-4" />
        Download PDF
      </button>
      <button onClick={async () => { await shareCertificateAsPdf(cert); }}
        className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
        <Share2 className="w-4 h-4" />
        Share Achievement
      </button>
    </div>
  </div>
);

// ── Pagination bar — always visible 
const PaginationBar: FC<{
  currentPage:  number;
  totalPages:   number;
  totalElements: number;
  pageSize:     number;
  onPageChange: (p: number) => void;
}> = ({ currentPage, totalPages, totalElements, pageSize, onPageChange }) => {
  const from = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to   = Math.min(currentPage * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between py-3 px-1">
      {/* Left: showing X-Y of Z */}
      <p className="text-sm text-gray-500">
        {totalElements === 0
          ? 'No certificates'
          : <>Showing <span className="font-semibold text-gray-700">{from}–{to}</span> of <span className="font-semibold text-gray-700">{totalElements}</span> credential{totalElements !== 1 ? 's' : ''}</>
        }
      </p>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages || 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold border transition-all
              ${currentPage === i + 1
                ? 'bg-[#0c2d48] text-white border-[#0c2d48]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= (totalPages || 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Main tab
interface CertificationTabProps {
  certificates:  Certificate[];
  loading:       boolean;
  currentPage:   number;
  totalPages:    number;
  totalElements: number;
  pageSize:      number;
  onPageChange:  (p: number) => void;
}

const Skel: FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const CertificationTab: FC<CertificationTabProps> = ({
  certificates, loading, currentPage, totalPages, totalElements, pageSize, onPageChange,
}) => {
  const [selected, setSelected] = useState<Certificate | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Earned Credentials</h1>
        <p className="text-sm text-gray-500 mt-1">A record of your academic milestones and professional masteries.</p>
      </div>

      {/* Pagination bar — always visible */}
      <div className="border-b border-gray-100 pb-3">
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[0, 1].map(i => <Skel key={i} className="h-56" />)}
        </div>
      )}

      {/* Empty */}
      {!loading && certificates.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-20 text-center">
          <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No certificates yet</h3>
          <p className="text-sm text-gray-400">Complete a mentorship to earn your first credential.</p>
        </div>
      )}

      {/* Cards */}
      {!loading && certificates.length > 0 && (
        <div className="space-y-6">
          {certificates.map(cert => (
            <CertificateCard key={cert.id} cert={cert} onView={setSelected} />
          ))}
        </div>
      )}

      {/* Bottom pagination (only if multi-page) */}
      {!loading && totalPages > 1 && (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}

      {selected && <CertificateModal cert={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default CertificationTab;