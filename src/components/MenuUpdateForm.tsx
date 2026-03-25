import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { MenuUpdateReport, MenuUpdateItem, BRANCHES, REQUEST_TYPES, PLATFORM_OPTIONS } from '@/types/report';
import SignatureConfig, { getDefaultSignatures } from '@/components/SignatureConfig';
import AdditionalPagesControl from '@/components/report/AdditionalPagesControl';
import { formatLongDate } from '@/lib/report-templates';

interface MenuUpdateFormProps {
  data: MenuUpdateReport;
  onChange: (data: MenuUpdateReport) => void;
}

const MenuUpdateForm: React.FC<MenuUpdateFormProps> = ({ data, onChange }) => {
  const update = (partial: Partial<MenuUpdateReport>) => onChange({ ...data, ...partial });

  const addItem = () => {
    update({
      items: [
        ...data.items,
        { id: crypto.randomUUID(), itemName: '', newPrice: '' },
      ],
    });
  };

  const updateItem = (id: string, partial: Partial<MenuUpdateItem>) => {
    update({
      items: data.items.map((item) => (item.id === id ? { ...item, ...partial } : item)),
    });
  };

  const removeItem = (id: string) => {
    update({ items: data.items.filter((item) => item.id !== id) });
  };

  const toggleRequestType = (type: string) => {
    const types = data.requestTypes.includes(type)
      ? data.requestTypes.filter((t) => t !== type)
      : [...data.requestTypes, type];
    update({ requestTypes: types });
  };

  const togglePlatform = (platform: string) => {
    const platforms = data.platformToUpdate.includes(platform)
      ? data.platformToUpdate.filter((p) => p !== platform)
      : [...data.platformToUpdate, platform];
    update({ platformToUpdate: platforms });
  };

  return (
    <div className="space-y-6">
      {/* Date */}
      <div className="space-y-2">
        <Label>Report Date</Label>
        <Input type="date" value={data.date} onChange={e => update({ date: e.target.value })} />
      </div>

      {/* Branch */}
      <div className="space-y-2">
        <Label>Branch / Branches</Label>
        <Select value={data.branch} onValueChange={(v) => update({ branch: v })}>
          <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
          <SelectContent>
            {BRANCHES.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Request Type */}
      <div className="space-y-2">
        <Label>Request Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {REQUEST_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={data.requestTypes.includes(type)}
                onCheckedChange={() => toggleRequestType(type)}
              />
              {type}
            </label>
          ))}
        </div>
        {data.requestTypes.includes('Others') && (
          <div className="mt-2">
            <Input
              value={(data as any).othersDetail || ''}
              onChange={e => update({ othersDetail: e.target.value } as any)}
              placeholder="Specify other request type..."
              className="text-sm"
            />
          </div>
        )}
      </div>

      {/* Update Details */}
      <div className="space-y-2">
        <Label>Update Details</Label>
        <Textarea
          value={data.updateDetails}
          onChange={(e) => update({ updateDetails: e.target.value })}
          placeholder="e.g. Available 220gm, 440gm..."
          rows={2}
        />
      </div>

      {/* Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Items</Label>
          <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Item
          </Button>
        </div>
        {data.items.map((item, i) => (
          <div key={item.id} className="space-y-2 p-3 rounded-md border bg-secondary/30">
            <div className="grid grid-cols-[1fr_36px] gap-2 items-start">
              <div className="grid grid-cols-[1fr_120px] gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Item Name</Label>
                  <Input
                    value={item.itemName}
                    onChange={(e) => updateItem(item.id, { itemName: e.target.value })}
                    placeholder="e.g. Houseblend, 220gm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <Input
                    value={item.category || ''}
                    onChange={(e) => updateItem(item.id, { category: e.target.value })}
                    placeholder="e.g. Hot Drinks"
                  />
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive h-9 w-9 mt-5">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-[100px_100px_1fr] gap-2 items-end">
              <div>
                <Label className="text-xs text-muted-foreground">Old Price</Label>
                <Input
                  value={item.oldPrice || ''}
                  onChange={(e) => updateItem(item.id, { oldPrice: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">New Price</Label>
                <Input
                  value={item.newPrice}
                  onChange={(e) => updateItem(item.id, { newPrice: e.target.value })}
                  placeholder="BDT"
                />
              </div>
              <div className="flex items-center gap-2 pb-1">
                <Switch
                  checked={item.showDescription || false}
                  onCheckedChange={(v) => updateItem(item.id, { showDescription: v })}
                  className="scale-75"
                />
                <span className="text-xs text-muted-foreground">Description</span>
              </div>
            </div>
            {item.showDescription && (
              <div>
                <Textarea
                  value={item.description || ''}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Product description (optional)..."
                  rows={2}
                  className="text-sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label>Note (optional)</Label>
        <Textarea
          value={data.note}
          onChange={(e) => update({ note: e.target.value })}
          placeholder="e.g. Prices fixed at 6 BDT per gram..."
          rows={2}
        />
      </div>

      {/* Confirmed By */}
      <div className="space-y-2">
        <Label>Confirmed by (Short note if need)</Label>
        <Textarea
          value={data.confirmedBy}
          onChange={(e) => update({ confirmedBy: e.target.value })}
          placeholder="e.g. Confirmed by management..."
          rows={2}
        />
      </div>

      {/* Platform to Update */}
      <div className="space-y-2">
        <Label>Platform to be Updated</Label>
        <div className="flex flex-wrap gap-4">
          {PLATFORM_OPTIONS.map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={data.platformToUpdate.includes(p)}
                onCheckedChange={() => togglePlatform(p)}
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      <AdditionalPagesControl
        value={data.extraPages || 0}
        onChange={(extraPages) => update({ extraPages })}
      />

      {/* Signature Config */}
      <SignatureConfig
        includeSignature={data.includeSignature}
        onToggle={(v) => update({ includeSignature: v })}
        signatures={data.signatures || getDefaultSignatures(3)}
        onSignaturesChange={(sigs) => update({ signatures: sigs })}
      />
    </div>
  );
};

export default MenuUpdateForm;
