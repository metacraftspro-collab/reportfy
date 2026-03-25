import { supabase } from '@/integrations/supabase/client';

export interface ReportRecord {
  id: string;
  type: string;
  title: string;
  report_id: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export async function getReports(): Promise<ReportRecord[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
  return (data || []) as unknown as ReportRecord[];
}

export async function saveReport(report: {
  id?: string;
  type: string;
  title: string;
  report_id: string;
  data: any;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (report.id) {
    // Check if exists
    const { data: existing } = await supabase
      .from('reports')
      .select('id')
      .eq('id', report.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('reports')
        .update({
          type: report.type,
          title: report.title,
          report_id: report.report_id,
          data: report.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.id);

      if (error) throw error;
      return;
    }
  }

  const { error } = await supabase
    .from('reports')
    .insert({
      id: report.id || crypto.randomUUID(),
      user_id: user.id,
      type: report.type,
      title: report.title,
      report_id: report.report_id,
      data: report.data,
    });

  if (error) throw error;
}

export async function deleteReport(id: string) {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function generateReportId(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ARB-${y}${m}${d}-${rand}`;
}
