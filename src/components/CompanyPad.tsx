import React from 'react';
import arabikaLogo from '@/assets/arabika-logo.png';
import footerBorder from '@/assets/footer-border.png';

export interface SignatureEntry {
  label: string;
  name: string;
  title: string;
}

interface CompanyPadProps {
  children: React.ReactNode;
  includeSignature?: boolean;
  signatures?: SignatureEntry[];
  reportId?: string;
}

const CompanyPad: React.FC<CompanyPadProps> = ({
  children,
  includeSignature = false,
  signatures = [],
  reportId,
}) => {
  return (
    <div
      className="bg-white flex flex-col"
      style={{
        width: '794px',
        minHeight: '1123px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#000',
        position: 'relative',
      }}
    >
      {/* ─── Header ─── */}
      <div className="flex items-center justify-center gap-5 px-[60px] pt-[36px] pb-[16px]">
        <img src={arabikaLogo} alt="Arabika Coffee" className="w-[80px] h-[80px] object-contain" />
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '1px', lineHeight: 1.1 }}>
          ARABIKA COFFEE
        </h1>
      </div>

      {/* ─── Body ─── */}
      <div className="flex-1 px-[60px] pt-[8px] pb-[16px]" style={{ fontSize: '14.67px', lineHeight: '1.7' }}>
        {children}
      </div>

      {/* ─── Signature Section ─── */}
      {includeSignature && signatures.length > 0 && (
        <div className="px-[60px] pb-[20px]" style={{ fontSize: '12px' }}>
          <div
            className="flex mt-[24px]"
            style={{
              justifyContent: signatures.length === 1 ? 'flex-start' : 'space-between',
            }}
          >
            {signatures.map((sig, i) => (
              <div key={i} className="flex flex-col items-start" style={{ minWidth: 0 }}>
                <span style={{ fontSize: '12px', marginBottom: '28px' }}>{sig.label}:</span>
                <div style={{ width: '140px', borderBottom: '1px dotted #000', marginBottom: '4px' }} />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>{sig.name}</span>
                <span style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>{sig.title}</span>
                <span style={{ fontSize: '10px', color: '#555' }}>Arabika Coffee</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Ref ID (top-right) ─── */}
      {reportId && (
        <div
          style={{
            position: 'absolute',
            right: '16px',
            top: '8px',
            fontSize: '9px',
            color: '#999',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}
        >
          {reportId}
        </div>
      )}

      {/* ─── Footer ─── */}
      <div className="mt-auto">
        <img src={footerBorder} alt="" className="w-full h-auto" style={{ display: 'block' }} />
      </div>
    </div>
  );
};

export default CompanyPad;
