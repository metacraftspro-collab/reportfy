import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReportPages from '@/components/report/ReportPages';
import AdditionalPagesControl from '@/components/report/AdditionalPagesControl';
import SignatureConfig, { getDefaultSignatures } from '@/components/SignatureConfig';
import { saveReport, generateReportId } from '@/lib/report-store';
import { exportToPDF, exportToJPG } from '@/lib/export';
import { TIMING_PURPOSE_OPTIONS, formatLongDate, formatTime12h, getTimingIntro, getTimingClosing } from '@/lib/report-templates';
import { ArrowLeft, Download, Image, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { BRANCHES, TimingEntry, TimingNoticeData } from '@/types/report';

function makeDefault(): TimingNoticeData {
  return {
    type: 'operational-timing',
    date: new Date().toISOString().split('T')[0],
    reportId: generateReportId(),
    subject: '',
    effectiveDate: '',
    purposeType: 'Regular Update',
    purposeDetails: '',
    timings: BRANCHES.slice(0, 8).map(b => ({
      id: crypto.randomUUID(),
      branch: b,
      openTime: '',
      closeTime: '',
    })),
    additionalNote: '',
    includeSignature: true,
    extraPages: 0,
    signatures: getDefaultSignatures(3),
  };
}

const TimingPreview: React.FC<{ data: TimingNoticeData & { customIntro?: string; customClosing?: string } }> = ({ data }) => {
  const intro = data.customIntro ?? getTimingIntro(data);
  const closing = data.customClosing ?? getTimingClosing(data);

  const mainPage = (
    <>
      <h2 className="text-center font-bold underline" style={{ fontSize: '15px', marginBottom: '18px', lineHeight: 1.4 }}>
        Operational Timing Notice
      </h2>
      <p style={{ marginBottom: '4px' }}>Date: {formatLongDate(data.date)}</p>
      

      {data.subject && (
        <p style={{ marginBottom: '10px' }}><strong><u>Subject: {data.subject}</u></strong></p>
      )}

      {data.effectiveDate && (
        <p style={{ marginBottom: '10px' }}><strong>Effective Date:</strong> {formatLongDate(data.effectiveDate)}</p>
      )}

      {/* Intro greeting */}
      <p style={{ marginBottom: '14px', textAlign: 'justify', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{intro}</p>

      {data.timings.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ marginBottom: '6px' }}><strong>Branch-wise Timing Schedule:</strong></p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'left', fontSize: '12px', fontWeight: 700 }}>SL</th>
                <th style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'left', fontSize: '12px', fontWeight: 700 }}>Branch</th>
                <th style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>Serving Time</th>
                <th style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>Last Order Time</th>
              </tr>
            </thead>
            <tbody>
              {data.timings.map((t, i) => (
                <tr key={t.id}>
                  <td style={{ border: '1px solid #000', padding: '5px 10px', fontSize: '12px' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '5px 10px', fontSize: '12px' }}>{t.branch || '—'}</td>
                  <td style={{ border: '1px solid #000', padding: '5px 10px', fontSize: '12px', textAlign: 'center' }}>{formatTime12h(t.openTime)}</td>
                  <td style={{ border: '1px solid #000', padding: '5px 10px', fontSize: '12px', textAlign: 'center' }}>{formatTime12h(t.closeTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.additionalNote && (
        <p style={{ marginBottom: '10px' }}><strong><u>Note:</u></strong> {data.additionalNote}</p>
      )}

      <p style={{ marginTop: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {closing}
      </p>
    </>
  );

  const extraPages = Array.from({ length: data.extraPages }, (_, i) => (
    <div key={`extra-${i}`} style={{ minHeight: '900px' }} />
  ));

  return (
    <ReportPages
      pages={[mainPage, ...extraPages]}
      includeSignature={data.includeSignature}
      signatures={data.signatures}
      reportId={data.reportId}
    />
  );
};

const CreateTimingNotice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previewRef = useRef<HTMLDivElement>(null);

  const editReport = (location.state as any)?.edit as any | undefined;
  const duplicateData = (location.state as any)?.duplicate as TimingNoticeData | undefined;

  const [data, setData] = useState<TimingNoticeData>(() => {
    if (editReport) return { ...makeDefault(), ...editReport.data };
    if (duplicateData) return { ...makeDefault(), ...duplicateData, reportId: generateReportId(), date: new Date().toISOString().split('T')[0] };
    return makeDefault();
  });
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  const update = (partial: Partial<TimingNoticeData>) => setData(prev => ({ ...prev, ...partial }));

  const addTiming = () => update({ timings: [...data.timings, { id: crypto.randomUUID(), branch: '', openTime: '', closeTime: '' }] });
  const updateTiming = (id: string, partial: Partial<TimingEntry>) =>
    update({ timings: data.timings.map(t => t.id === id ? { ...t, ...partial } : t) });
  const removeTiming = (id: string) => update({ timings: data.timings.filter(t => t.id !== id) });

  const handleSave = async () => {
    try {
      await saveReport({
        id: editReport?.id || undefined,
        type: 'operational-timing',
        title: `Timing Notice - ${data.subject || 'Draft'} - ${data.reportId}`,
        report_id: data.reportId,
        data: data as any,
      });
      toast.success('Report saved');
      navigate('/');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setActiveTab('preview');
    setTimeout(async () => {
      await exportToPDF(previewRef.current!, `Timing_${data.reportId}`);
      toast.success('PDF downloaded');
    }, 300);
  };

  const handleExportJPG = async () => {
    if (!previewRef.current) return;
    setActiveTab('preview');
    setTimeout(async () => {
      await exportToJPG(previewRef.current!, `Timing_${data.reportId}`);
      toast.success('JPG downloaded');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10 no-print">
        <div className="container max-w-7xl flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /></Button>
            <div>
              <h1 className="text-sm font-bold">Timing Notice</h1>
              <p className="text-[11px] text-muted-foreground">{data.reportId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5 text-xs"><Download className="w-3.5 h-3.5" /> PDF</Button>
            <Button variant="outline" size="sm" onClick={handleExportJPG} className="gap-1.5 text-xs"><Image className="w-3.5 h-3.5" /> JPG</Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs"><Save className="w-3.5 h-3.5" /> Save</Button>
          </div>
        </div>
      </header>

      <div className="xl:hidden border-b bg-card no-print">
        <div className="container max-w-7xl flex">
          {(['form', 'preview'] as const).map(tab => (
            <button key={tab} className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-foreground' : 'text-muted-foreground'}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>
      </div>

      <main className="container max-w-7xl py-6 px-4">
        <div className="grid xl:grid-cols-[1fr_auto] gap-6 items-start">
          <Card className={`p-6 no-print ${activeTab !== 'form' ? 'hidden xl:block' : ''}`}>
            <div className="space-y-6">
              {/* Date */}
              <div className="space-y-2">
                <Label>Report Date</Label>
                <Input type="date" value={data.date} onChange={e => update({ date: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Select value={data.purposeType} onValueChange={(v: any) => update({ purposeType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIMING_PURPOSE_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {data.purposeType === 'Other' && (
                  <div className="space-y-2">
                    <Label>Purpose Details</Label>
                    <Input value={data.purposeDetails} onChange={e => update({ purposeDetails: e.target.value })} placeholder="Specify purpose..." />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={data.subject} onChange={e => update({ subject: e.target.value })} placeholder="e.g. Eid Operational Hours" />
                </div>
                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Input type="date" value={data.effectiveDate} onChange={e => update({ effectiveDate: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Branch-wise Timing</Label>
                  <Button variant="outline" size="sm" onClick={addTiming} className="gap-1"><Plus className="w-3.5 h-3.5" /> Add</Button>
                </div>
                {data.timings.map((t, i) => (
                  <div key={t.id} className="grid grid-cols-[1.5fr_1fr_1fr_36px] gap-2 items-end">
                    <div>
                      {i === 0 && <Label className="text-xs text-muted-foreground">Branch</Label>}
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={t.branch}
                        onChange={e => updateTiming(t.id, { branch: e.target.value })}
                      >
                        <option value="">Select branch</option>
                        {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      {i === 0 && <Label className="text-xs text-muted-foreground">Serving Time</Label>}
                      <Input type="time" value={t.openTime} onChange={e => updateTiming(t.id, { openTime: e.target.value })} />
                    </div>
                    <div>
                      {i === 0 && <Label className="text-xs text-muted-foreground">Last Order</Label>}
                      <Input type="time" value={t.closeTime} onChange={e => updateTiming(t.id, { closeTime: e.target.value })} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeTiming(t.id)} className="text-destructive h-9 w-9"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>

              {/* Editable Intro & Closing */}
              <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Intro & Closing Text</Label>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => update({ customIntro: undefined, customClosing: undefined } as any)}>
                    Reset to Default
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Opening Paragraph</Label>
                  <Textarea
                    value={(data as any).customIntro ?? getTimingIntro(data)}
                    onChange={e => update({ customIntro: e.target.value } as any)}
                    rows={4}
                    className="text-sm leading-relaxed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Closing Paragraph</Label>
                  <Textarea
                    value={(data as any).customClosing ?? getTimingClosing(data)}
                    onChange={e => update({ customClosing: e.target.value } as any)}
                    rows={3}
                    className="text-sm leading-relaxed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Note (optional)</Label>
                <Textarea value={data.additionalNote} onChange={e => update({ additionalNote: e.target.value })} rows={2} />
              </div>

              <AdditionalPagesControl value={data.extraPages} onChange={v => update({ extraPages: v })} />

              <SignatureConfig
                includeSignature={data.includeSignature}
                onToggle={v => update({ includeSignature: v })}
                signatures={data.signatures}
                onSignaturesChange={sigs => update({ signatures: sigs })}
              />
            </div>
          </Card>

          <div className={`${activeTab !== 'preview' ? 'hidden xl:block' : ''}`}>
            <p className="text-xs font-medium text-muted-foreground mb-2 no-print">Live Preview (A4)</p>
            <div className="a4-preview-wrapper rounded-lg border no-print overflow-auto" style={{ maxHeight: '85vh', width: 'fit-content' }}>
              <div style={{ transform: 'scale(0.82)', transformOrigin: 'top left', width: '794px' }}>
                <TimingPreview data={data} />
              </div>
            </div>
            <div ref={previewRef} className="print-area" style={{ position: 'fixed', left: '-9999px', top: 0 }}>
              <TimingPreview data={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTimingNotice;
