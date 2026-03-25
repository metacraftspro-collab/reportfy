import {
  BRANCHES,
  PlatformHoursEntry,
  PlatformReportData,
  TimingNoticeData,
} from '@/types/report';

export const PLATFORM_CHANNEL_OPTIONS = ['Foodpanda', 'Foodi', 'Pathao', '3S POS System'] as const;

export const PLATFORM_TEMPLATE_OPTIONS = [
  { value: 'online-menu-update', label: 'Online Platform Update' },
  { value: 'operational-hours', label: 'Operational Hour Change' },
  { value: 'pos-3s-update', label: '3S POS Update' },
] as const;

export const ONLINE_TARGET_OPTIONS = ['Food Item', 'Food Image', 'Price', 'Description', 'Other'] as const;
export const ONLINE_ACTION_OPTIONS = ['Add', 'Remove', 'Update'] as const;
export const POS_ACTION_OPTIONS = ['Add', 'Remove', 'Update', 'Other'] as const;
export const POS_TARGET_OPTIONS = ['BIN', 'TIN', 'POS Item', 'Branch Setup', 'Other'] as const;
export const OPERATIONAL_REASON_OPTIONS = ['Eid-ul-Fitr', 'Eid-ul-Adha', 'Special Hours', 'Other'] as const;
export const TIMING_PURPOSE_OPTIONS = ['Regular Update', 'Special Hours', 'Festival Hours', 'Other'] as const;

export const DEFAULT_OPERATIONAL_BRANCHES = BRANCHES.slice(0, 8);

export function createDefaultHoursEntries(): PlatformHoursEntry[] {
  return DEFAULT_OPERATIONAL_BRANCHES.map((branch) => ({
    id: crypto.randomUUID(),
    branch,
    servingTime: '',
    lastOrderTime: '',
  }));
}

export function formatLongDate(value: string) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime12h(value: string) {
  if (!value) return '—';

  const [hour, minute] = value.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getPlatformIntro(data: PlatformReportData) {
  const selectedPlatforms = data.platforms.length
    ? data.platforms.join(', ')
    : data.templateType === 'pos-3s-update'
      ? '3S POS System'
      : 'the selected platforms';

  if (data.templateType === 'online-menu-update') {
    return `Dear Concern,\n\nThis is to formally request the ${data.onlineActionType.toLowerCase()} of ${data.onlineUpdateTarget.toLowerCase()} on ${selectedPlatforms} for Arabika Coffee. The detailed list is provided below for your necessary action.`;
  }

  if (data.templateType === 'operational-hours') {
    const reason = data.operationalReasonType === 'Other' && data.operationalReasonNote
      ? data.operationalReasonNote
      : data.operationalReasonType;
    return `Dear Concern,\n\nWe would like to inform you about the revised operational schedule on ${selectedPlatforms} due to ${reason}. Please find the updated branch-wise serving and last order timings below for immediate implementation.`;
  }

  const posTarget = data.posTargetType === 'Other' && data.details ? data.details : data.posTargetType;
  return `Dear Concern,\n\nWe are writing to request the ${data.posActionType.toLowerCase()} of ${posTarget.toLowerCase()} information in 3S POS System for Arabika Coffee. The relevant details are provided below for your necessary action.`;
}

export function getPlatformClosing(data: PlatformReportData) {
  if (data.templateType === 'operational-hours') {
    return 'Your prompt assistance in implementing the above schedule is highly appreciated. Should you require any clarification, please do not hesitate to contact us.\n\nThank you for your continued cooperation.';
  }

  return 'Your prompt assistance in completing the above request is highly appreciated. Should you require any clarification, please do not hesitate to contact us.\n\nThank you for your continued cooperation.';
}

export function getPlatformHeading(data: PlatformReportData) {
  if (data.templateType === 'operational-hours') return 'Platform / Partner Operational Hour Change Notice';
  if (data.templateType === 'pos-3s-update') return '3S POS System Update Request';
  return 'Platform Product / Menu Update Request';
}

export function getTimingIntro(data: TimingNoticeData) {
  const base = {
    'Regular Update': 'Dear Concern,\n\nPlease find below the updated branch-wise operational timing schedule for smooth daily operation. Kindly ensure the changes are applied accordingly.',
    'Special Hours': 'Dear Concern,\n\nPlease note the following special operational hours. Kindly ensure the schedule is followed as outlined below.',
    'Festival Hours': 'Dear Concern,\n\nIn observance of the upcoming festival, please find the revised operational timing schedule below. Kindly ensure all branches follow the updated timings accordingly.',
    Other: 'Dear Concern,\n\nPlease find below the updated operational timing notice for your reference and necessary action.',
  }[data.purposeType];

  return data.purposeDetails ? `${base} ${data.purposeDetails}` : base;
}

export function getTimingClosing(_data: TimingNoticeData) {
  return 'Your prompt assistance in implementing the above schedule is highly appreciated. Should you require any clarification, please do not hesitate to contact us.\n\nThank you for your continued cooperation.';
}