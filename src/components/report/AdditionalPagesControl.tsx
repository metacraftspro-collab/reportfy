import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AdditionalPagesControlProps {
  value: number;
  onChange: (value: number) => void;
}

const AdditionalPagesControl: React.FC<AdditionalPagesControlProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="space-y-1">
        <Label>Additional Pages</Label>
        <p className="text-xs text-muted-foreground">
          Add blank extra pages. Signature will stay only on the very last page.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => onChange(Math.max(0, value - 1))}>
          Remove Last Page
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange(value + 1)}>
          Add New Page
        </Button>
        <span className="text-sm text-muted-foreground">{value} extra page{value === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
};

export default AdditionalPagesControl;