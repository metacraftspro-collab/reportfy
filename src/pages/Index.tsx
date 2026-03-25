import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getReports, deleteReport, ReportRecord } from '@/lib/report-store';
import { useAuth } from '@/hooks/useAuth';
import { FilePlus, FileText, Clock, Trash2, Copy, ChevronRight, Search, X, LogOut, Coffee, FileBarChart, Mail } from 'lucide-react';
import arabikaLogo from '@/assets/arabika-logo.png';
import { toast } from 'sonner';

const REPORT_TYPE_LABELS: Record<string, string> = {
  'menu-update': 'Menu Update',
  'platform': 'Platform Report',
  'operational-timing': 'Operational Timing',
  'letter': 'Letter',
};

const REPORT_TYPE_ICONS: Record<string, React.ReactNode> = {
  'menu-update': <Coffee className="w-4 h-4" />,
  'platform': <FileBarChart className="w-4 h-4" />,
  'operational-timing': <Clock className="w-4 h-4" />,
  'letter': <Mail className="w-4 h-4" />,
};

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const data = await getReports();
    setReports(data);
    setLoading(false);
  };

  const filteredReports = React.useMemo(() => {
    return reports.filter((r) => {
      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesSearch =
        !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.report_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [reports, searchQuery, filterType]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this report?')) {
      try {
        await deleteReport(id);
        await loadReports();
        toast.success('Report deleted');
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container max-w-5xl flex items-center gap-3 py-4 px-4">
          <img src={arabikaLogo} alt="Arabika" className="w-10 h-10" />
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Arabika Report System</h1>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-xs text-muted-foreground">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Button>
        </div>
      </header>

      <main className="container max-w-5xl py-8 px-4 space-y-8">
        {/* Quick Actions */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Create New Report</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { type: 'menu-update', label: 'Menu Update', desc: 'POS & online platform', icon: Coffee, color: 'hsl(var(--accent))' },
              { type: 'platform', label: 'Platform Report', desc: 'Foodpanda, Foodi, Pathao', icon: FileBarChart, color: 'hsl(25 50% 50%)' },
              { type: 'operational-timing', label: 'Timing Notice', desc: 'Operational hours', icon: Clock, color: 'hsl(200 50% 45%)' },
              { type: 'letter', label: 'Letter', desc: 'Company pad letter', icon: Mail, color: 'hsl(150 40% 40%)' },
            ].map((item) => (
              <Card
                key={item.type}
                className="p-4 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.97] group border-l-[3px]"
                style={{ borderLeftColor: item.color }}
                onClick={() => navigate(`/create/${item.type}`)}
              >
                <item.icon className="w-5 h-5 mb-2" style={{ color: item.color }} />
                <h3 className="font-semibold text-sm mb-0.5">{item.label}</h3>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Report History */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Report History ({filteredReports.length}{filteredReports.length !== reports.length ? ` / ${reports.length}` : ''})
          </h2>

          {reports.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or report ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm hover:bg-secondary transition-colors">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="menu-update">Menu Update</SelectItem>
                  <SelectItem value="platform">Platform Report</SelectItem>
                  <SelectItem value="operational-timing">Timing Notice</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-md bg-secondary" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-secondary rounded w-2/3" />
                      <div className="h-2.5 bg-secondary rounded w-1/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <Card className="p-10 text-center">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No reports yet. Create your first one above.</p>
            </Card>
          ) : filteredReports.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No reports match your search.</p>
              <Button variant="link" size="sm" className="mt-1" onClick={() => { setSearchQuery(''); setFilterType('all'); }}>
                Clear filters
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className="p-4 flex items-center gap-4 hover:shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.99]"
                  onClick={() => navigate(`/create/${report.type}`, { state: { edit: report } })}
                >
                  <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    {REPORT_TYPE_ICONS[report.type] || <FileText className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{report.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {REPORT_TYPE_LABELS[report.type] || report.type} · {report.report_id} · {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/create/${report.type}`, { state: { duplicate: report.data } })}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(report.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
