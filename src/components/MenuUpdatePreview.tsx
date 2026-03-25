import React from 'react';
import ReportPages from '@/components/report/ReportPages';
import { MenuUpdateReport } from '@/types/report';

interface Props {
  data: MenuUpdateReport;
}

/**
 * Matches the exact layout of the sample "Menu/ Online Shop/ Product Add/ Update Request Form"
 * from the Cafe Arabika LTD document.
 */
const MenuUpdatePreview: React.FC<Props> = ({ data }) => {
  const fmtDate = new Date(data.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const mainPage = (
    <>
      {/* Title */}
      <h2
        className="text-center font-bold underline"
        style={{ fontSize: '15px', marginBottom: '20px', lineHeight: 1.4 }}
      >
        Menu/ Online Shop/ Product Add/ Update Request Form
      </h2>

      {/* Date */}
      <p style={{ marginBottom: '6px' }}>Date of request: {fmtDate}</p>

      {/* Branch */}
      <p style={{ marginBottom: '3px' }}>
        <strong>Branch/Branches Name:</strong>
      </p>
      <p style={{ marginLeft: '24px', marginBottom: '14px' }}>
        1. {data.branch || '—'}
      </p>

      {/* Request Type */}
      <p style={{ marginBottom: '5px' }}><strong>Request Type:</strong></p>
      <div style={{ marginBottom: '14px', lineHeight: '2' }}>
        <div className="flex flex-wrap gap-x-[40px]">
          {[
            'New Product Addition',
            'Existing Product Update',
            'Price Change',
            'Menu Update',
            'Online (Foodi, Pathao, FoodPanda) Shop Create',
            'Others',
          ].map((type) => (
            <span key={type} style={{ whiteSpace: 'nowrap' }}>
              {data.requestTypes.includes(type) ? '☑' : '☐'} {type}
              {type === 'Others' && data.requestTypes.includes('Others') && (data as any).othersDetail
                ? ` (${(data as any).othersDetail})`
                : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Update Details */}
      {data.updateDetails && (
        <p style={{ marginBottom: '12px' }}>
          <strong>Update Details: {data.updateDetails}</strong>
        </p>
      )}

      {/* Items grouped by category */}
      {data.items.length > 0 && (() => {
        const grouped: { category: string; items: typeof data.items }[] = [];
        let counter = 0;
        data.items.forEach((item) => {
          const cat = item.category || '';
          const existing = grouped.find(g => g.category === cat);
          if (existing) {
            existing.items.push(item);
          } else {
            grouped.push({ category: cat, items: [item] });
          }
        });

        return (
          <div style={{ marginBottom: '16px' }}>
            {grouped.map((group) => (
              <div key={group.category} style={{ marginBottom: '10px' }}>
                {group.category && (
                  <p style={{ fontWeight: 600, marginBottom: '4px', marginLeft: '8px', textDecoration: 'underline' }}>
                    {group.category}:
                  </p>
                )}
                <div style={{ marginLeft: '24px' }}>
                  {group.items.map((item) => {
                    counter++;
                    return (
                      <div key={item.id} style={{ marginBottom: '6px' }}>
                        <p>
                          {counter}. {item.itemName || '—'}
                          {item.newPrice ? ` - ${item.newPrice} BDT` : ''}
                        </p>
                        {item.showDescription && item.description && (
                          <p style={{ marginLeft: '16px', fontSize: '13px', color: '#333', fontStyle: 'italic' }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Note */}
      {data.note && (
        <p style={{ marginBottom: '14px' }}>
          <strong><u>Note:</u></strong> {data.note}
        </p>
      )}

      {/* Platform to be Updated */}
      <p style={{ marginBottom: '6px' }}><strong>Platform to be Updated:</strong></p>
      <div className="flex gap-[40px]" style={{ marginBottom: '16px', marginLeft: '8px' }}>
        {['POS System (3S)', 'Online Platform', 'Both'].map((p) => (
          <span key={p}>
            {data.platformToUpdate.includes(p) ? '☑' : '☐'} {p}
          </span>
        ))}
      </div>

      {/* Confirmed By */}
      {data.confirmedBy && (
        <p style={{ marginBottom: '4px' }}>
          <strong>Confirmed by (Short note if need):</strong> {data.confirmedBy}
        </p>
      )}
    </>
  );

  return (
    <ReportPages
      pages={[mainPage, ...Array.from({ length: data.extraPages || 0 }, (_, index) => <div key={index} />)]}
      includeSignature={data.includeSignature}
      signatures={data.signatures || []}
      reportId={data.reportId}
    />
  );
};

export default MenuUpdatePreview;
