import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SignatureEntry } from '@/components/CompanyPad';

interface SignatureConfigProps {
  includeSignature: boolean;
  onToggle: (val: boolean) => void;
  signatures: SignatureEntry[];
  onSignaturesChange: (sigs: SignatureEntry[]) => void;
}

const DEFAULT_SIGNATURES: SignatureEntry[] = [
  { label: 'Prepared by', name: 'Md Towhidul Islam', title: 'Customer Support Executive' },
  { label: 'Reviewed by', name: 'Shahadat Hossain', title: 'Finance & Accounts' },
  { label: 'Approved by', name: 'Ibrahim Mia', title: 'Head of Department' },
];

export function getDefaultSignatures(count: number = 3): SignatureEntry[] {
  return DEFAULT_SIGNATURES.slice(0, count).map(s => ({ ...s }));
}

const SignatureConfig: React.FC<SignatureConfigProps> = ({
  includeSignature,
  onToggle,
  signatures,
  onSignaturesChange,
}) => {
  const handleCountChange = (val: string) => {
    const count = parseInt(val);
    const newSigs: SignatureEntry[] = [];
    for (let i = 0; i < count; i++) {
      newSigs.push(
        signatures[i] || DEFAULT_SIGNATURES[i] || { label: `Signatory ${i + 1}`, name: '', title: '' }
      );
    }
    onSignaturesChange(newSigs);
  };

  const updateSig = (index: number, partial: Partial<SignatureEntry>) => {
    const updated = signatures.map((s, i) => (i === index ? { ...s, ...partial } : s));
    onSignaturesChange(updated);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center gap-3">
        <Switch checked={includeSignature} onCheckedChange={onToggle} />
        <Label className="font-medium">Include Signature Section</Label>
      </div>

      {includeSignature && (
        <>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Number of Signatures</Label>
            <Select value={String(signatures.length)} onValueChange={handleCountChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map(n => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {signatures.map((sig, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 p-3 rounded-md bg-secondary/50">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Label</Label>
                  <Input
                    value={sig.label}
                    onChange={e => updateSig(i, { label: e.target.value })}
                    placeholder="e.g. Prepared by"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Name</Label>
                  <Input
                    value={sig.name}
                    onChange={e => updateSig(i, { name: e.target.value })}
                    placeholder="Full name"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Designation</Label>
                  <Input
                    value={sig.title}
                    onChange={e => updateSig(i, { title: e.target.value })}
                    placeholder="e.g. Manager"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SignatureConfig;
