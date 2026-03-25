import React from 'react';
import CompanyPad, { SignatureEntry } from '@/components/CompanyPad';

interface ReportPagesProps {
  pages: React.ReactNode[];
  includeSignature?: boolean;
  signatures?: SignatureEntry[];
  reportId?: string;
}

const ReportPages: React.FC<ReportPagesProps> = ({
  pages,
  includeSignature = false,
  signatures = [],
  reportId,
}) => {
  return (
    <div>
      {pages.map((page, index) => (
        <CompanyPad
          key={index}
          includeSignature={includeSignature && index === pages.length - 1}
          signatures={signatures}
          reportId={reportId}
        >
          {page}
        </CompanyPad>
      ))}
    </div>
  );
};

export default ReportPages;