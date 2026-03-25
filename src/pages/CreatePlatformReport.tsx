import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReportPages from '@/components/report/ReportPages';
import AdditionalPagesControl from '@/components/report/AdditionalPagesControl';
import SignatureConfig, { getDefaultSignatures } from '@/components/SignatureConfig';
import { saveReport, generateReportId } from '@/lib/report-store';
import { exportToPDF, exportToJPG } from '@/lib/export';
import {
  PLATFORM_CHANNEL_OPTIONS,
  PLATFORM_TEMPLATE_OPTIONS,
  ONLINE_TARGET_OPTIONS,
  ONLINE_ACTION_OPTIONS,
  POS_ACTION_OPTIONS,
  POS_TARGET_OPTIONS,
  OPERATIONAL_REASON_OPTIONS,
  createDefaultHoursEntries,
  formatLongDate,
  formatTime12h,
  getPlatformIntro,
  getPlatformClosing,
  getPlatformHeading,
} from '@/lib/report-templates';
import { ArrowLeft, Download, Image, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { BRANCHES, PlatformReportData, PlatformItem, PlatformHoursEntry, PlatformTemplateType } from '@/types/report';
import { SignatureEntry } from '@/components/CompanyPad';

function makeDefault(): PlatformReportData {
  return {
    type: 'platform',
    date: new Date().toISOString().split('T')[0],
    reportId: generateReportId(),
    branch: '',
    platforms: [],
    templateType: 'online-menu-update',
    subject: '',
    details: '',
    items: [{ id: crypto.randomUUID(), itemName: '', newPrice: '' }],
    hoursTable: createDefaultHoursEntries(),
    confirmedBy: '',
    additionalNote: '',
    includeSignature: true,
    extraPages: 0,
    signatures: getDefaultSignatures(3),
    onlineActionType: 'Add',
    onlineUpdateTarget: 'Food Item',
    operationalReasonType: 'Eid-ul-Fitr',
    operationalReasonNote: '',
    posActionType: 'Add',
    posTargetType: 'POS Item',
  };
}

/* ─── Preview ─── */
const PlatformPreview: React.FC<{ data: PlatformReportData & { customIntro?: string; customClosing?: string } }> = ({ data }) => {
  const heading = getPlatformHeading(data);
  const intro = data.customIntro ?? getPlatformIntro(data);
  const closing = data.customClosing ?? getPlatformClosing(data);

  const mainPage = (
    <>
      <h2 className="text-center font-bold underline" style={{ fontSize: '15px', marginBottom: '18px', lineHeight: 1.4 }}>
        {heading}
      </h2>

      <p style={{ marginBottom: '4px' }}>Date: {formatLongDate(data.date)}</p>
      
      {data.platforms.length > 0 && (
        <p style={{ marginBottom: '4px' }}><strong>Platform(s):</strong> {data.platforms.join(', ')}</p>
      )}
      {data.branch && <p style={{ marginBottom: '12px' }}><strong>Branch:</strong> {data.branch}</p>}

      {data.subject && (
        <p style={{ marginBottom: '10px' }}><strong><u>Subject: {data.subject}</u></strong></p>
      )}

      {/* Intro paragraph */}
      <p style={{ marginBottom: '14px', textAlign: 'justify', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{intro}</p>

      {/* TIN/BIN/Branch Setup — professional card display */}
      {data.templateType === 'pos-3s-update' && (data.posTargetType === 'BIN' || data.posTargetType === 'TIN' || data.posTargetType === 'Branch Setup') && data.items.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {data.items.map((item, idx) => (
            <div key={item.id} style={{ marginBottom: '12px' }}>
              {/* Highlighted box — only title & number */}
              <div style={{
                border: '1.5px solid #222',
                borderRadius: '6px',
                padding: '12px 20px',
                background: '#fafafa',
              }}>
                <span style={{ fontSize: '11px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
                  {(item as any).label || `${data.posTargetType} #${idx + 1}`}
                </span>
                <p style={{
                  fontSize: (data.posTargetType === 'BIN' || data.posTargetType === 'TIN') ? '18px' : '14px',
                  fontWeight: 700,
                  letterSpacing: (data.posTargetType === 'BIN' || data.posTargetType === 'TIN') ? '2px' : '0.5px',
                  fontFamily: (data.posTargetType === 'BIN' || data.posTargetType === 'TIN') ? 'monospace' : 'inherit',
                  margin: 0,
                }}>
                  {item.itemName || '—'}
                </p>
              </div>
              {/* Details outside the box */}
              <div style={{ paddingLeft: '20px', marginTop: '4px' }}>
                {item.branch && <p style={{ fontSize: '12px', color: '#444', margin: '2px 0' }}>Branch: {item.branch}</p>}
                {item.category && <p style={{ fontSize: '12px', color: '#555', margin: '2px 0' }}>{item.category}</p>}
                {item.showDescription && item.description && (
                  <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', margin: '2px 0' }}>{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Items list for online-menu-update & pos-3s-update (POS Item / Other) */}
      {(data.templateType === 'online-menu-update' || (data.templateType === 'pos-3s-update' && data.posTargetType !== 'BIN' && data.posTargetType !== 'TIN' && data.posTargetType !== 'Branch Setup')) && data.items.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {(() => {
            const grouped: { category: string; items: PlatformItem[] }[] = [];
            data.items.forEach((item) => {
              const cat = item.category || '';
              const existing = grouped.find(g => g.category === cat);
              if (existing) existing.items.push(item);
              else grouped.push({ category: cat, items: [item] });
            });
            let counter = 0;
            return grouped.map((group) => (
              <div key={group.category} style={{ marginBottom: '10px' }}>
                {group.category && (
                  <p style={{ fontWeight: 600, marginBottom: '4px', textDecoration: 'underline' }}>{group.category}:</p>
                )}
                <div style={{ marginLeft: '20px' }}>
                  {group.items.map((item) => {
                    counter++;
                    return (
                      <div key={item.id} style={{ marginBottom: '5px' }}>
                        <p>
                          {counter}. {item.itemName || '—'}
                          {item.branch ? ` (${item.branch})` : ''}
                          {item.oldPrice ? ` — Old: ${item.oldPrice} BDT` : ''}
                          {item.newPrice ? ` — New: ${item.newPrice} BDT` : ''}
                        </p>
                        {item.showDescription && item.description && (
                          <p style={{ marginLeft: '16px', fontSize: '13px', color: '#333', fontStyle: 'italic' }}>{item.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Hours table for operational-hours */}
      {data.templateType === 'operational-hours' && data.hoursTable.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
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
              {data.hoursTable.map((entry, i) => (
                <tr key={entry.id}>
                  <td style={{ border: '1px solid #000', padding: '5px 10px', fontSize: '12px' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '5px 10px', fontSize: '12px' }}>{entry.branch || '—'}</td>
                  <td style={{ border: '1px solid #000', padding: '5px 10px', fontSize: '12px', textAlign: 'center' }}>{formatTime12h(entry.servingTime)}</td>
                  <td style={{ border: '1px solid #000', padding: '5px 10px', fontSize: '12px', textAlign: 'center' }}>{formatTime12h(entry.lastOrderTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.additionalNote && (
        <p style={{ marginBottom: '10px' }}><strong><u>Note:</u></strong> {data.additionalNote}</p>
      )}

      {/* Closing paragraph */}
      <p style={{ marginBottom: '14px', textAlign: 'justify', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{closing}</p>
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

/* ─── Page Component ─── */
const CreatePlatformReport: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previewRef = useRef<HTMLDivElement>(null);

  const editReport = (location.state as any)?.edit as any | undefined;
  const duplicateData = (location.state as any)?.duplicate as PlatformReportData | undefined;

  const [data, setData] = useState<PlatformReportData>(() => {
    if (editReport) return { ...makeDefault(), ...editReport.data };
    if (duplicateData) return { ...makeDefault(), ...duplicateData, reportId: generateReportId(), date: new Date().toISOString().split('T')[0] };
    return makeDefault();
  });
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  const update = (partial: Partial<PlatformReportData>) => setData(prev => ({ ...prev, ...partial }));

  const togglePlatform = (p: string) => {
    const current = data.platforms;
    update({ platforms: current.includes(p) ? current.filter(x => x !== p) : [...current, p] });
  };

  const addItem = () => update({ items: [...data.items, { id: crypto.randomUUID(), itemName: '', newPrice: '' }] });
  const updateItem = (id: string, partial: Partial<PlatformItem>) =>
    update({ items: data.items.map(item => item.id === id ? { ...item, ...partial } : item) });
  const removeItem = (id: string) => update({ items: data.items.filter(item => item.id !== id) });

  const updateHours = (id: string, partial: Partial<PlatformHoursEntry>) =>
    update({ hoursTable: data.hoursTable.map(h => h.id === id ? { ...h, ...partial } : h) });

  const handleSave = async () => {
    try {
      await saveReport({
        id: editReport?.id || undefined,
        type: 'platform',
        title: `Platform Report - ${data.templateType} - ${data.reportId}`,
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
      await exportToPDF(previewRef.current!, `Platform_${data.reportId}`);
      toast.success('PDF downloaded');
    }, 300);
  };

  const handleExportJPG = async () => {
    if (!previewRef.current) return;
    setActiveTab('preview');
    setTimeout(async () => {
      await exportToJPG(previewRef.current!, `Platform_${data.reportId}`);
      toast.success('JPG downloaded');
    }, 300);
  };

  const isOnline = data.templateType === 'online-menu-update';
  const isHours = data.templateType === 'operational-hours';
  const isPOS = data.templateType === 'pos-3s-update';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10 no-print">
        <div className="container max-w-7xl flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4" /></Button>
            <div>
              <h1 className="text-sm font-bold">Platform Report</h1>
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
              {/* Template selector */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Report Template</Label>
                <Select value={data.templateType} onValueChange={(v: PlatformTemplateType) => update({ templateType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLATFORM_TEMPLATE_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform channels (multi-select checkboxes) */}
              {!isPOS && (
                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="flex flex-wrap gap-4">
                    {PLATFORM_CHANNEL_OPTIONS.filter(p => p !== '3S POS System').map(p => (
                      <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={data.platforms.includes(p)} onCheckedChange={() => togglePlatform(p)} />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="space-y-2">
                <Label>Report Date</Label>
                <Input type="date" value={data.date} onChange={e => update({ date: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select value={data.branch} onValueChange={v => update({ branch: v })}>
                    <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>{BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={data.subject} onChange={e => update({ subject: e.target.value })} placeholder="e.g. Menu Update Request" />
                </div>
              </div>

              {/* ─── Online template fields ─── */}
              {isOnline && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Action</Label>
                      <Select value={data.onlineActionType} onValueChange={(v: any) => update({ onlineActionType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{ONLINE_ACTION_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Update Target</Label>
                      <Select value={data.onlineUpdateTarget} onValueChange={(v: any) => update({ onlineUpdateTarget: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{ONLINE_TARGET_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  {data.onlineUpdateTarget === 'Other' && (
                    <div className="space-y-2">
                      <Label>Specify Target</Label>
                      <Input value={(data as any).onlineUpdateTargetNote || ''} onChange={e => update({ onlineUpdateTargetNote: e.target.value } as any)} placeholder="e.g. Store Banner" />
                    </div>
                  )}
                </>
              )}

              {/* ─── POS template fields ─── */}
              {isPOS && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Action</Label>
                      <Select value={data.posActionType} onValueChange={(v: any) => update({ posActionType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{POS_ACTION_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target</Label>
                      <Select value={data.posTargetType} onValueChange={(v: any) => update({ posTargetType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{POS_TARGET_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  {data.posActionType === 'Other' && (
                    <div className="space-y-2">
                      <Label>Specify Action</Label>
                      <Input value={(data as any).posActionNote || ''} onChange={e => update({ posActionNote: e.target.value } as any)} placeholder="Describe action..." />
                    </div>
                  )}
                  {data.posTargetType === 'Other' && (
                    <div className="space-y-2">
                      <Label>Specify Target</Label>
                      <Input value={(data as any).posTargetNote || ''} onChange={e => update({ posTargetNote: e.target.value } as any)} placeholder="Describe target..." />
                    </div>
                  )}
                </>
              )}

              {/* ─── Operational hours fields ─── */}
              {isHours && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Reason</Label>
                      <Select value={data.operationalReasonType} onValueChange={(v: any) => update({ operationalReasonType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{OPERATIONAL_REASON_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    {data.operationalReasonType === 'Other' && (
                      <div className="space-y-2">
                        <Label>Specify Reason</Label>
                        <Input value={data.operationalReasonNote} onChange={e => update({ operationalReasonNote: e.target.value })} placeholder="e.g. Ramadan hours" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Branch-wise Hours</Label>
                    <div className="space-y-2">
                      {data.hoursTable.map((entry, i) => (
                        <div key={entry.id} className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 items-end">
                          <div>
                            {i === 0 && <Label className="text-xs text-muted-foreground">Branch</Label>}
                            <Input value={entry.branch} readOnly className="bg-muted/50" />
                          </div>
                          <div>
                            {i === 0 && <Label className="text-xs text-muted-foreground">Serving Time</Label>}
                            <Input type="time" value={entry.servingTime} onChange={e => updateHours(entry.id, { servingTime: e.target.value })} />
                          </div>
                          <div>
                            {i === 0 && <Label className="text-xs text-muted-foreground">Last Order</Label>}
                            <Input type="time" value={entry.lastOrderTime} onChange={e => updateHours(entry.id, { lastOrderTime: e.target.value })} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ─── Items list (online & POS) ─── */}
              {(isOnline || isPOS) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      {isPOS && (data.posTargetType === 'BIN' || data.posTargetType === 'TIN') ? `${data.posTargetType} Entries` : 'Items'}
                    </Label>
                    <Button variant="outline" size="sm" onClick={addItem} className="gap-1"><Plus className="w-3.5 h-3.5" /> Add</Button>
                  </div>
                  {data.items.map((item, i) => {
                    const isBinTin = isPOS && (data.posTargetType === 'BIN' || data.posTargetType === 'TIN');
                    const isBranchSetup = isPOS && data.posTargetType === 'Branch Setup';
                    const showPrice = !isBinTin && !isBranchSetup;
                    const showCategory = !isBinTin;
                    const showBranch = isPOS;

                    return (
                      <Card key={item.id} className="p-4 space-y-3 border-dashed">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            {isBinTin ? `${data.posTargetType} #${i + 1}` : `Item #${i + 1}`}
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive h-7 w-7"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>

                        {/* BIN/TIN: label + number */}
                        {isBinTin && (
                          <>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Card Label</Label>
                              <Input
                                value={(item as any).label || ''}
                                onChange={e => updateItem(item.id, { label: e.target.value } as any)}
                                placeholder={`${data.posTargetType} #${i + 1}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">{data.posTargetType} Number</Label>
                              <Input value={item.itemName} onChange={e => updateItem(item.id, { itemName: e.target.value })} placeholder="e.g. 1234567890" />
                            </div>
                          </>
                        )}

                        {/* Non BIN/TIN: item name + category */}
                        {!isBinTin && (
                          <div className={`grid gap-3 ${showCategory ? 'grid-cols-[1fr_120px]' : ''}`}>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Item Name</Label>
                              <Input value={item.itemName} onChange={e => updateItem(item.id, { itemName: e.target.value })} placeholder="Item name" />
                            </div>
                            {showCategory && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Category</Label>
                                <Input value={item.category || ''} onChange={e => updateItem(item.id, { category: e.target.value })} placeholder="e.g. Hot Drinks" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Branch (POS templates only) */}
                        {showBranch && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Branch</Label>
                            <Select value={item.branch || ''} onValueChange={v => updateItem(item.id, { branch: v })}>
                              <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                              <SelectContent>{BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Price fields (only for menu/food items) */}
                        {showPrice && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Old Price (optional)</Label>
                              <Input value={item.oldPrice || ''} onChange={e => updateItem(item.id, { oldPrice: e.target.value })} placeholder="BDT" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">New Price</Label>
                              <Input value={item.newPrice || ''} onChange={e => updateItem(item.id, { newPrice: e.target.value })} placeholder="BDT" />
                            </div>
                          </div>
                        )}

                        {/* Description toggle */}
                        <div className="flex items-center gap-2 pt-1">
                          <Switch checked={item.showDescription || false} onCheckedChange={v => updateItem(item.id, { showDescription: v })} />
                          <Label className="text-xs text-muted-foreground cursor-pointer">Add Description</Label>
                        </div>
                        {item.showDescription && (
                          <Textarea value={item.description || ''} onChange={e => updateItem(item.id, { description: e.target.value })} placeholder="Description..." rows={2} className="min-h-[60px]" />
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Details / additional note */}
              {(isPOS && data.posTargetType === 'Other') && (
                <div className="space-y-2">
                  <Label>Details</Label>
                  <Textarea value={data.details} onChange={e => update({ details: e.target.value })} placeholder="Describe the update..." rows={3} />
                </div>
              )}

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
                    value={(data as any).customIntro ?? getPlatformIntro(data)}
                    onChange={e => update({ customIntro: e.target.value } as any)}
                    rows={4}
                    className="text-sm leading-relaxed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Closing Paragraph</Label>
                  <Textarea
                    value={(data as any).customClosing ?? getPlatformClosing(data)}
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
                <PlatformPreview data={data} />
              </div>
            </div>
            <div ref={previewRef} className="print-area" style={{ position: 'fixed', left: '-9999px', top: 0 }}>
              <PlatformPreview data={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePlatformReport;
