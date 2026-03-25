import React, { useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReportPages from '@/components/report/ReportPages';
import AdditionalPagesControl from '@/components/report/AdditionalPagesControl';
import SignatureConfig, { getDefaultSignatures } from '@/components/SignatureConfig';
import { saveReport, generateReportId } from '@/lib/report-store';
import { exportToPDF, exportToJPG } from '@/lib/export';
import { ArrowLeft, Download, Image, Save, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered } from 'lucide-react';
import { toast } from 'sonner';
import { SignatureEntry } from '@/components/CompanyPad';

interface LetterData {
  date: string;
  reportId: string;
  bodyHtml: string;
  includeSignature: boolean;
  extraPages: number;
  signatures: SignatureEntry[];
}

function makeDefault(): LetterData {
  return {
    date: new Date().toISOString().split('T')[0],
    reportId: generateReportId(),
    bodyHtml: '',
    includeSignature: true,
    extraPages: 0,
    signatures: getDefaultSignatures(3),
  };
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}> = ({ onClick, active, children, title }) => (
  <button
    type="button"
    onMouseDown={e => e.preventDefault()}
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded hover:bg-accent transition-colors ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
  >
    {children}
  </button>
);

const RichTextEditor: React.FC<{
  value: string;
  onChange: (html: string) => void;
}> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1.5 border-b bg-muted/30 flex-wrap">
        <ToolbarButton onClick={() => exec('bold')} title="Bold (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('italic')} title="Italic (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('underline')} title="Underline (Ctrl+U)">
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton onClick={() => exec('justifyLeft')} title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyCenter')} title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyRight')} title="Align Right">
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyFull')} title="Justify">
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Bullet List">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-border mx-1" />
        <select
          className="text-xs border rounded px-1.5 py-1 bg-transparent"
          onChange={e => {
            if (e.target.value) exec('formatBlock', e.target.value);
          }}
          defaultValue=""
        >
          <option value="" disabled>Size</option>
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
      </div>
      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[400px] p-4 outline-none prose prose-sm max-w-none"
        style={{ fontSize: '14px', lineHeight: '1.8' }}
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={() => {
          if (editorRef.current) onChange(editorRef.current.innerHTML);
        }}
      />
    </div>
  );
};

const LetterPreview: React.FC<{ data: LetterData }> = ({ data }) => {
  const mainPage = (
    <>
      {data.bodyHtml && (
        <div
          style={{ lineHeight: '1.8', textAlign: 'justify' }}
          dangerouslySetInnerHTML={{ __html: data.bodyHtml }}
        />
      )}
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

const CreateLetter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previewRef = useRef<HTMLDivElement>(null);

  const editReport = (location.state as any)?.edit as any | undefined;
  const duplicateData = (location.state as any)?.duplicate as LetterData | undefined;

  const [data, setData] = useState<LetterData>(() => {
    if (editReport) return { ...makeDefault(), ...editReport.data };
    if (duplicateData) return { ...duplicateData, reportId: generateReportId(), date: new Date().toISOString().split('T')[0] };
    return makeDefault();
  });
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  const update = (partial: Partial<LetterData>) => setData(prev => ({ ...prev, ...partial }));

  const handleSave = async () => {
    try {
      await saveReport({
        id: editReport?.id || undefined,
        type: 'letter',
        title: `Letter - ${data.reportId}`,
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
      await exportToPDF(previewRef.current!, `Letter_${data.reportId}`);
      toast.success('PDF downloaded');
    }, 300);
  };

  const handleExportJPG = async () => {
    if (!previewRef.current) return;
    setActiveTab('preview');
    setTimeout(async () => {
      await exportToJPG(previewRef.current!, `Letter_${data.reportId}`);
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
              <h1 className="text-sm font-bold">Letter / Application</h1>
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
              <div className="space-y-2">
                <Label>Report Date</Label>
                <Input type="date" value={data.date} onChange={e => update({ date: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <p className="text-xs text-muted-foreground">Write your letter/application below. Use the toolbar for formatting.</p>
                <RichTextEditor
                  value={data.bodyHtml}
                  onChange={html => update({ bodyHtml: html })}
                />
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
                <LetterPreview data={data} />
              </div>
            </div>
            <div ref={previewRef} className="print-area" style={{ position: 'fixed', left: '-9999px', top: 0 }}>
              <LetterPreview data={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateLetter;
