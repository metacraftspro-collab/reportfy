import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MenuUpdateForm from '@/components/MenuUpdateForm';
import MenuUpdatePreview from '@/components/MenuUpdatePreview';
import { MenuUpdateReport } from '@/types/report';
import { saveReport, generateReportId } from '@/lib/report-store';
import { exportToPDF, exportToJPG } from '@/lib/export';
import { ArrowLeft, Download, Image, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getDefaultSignatures } from '@/components/SignatureConfig';

function makeDefault(): MenuUpdateReport {
  return {
    type: 'menu-update',
    date: new Date().toISOString().split('T')[0],
    reportId: generateReportId(),
    branch: '',
    actionType: 'Update',
    requestTypes: [],
    updateDetails: '',
    items: [{ id: crypto.randomUUID(), itemName: '', newPrice: '' }],
    platformToUpdate: [],
    note: '',
    confirmedBy: '',
    includeSignature: true,
    extraPages: 0,
    signatures: getDefaultSignatures(3),
  };
}

function normalizeMenuUpdate(source?: Partial<MenuUpdateReport>): MenuUpdateReport {
  const defaults = makeDefault();

  return {
    ...defaults,
    ...source,
    items: source?.items?.length ? source.items : defaults.items,
    requestTypes: source?.requestTypes ?? defaults.requestTypes,
    platformToUpdate: source?.platformToUpdate ?? defaults.platformToUpdate,
    signatures: source?.signatures ?? defaults.signatures,
    extraPages: source?.extraPages ?? 0,
  };
}

const CreateMenuUpdate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previewRef = useRef<HTMLDivElement>(null);

  const editReport = (location.state as any)?.edit as any | undefined;
  const duplicateData = (location.state as any)?.duplicate as MenuUpdateReport | undefined;

  const [data, setData] = useState<MenuUpdateReport>(() => {
    if (editReport) return normalizeMenuUpdate(editReport.data);
    if (duplicateData) {
      return normalizeMenuUpdate({
        ...duplicateData,
        reportId: generateReportId(),
        date: new Date().toISOString().split('T')[0],
      });
    }
    return makeDefault();
  });

  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  const handleSave = async () => {
    try {
      await saveReport({
        id: editReport?.id || undefined,
        type: 'menu-update',
        title: `Menu Update - ${data.branch || 'Draft'} - ${data.reportId}`,
        report_id: data.reportId,
        data,
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
      await exportToPDF(previewRef.current!, `Menu_Update_${data.reportId}`);
      toast.success('PDF downloaded');
    }, 300);
  };

  const handleExportJPG = async () => {
    if (!previewRef.current) return;
    setActiveTab('preview');
    setTimeout(async () => {
      await exportToJPG(previewRef.current!, `Menu_Update_${data.reportId}`);
      toast.success('JPG downloaded');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b bg-card sticky top-0 z-10 no-print">
        <div className="container max-w-7xl flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-sm font-bold">Menu Update Report</h1>
              <p className="text-[11px] text-muted-foreground">{data.reportId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJPG} className="gap-1.5 text-xs">
              <Image className="w-3.5 h-3.5" /> JPG
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs">
              <Save className="w-3.5 h-3.5" /> Save
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="xl:hidden border-b bg-card no-print">
        <div className="container max-w-7xl flex">
          {(['form', 'preview'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                activeTab === tab ? 'border-b-2 border-foreground' : 'text-muted-foreground'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="container max-w-7xl py-6 px-4">
        <div className="grid xl:grid-cols-[1fr_auto] gap-6 items-start">
          {/* Form */}
          <Card className={`p-6 no-print ${activeTab !== 'form' ? 'hidden xl:block' : ''}`}>
            <MenuUpdateForm data={data} onChange={setData} />
          </Card>

          {/* Preview - actual A4 scale */}
          <div className={`${activeTab !== 'preview' ? 'hidden xl:block' : ''}`}>
            <p className="text-xs font-medium text-muted-foreground mb-2 no-print">Live Preview (A4)</p>
            <div className="a4-preview-wrapper rounded-lg border no-print overflow-auto" style={{ maxHeight: '85vh', width: 'fit-content' }}>
              <div style={{ transform: 'scale(0.82)', transformOrigin: 'top left', width: '794px' }}>
                <MenuUpdatePreview data={data} />
              </div>
            </div>
            {/* Hidden full-size element for export */}
            <div
              ref={previewRef}
              className="print-area"
              style={{ position: 'fixed', left: '-9999px', top: 0 }}
            >
              <MenuUpdatePreview data={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateMenuUpdate;
