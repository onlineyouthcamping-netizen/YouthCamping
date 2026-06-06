import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/admin/KPICard";
import { Button } from "@/components/ui/button";
import { guideService } from "@/services/guide.service";
import { 
  Users, 
  MapPin, 
  CalendarCheck, 
  AlertTriangle, 
  FileText,
  UserPlus,
  Plus,
  Loader2
} from "lucide-react";

export default function GuidesDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    activeTrips: number;
    totalGuides: number;
    todayCheckIns: number;
    missingCheckIns: number;
    locationMismatchFlags: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await guideService.getDashboard();
      setStats(data);
    } catch (err) {
      console.error("Failed to load guide dashboard stats:", err);
      setError("Guide API server is offline or returned an error. Please verify the API server status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="admin-title">Guides Dashboard</h1>
          <p className="admin-body">Real-time attendance tracking and guide coordination</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => navigate("/admin/assignments")}
            disabled={!!error}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg h-8.5 px-4 font-semibold text-[10.5px] uppercase tracking-wide flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Assign Guide
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 admin-card">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Loading dashboard stats...</p>
        </div>
      ) : error ? (
        <div className="admin-card p-12 text-center max-w-xl mx-auto space-y-5 flex flex-col items-center">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-destructive shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">Guide API Offline</h3>
            <p className="text-xs text-slate-450 leading-relaxed">{error}</p>
          </div>
          <Button 
            onClick={fetchStats} 
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-9 px-6 rounded-xl shadow-md transition-all"
          >
            Retry Connection
          </Button>
        </div>
      ) : (
        <>
          {/* KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <KPICard 
              title="Active Trips" 
              value={stats?.activeTrips ?? 0} 
              icon={<MapPin className="h-5 w-5" />} 
              change="On Trail" 
              loading={loading} 
            />
            <KPICard 
              title="Active Guides" 
              value={stats?.totalGuides ?? 0} 
              icon={<Users className="h-5 w-5" />} 
              change="Registered" 
              loading={loading} 
            />
            <KPICard 
              title="Checked-In Today" 
              value={stats?.todayCheckIns ?? 0} 
              icon={<CalendarCheck className="h-5 w-5" />} 
              change="Completed" 
              loading={loading} 
            />
            <KPICard 
              title="Missing Check-ins" 
              value={stats?.missingCheckIns ?? 0} 
              icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} 
              change="Pending Today" 
              loading={loading} 
            />
            <KPICard 
              title="Flagged Logs" 
              value={stats?.locationMismatchFlags ?? 0} 
              icon={<AlertTriangle className="h-5 w-5 text-destructive" />} 
              change="Review Required" 
              loading={loading} 
            />
          </div>
        </>
      )}


      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="admin-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-orange-50 flex items-center justify-center text-primary shadow-sm">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="admin-card-title text-base">Verify Attendance Logs</h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              Review and approve daily guide logs, verify selfie photos, verify geofence distance logs, and flag mismatches.
            </p>
          </div>
          <Button 
            onClick={() => navigate("/admin/attendance-logs")}
            variant="outline" 
            className="w-full text-xs font-semibold h-9 rounded-lg"
          >
            View Logs
          </Button>
        </div>

        <div className="admin-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-orange-50 flex items-center justify-center text-primary shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="admin-card-title text-base">Guide Directory</h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              Add new guides to the team, update their base daily wage rates, emergency contacts, and active status.
            </p>
          </div>
          <Button 
            onClick={() => navigate("/admin/guides")}
            variant="outline" 
            className="w-full text-xs font-semibold h-9 rounded-lg"
          >
            Manage Guides
          </Button>
        </div>

        <div className="admin-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-orange-50 flex items-center justify-center text-primary shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="admin-card-title text-base">Payroll & Payouts</h3>
            <p className="text-xs text-slate-450 leading-relaxed">
              View generated payroll summaries and calculate accumulated earnings based on verified active guide days.
            </p>
          </div>
          <Button 
            onClick={() => navigate("/admin/payroll")}
            variant="outline" 
            className="w-full text-xs font-semibold h-9 rounded-lg"
          >
            View Payroll
          </Button>
        </div>
      </div>
    </div>
  );
}
