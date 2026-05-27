import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  filters?: { key: string; label: string; options: { label: string; value: string }[] }[];
  onFilterChange?: (key: string, value: string) => void;
  pageSize?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  rowKey?: keyof T;
}

export function DataTable<T extends Record<string, any>>({
  columns, data = [], loading, searchPlaceholder = "Search records...", searchKey,
  filters, onFilterChange, pageSize = 10, emptyMessage = "No records found", emptyIcon,
  rowKey = "id" as keyof T,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = (data || [])
    .filter((item) => {
      if (!searchKey || !search) return true;
      const value = item[searchKey];
      return String(value || "").toLowerCase().includes(search.toLowerCase());
    });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const renderCellValue = (item: T, col: Column<T>) => {
    if (col.render) return col.render(item);
    const value = item[col.key];
    if (value === null || value === undefined) return "";
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {searchKey && (
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={searchPlaceholder} 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(0); }} 
              className="pl-11 h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus-visible:ring-primary font-medium text-sm" 
            />
          </div>
        )}
        {filters?.map((f) => (
          <Select key={f.key} defaultValue="all" onValueChange={(v) => onFilterChange?.(f.key, v)}>
            <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-2xl bg-white border-slate-100 shadow-sm font-bold text-[10px] uppercase tracking-widest">
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              <SelectItem value="all" className="font-bold text-[10px] uppercase tracking-widest">All {f.label}</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value} className="font-bold text-[10px] uppercase tracking-widest">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <div className="modern-card p-0 overflow-hidden shadow-premium">
        <div className="responsive-table">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50">
                {columns.map((col) => (
                  <th key={col.key} className={cn("px-8 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400", col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-8 py-6">
                        <div className="h-4 bg-slate-50 animate-pulse rounded-lg w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                        {emptyIcon || <Search className="w-8 h-8" />}
                      </div>
                      <p className="text-xs font-medium text-slate-400 italic">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((item, i) => (
                  <tr key={String(item[rowKey] || i)} className="hover:bg-slate-50/50 transition-all group">
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-8 py-6 text-slate-600 font-medium", col.className)}>
                        {renderCellValue(item, col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setPage((p) => p - 1)} 
              disabled={page === 0}
              className="h-10 w-10 rounded-xl border-slate-100 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setPage((p) => p + 1)} 
              disabled={page >= totalPages - 1}
              className="h-10 w-10 rounded-xl border-slate-100 hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
