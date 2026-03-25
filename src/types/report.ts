export type ReportType = 'menu-update' | 'platform' | 'operational-timing' | 'letter';

export interface MenuUpdateItem {
  id: string;
  itemName: string;
  category?: string;
  oldPrice?: string;
  newPrice: string;
  description?: string;
  showDescription?: boolean;
  notes?: string;
}

export interface SignatureEntry {
  label: string;
  name: string;
  title: string;
}

export interface MenuUpdateReport {
  type: 'menu-update';
  date: string;
  reportId: string;
  branch: string;
  actionType: 'Add' | 'Update' | 'Delete';
  requestTypes: string[];
  updateDetails: string;
  items: MenuUpdateItem[];
  platformToUpdate: string[];
  note: string;
  confirmedBy: string;
  includeSignature: boolean;
  extraPages: number;
  signatures?: SignatureEntry[];
}

export interface PlatformItem {
  id: string;
  branch?: string;
  itemName: string;
  category?: string;
  oldPrice?: string;
  newPrice?: string;
  description?: string;
  showDescription?: boolean;
}

export interface PlatformHoursEntry {
  id: string;
  branch: string;
  servingTime: string;
  lastOrderTime: string;
}

export type PlatformTemplateType = 'online-menu-update' | 'operational-hours' | 'pos-3s-update';

export interface PlatformReportData {
  type: 'platform';
  date: string;
  reportId: string;
  branch: string;
  platforms: string[];
  templateType: PlatformTemplateType;
  subject: string;
  details: string;
  items: PlatformItem[];
  hoursTable: PlatformHoursEntry[];
  confirmedBy: string;
  additionalNote: string;
  includeSignature: boolean;
  extraPages: number;
  signatures: SignatureEntry[];
  onlineActionType: 'Add' | 'Remove' | 'Update';
  onlineUpdateTarget: 'Food Item' | 'Food Image' | 'Price' | 'Description' | 'Other';
  operationalReasonType: 'Eid-ul-Fitr' | 'Eid-ul-Adha' | 'Special Hours' | 'Other';
  operationalReasonNote: string;
  posActionType: 'Add' | 'Remove' | 'Update' | 'Other';
  posTargetType: 'BIN' | 'TIN' | 'POS Item' | 'Branch Setup' | 'Other';
}

export interface TimingEntry {
  id: string;
  branch: string;
  openTime: string;
  closeTime: string;
}

export interface TimingNoticeData {
  type: 'operational-timing';
  date: string;
  reportId: string;
  subject: string;
  effectiveDate: string;
  purposeType: 'Regular Update' | 'Special Hours' | 'Festival Hours' | 'Other';
  purposeDetails: string;
  timings: TimingEntry[];
  additionalNote: string;
  includeSignature: boolean;
  extraPages: number;
  signatures: SignatureEntry[];
}

export interface LetterData {
  type: 'letter';
  date: string;
  reportId: string;
  includeSignature: boolean;
  extraPages: number;
  signatures: SignatureEntry[];
}

export interface ReportMeta {
  id: string;
  type: ReportType;
  title: string;
  createdAt: string;
  data: MenuUpdateReport | PlatformReportData | TimingNoticeData | LetterData;
}

export const BRANCHES = [
  'Gulshan Navana',
  'Anabil Tower',
  'Bashundhara Block A',
  'Rahman Tower',
  'ANZ Jigatola',
  'Uttara',
  'Banani 11',
  'BRAC University Arabika',
  'Chittagong',
  "Cox's Bazar",
  'All Branches',
] as const;

export const REQUEST_TYPES = [
  'New Product Addition',
  'Existing Product Update',
  'Price Change',
  'Menu Update',
  'Online (Foodi, Pathao, FoodPanda) Shop Create',
  'Others',
] as const;

export const PLATFORM_OPTIONS = [
  'POS System (3S)',
  'Online Platform',
  'Both',
] as const;
