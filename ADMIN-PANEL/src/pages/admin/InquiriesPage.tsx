import { useEffect, useState, useCallback } from "react";
import { inquiriesService } from "@/services/inquiries.service";
import type { Inquiry } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MessageSquare, Eye, Mail, Phone, Calendar, Search, User, ChevronDown, MoreHorizontal, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_TABS = [
  { key: "all", label: "New & Active" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Active" },
  { key: "converted", label: "Won" },
  { key: "closed", label: "Lost" },
  { key: "archived", label: "Archived" },
  { key: "spam", label: "Spam" },
];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inquiriesService.getAll();
      setInquiries(data);
    } catch (error) {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = inquiries.filter(inq => {
    const matchesTab = activeTab === "all" 
      ? (inq.status === "new" || inq.status === "contacted")
      : inq.status === activeTab;
    const matchesSearch = !searchQuery || 
      inq.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.tripTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTabCount = (key: string) => {
    if (key === "all") return inquiries.filter(i => i.status === "new" || i.status === "contacted").length;
    return inquiries.filter(i => i.status === key).length;
  };

  const updateInquiry = async (data: Partial<Inquiry>) => {
    if (!selected) return;
    try {
      const updated = await inquiriesService.update(selected.id, data);
      setSelected(updated);
      toast.success("CRM updated");
      load();
    } catch (error) {
      toast.error("Failed to update inquiry");
    }
  };

  const updateStatus = async (inq: Inquiry, status: string) => {
    try {
      await inquiriesService.update(inq.id, { status } as any);
      toast.success(`Status updated to ${status}`);
      load();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleView = async (inq: Inquiry) => {
    setSelected(inq);
    if (!inq.read) {
      await inquiriesService.markAsRead(inq.id);
      load();
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-xl font-bold text-foreground">Inquiries</h1>
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />)}
      </div>
    );
  }

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Page Title */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Inquiries</h1>
      </div>

      {/* Info Banners */}
      <div className="space-y-2 mb-5">
        <div className="bg-[#fffbea] border border-[#fce588] rounded px-4 py-2.5 text-xs text-slate-700">
          <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mr-2 uppercase">New</span>
          You can now configure the tour inquiry form to <strong>popup automatically</strong> for your website visitors.
        </div>
        <div className="bg-[#fffbea] border border-[#fce588] rounded px-4 py-2.5 text-xs text-slate-700">
          <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mr-2 uppercase">New</span>
          You can now <strong>track the status of inquiries</strong> to help you focus on only those which need attention or follow up.
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-4">
        <div className="flex gap-0 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map(tab => {
            const count = getTabCount(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, customer email, tour name, tour code, etc"
            className="w-full h-9 px-3 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-9 px-3 border border-slate-300 rounded text-xs text-slate-600 flex items-center gap-1.5 hover:bg-slate-50">
              Any Source/Type <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>All Sources</DropdownMenuItem>
            <DropdownMenuItem>Website</DropdownMenuItem>
            <DropdownMenuItem>Phone</DropdownMenuItem>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Referral</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button className="h-9 w-9 flex items-center justify-center border border-slate-300 rounded hover:bg-slate-50">
          <User className="w-4 h-4 text-slate-500" />
        </button>
        <Button size="sm" className="h-9 px-5 bg-primary hover:bg-primary/90 text-white rounded text-xs font-semibold">
          <Search className="w-3.5 h-3.5 mr-1.5" /> Search
        </Button>
      </div>

      {/* Inquiry Table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-3 text-slate-300" />
            <p className="text-sm text-slate-400">No inquiries found</p>
          </div>
        ) : (
          <table className="w-full text-left table-striped">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[30%]">Source</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[25%]">Customer</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[25%]">Details</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[20%] text-right">Assignee & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inq) => (
                <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => handleView(inq)}>
                  {/* Source Column */}
                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${!inq.read ? 'bg-primary' : 'bg-emerald-500'}`} />
                        <span className="text-xs font-semibold text-primary hover:underline truncate">
                          {inq.tripTitle || 'General Inquiry'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-3.5">
                        {formatDateTime(inq.createdAt)}
                      </p>
                      {inq.isDuplicate && (
                        <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded ml-3.5 inline-block">DUPLICATE</span>
                      )}
                    </div>
                  </td>
                  {/* Customer Column */}
                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-800">{inq.name}</p>
                      {inq.email && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          {inq.email} <span className="text-slate-300">▼</span>
                        </p>
                      )}
                      {inq.phone && (
                        <p className="text-[11px] text-slate-400">{inq.phone}</p>
                      )}
                    </div>
                  </td>
                  {/* Details Column */}
                  <td className="px-4 py-3.5">
                    <div className="space-y-1">
                      {inq.date && (
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Preferred travel date
                        </p>
                      )}
                      {inq.date && (
                        <p className="text-xs font-medium text-slate-700">{formatDate(inq.date)}</p>
                      )}
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <MessageCircle className="w-3 h-3" />
                        {inq.message ? (
                          <span className="truncate max-w-[180px]">{inq.message}</span>
                        ) : (
                          <span className="italic">(no comments)</span>
                        )}
                      </p>
                    </div>
                  </td>
                  {/* Assignee & Actions Column */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 px-3 border border-slate-300 rounded text-xs text-slate-600 flex items-center gap-1 hover:bg-slate-50"
                          >
                            Actions <ChevronDown className="w-3 h-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(inq); }}>
                            <Eye className="w-3.5 h-3.5 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateStatus(inq, 'contacted'); }}>
                            Mark as Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateStatus(inq, 'converted'); }}>
                            Mark as Won
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateStatus(inq, 'closed'); }}>
                            Mark as Lost
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateStatus(inq, 'archived'); }}>
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateStatus(inq, 'spam'); }} className="text-red-600">
                            Mark as Spam
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-end mt-4 text-xs text-slate-500">
          Page 1 of {Math.ceil(filtered.length / 20)}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent aria-describedby="inquiry-details" className="max-w-2xl w-[95vw] sm:w-full max-h-[95dvh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Inquiry from {selected?.name}</DialogTitle>
            <p id="inquiry-details" className="text-xs text-muted-foreground">Detailed view of lead information and sales history.</p>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{selected.email || 'No Email Provided'}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{selected.phone}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" />{formatDateTime(selected.createdAt)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Travel Date</p>
                  <p className="text-sm font-medium text-card-foreground">{selected.date || 'Not specified'}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Travellers</p>
                  <p className="text-sm font-medium text-card-foreground">{selected.count || '1'}</p>
                </div>
              </div>
              {selected.tripTitle && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Related Trip</p>
                  <p className="text-sm font-medium text-card-foreground">{selected.tripTitle}</p>
                </div>
              )}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">CRM Action Panel</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</label>
                    <select 
                      value={selected.status}
                      onChange={(e) => updateInquiry({ status: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-medium"
                    >
                      <option value="new">New Lead</option>
                      <option value="contacted">In Discussion</option>
                      <option value="converted">Booking Done</option>
                      <option value="closed">Lost/Closed</option>
                    </select>
                  </div>
                  {selected.status === 'converted' && (
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Revenue (₹)</label>
                       <input 
                         type="number"
                         placeholder="Enter Amount"
                         defaultValue={selected.convertedAmount}
                         onBlur={(e) => updateInquiry({ convertedAmount: Number(e.target.value) })}
                         className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-medium"
                       />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Admin Notes</label>
                   <textarea 
                     className="w-full bg-white border border-slate-200 rounded-md p-3 text-xs font-medium min-h-[80px]"
                     defaultValue={selected.adminNotes}
                     placeholder="Notes from call: customer budget, group dates..."
                     onBlur={(e) => updateInquiry({ adminNotes: e.target.value })}
                   />
                </div>
              </div>

              <div className="flex gap-3">
                 <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800 rounded-md py-5 font-bold uppercase text-[10px] tracking-widest" onClick={() => { window.open(`tel:${selected.phone}`); updateInquiry({ status: 'contacted' }); }}>
                   <Phone className="h-3.5 w-3.5 mr-2" /> Call Now
                 </Button>
                 <Button variant="outline" className="flex-1 border-slate-200 rounded-md py-5 font-bold uppercase text-[10px] tracking-widest" onClick={() => { window.open(`mailto:${selected.email}`); }}>
                   <Mail className="h-3.5 w-3.5 mr-2" /> Email
                 </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
