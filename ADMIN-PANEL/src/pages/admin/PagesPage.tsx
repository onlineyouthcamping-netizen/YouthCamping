import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, FileText, ExternalLink, MoreVertical, Edit2, 
  Save, BarChart3, GripVertical, Trash2, ChevronRight 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { pagesService } from '@/services/pages.service';
import { settingsService } from '@/services/settings.service';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function PagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pages');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const [pagesRes, settingsRes] = await Promise.all([
          pagesService.getAll(),
          settingsService.get()
        ]);
        setPages(pagesRes.data || []);
        setSettings(settingsRes || {});
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleCreatePage = async () => {
    try {
      const title = prompt("Enter Page Title");
      if (!title) return;
      const slug = title.toLowerCase().replace(/ /g, '-');
      const res = await pagesService.create({ title, slug });
      toast.success("Page created");
      navigate(`/admin/pages/${res.data._id}`);
    } catch (err) {
      toast.error("Failed to create page");
    }
  };

  const saveGlobalSettings = async () => {
    try {
      await settingsService.update(settings);
      toast.success("Global site settings updated");
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Pages</h1>
            <p className="text-muted-foreground font-medium text-sm">Manage website structure, navigation, and global layout blocks.</p>
         </div>
         <Button onClick={saveGlobalSettings} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-8">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
      </div>

      {/* VacationLabs style Tabs */}
      <div className="border-b flex items-center bg-muted/20 px-4 pt-4 rounded-t-3xl border-2 border-b-0 border-border">
         {[
           { id: 'pages', name: 'Pages & Templates' },
           { id: 'header', name: 'Header & Navigation' },
           { id: 'footer', name: 'Footer' },
         ].map(tab => (
           <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-black uppercase text-[10px] tracking-widest border-2 border-b-0 rounded-t-xl transition-all mr-1 ${activeTab === tab.id ? 'bg-white border-border border-b-white translate-y-[2px] z-10' : 'text-muted-foreground hover:bg-muted'}`}
           >
              {tab.name}
           </button>
         ))}
      </div>

      <div className="bg-white border-2 border-border border-t-0 p-10 rounded-b-3xl shadow-sm min-h-[600px]">
        {activeTab === 'pages' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-8">
               <div className="flex items-center gap-3">
                  <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">NEW</span>
                  <p className="text-xs font-bold text-gray-700">Blog: Your website now has a fully integrated blog. <Link to="/admin/blogs" className="text-primary underline">Get started →</Link></p>
               </div>
               <Button size="sm" onClick={handleCreatePage} className="font-black uppercase text-[9px] h-8 px-4 rounded-lg">New Page</Button>
            </div>
            
            {loading ? (
              <div className="py-20 text-center animate-pulse font-black uppercase tracking-widest text-muted-foreground italic">Syncing Pages...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map(page => (
                  <PageCard key={page._id} page={page} />
                ))}
              </div>
            )}
          </div>
        )}

        {settings && activeTab === 'header' && <HeaderNavigationManager settings={settings} onUpdate={setSettings} />}
        {settings && activeTab === 'footer' && <FooterManager settings={settings} onUpdate={setSettings} />}
      </div>
    </div>
  );
}

const PageCard = ({ page }: { page: any }) => (
  <div className="bg-card rounded-[32px] border-2 border-border hover:border-primary transition-all group relative overflow-hidden shadow-sm flex flex-col items-center justify-center p-10 text-center gap-6">
     <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${page.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
        <FileText className="w-8 h-8" />
     </div>
     <div className="space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">{page.title}</h3>
        <p className="text-[10px] font-bold text-muted-foreground tracking-widest italic">{page.slug}</p>
     </div>
     <Link to={`/admin/pages/${page._id}`} className="w-full">
        <Button className="w-full bg-black text-white font-black uppercase tracking-widest text-[9px] rounded-2xl h-12 shadow-lg shadow-black/10">
          Edit Page Content
        </Button>
     </Link>
  </div>
);

const HeaderNavigationManager = ({ settings, onUpdate }: { settings: any, onUpdate: any }) => {
  const links = settings.navigation?.headerLinks || [];

  const addLink = () => {
    const label = prompt("Link Label");
    const url = prompt("Link URL (e.g., /trips)");
    if (!label || !url) return;
    onUpdate({
      ...settings,
      navigation: {
        ...settings.navigation,
        headerLinks: [...links, { label, url, isExternal: false, items: [] }]
      }
    });
  };

  const removeLink = (idx: number) => {
    onUpdate({
      ...settings,
      navigation: {
        ...settings.navigation,
        headerLinks: links.filter((_:any, i:number) => i !== idx)
      }
    });
  };

  return (
    <div className="space-y-12">
      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-start gap-3">
         <BarChart3 className="w-5 h-5 text-blue-500 shrink-0" />
         <p className="text-sm font-medium text-blue-800 italic">Heads up! Any changes will lead to changes across all pages in the website.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
         <div className="space-y-8">
            <div className="space-y-4">
               <Label className="text-xs font-black uppercase tracking-widest">Brand Logo URL *</Label>
               <Input 
                 value={settings.organization?.logo || ""} 
                 onChange={(e) => onUpdate({ ...settings, organization: { ...settings.organization, logo: e.target.value } })}
                 className="rounded-xl h-12 border-2" 
                 placeholder="https://..."
               />
               {settings.organization?.logo && <img src={settings.organization.logo} className="h-12 w-auto object-contain" alt="Logo preview" />}
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                 <Label className="text-xs font-black uppercase tracking-widest">Support Email</Label>
                 <Input 
                   value={settings.organization?.supportEmail || ""} 
                   onChange={(e) => onUpdate({ ...settings, organization: { ...settings.organization, supportEmail: e.target.value } })}
                   className="rounded-xl h-12 border-2" 
                 />
               </div>
               <div className="space-y-2">
                 <Label className="text-xs font-black uppercase tracking-widest">Support Phone</Label>
                 <Input 
                   value={settings.organization?.supportPhone || ""} 
                   onChange={(e) => onUpdate({ ...settings, organization: { ...settings.organization, supportPhone: e.target.value } })}
                   className="rounded-xl h-12 border-2" 
                 />
               </div>
            </div>
         </div>

         <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest">Header Links</Label>
            <div className="space-y-2">
               {links.map((link:any, idx:number) => (
                 <div key={idx} className="flex items-center gap-3 p-4 bg-muted/20 border-2 border-border rounded-xl group">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-bold text-sm uppercase">{link.label}</p>
                      <p className="text-[10px] text-muted-foreground">{link.url}</p>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeLink(idx)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                 </div>
               ))}
            </div>
            <Button variant="outline" onClick={addLink} className="w-full h-11 border-2 border-dashed rounded-xl font-bold uppercase text-[10px] tracking-widest">+ Add New link</Button>
         </div>
      </div>
    </div>
  );
};

const FooterManager = ({ settings, onUpdate }: { settings: any, onUpdate: any }) => {
  const columns = settings.footer?.columns || [];

  const addColumn = () => {
    onUpdate({
      ...settings,
      footer: {
        ...settings.footer,
        columns: [...columns, { title: "New Column", type: "links", content: "", links: [] }]
      }
    });
  };

  const removeColumn = (idx: number) => {
    onUpdate({
      ...settings,
      footer: {
        ...settings.footer,
        columns: columns.filter((_:any, i:number) => i !== idx)
      }
    });
  };

  return (
    <div className="space-y-12">
      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-start gap-3">
         <BarChart3 className="w-5 h-5 text-blue-500 shrink-0" />
         <p className="text-sm font-medium text-blue-800 italic">Heads up! Any changes will lead to changes across all pages in the website.</p>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <Label className="text-xs font-black uppercase tracking-widest">Footer Columns</Label>
            <Button variant="link" onClick={addColumn} className="text-primary font-black uppercase text-[10px]">Add Column</Button>
         </div>
         <div className="space-y-4">
            {columns.map((col: any, idx: number) => (
              <div key={idx} className="p-6 border-2 border-border rounded-2xl bg-white space-y-4">
                 <div className="flex justify-between items-center">
                    <Input 
                      value={col.title} 
                      onChange={(e) => {
                         const cols = [...columns];
                         cols[idx].title = e.target.value;
                         onUpdate({ ...settings, footer: { ...settings.footer, columns: cols } });
                      }}
                      className="font-black uppercase tracking-tight border-none p-0 h-auto text-lg focus-visible:ring-0" 
                    />
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeColumn(idx)}><Trash2 className="w-4 h-4" /></Button>
                 </div>
                 
                 <div className="flex gap-4">
                    <select 
                      value={col.type} 
                      onChange={(e) => {
                        const cols = [...columns];
                        cols[idx].type = e.target.value;
                        onUpdate({ ...settings, footer: { ...settings.footer, columns: cols } });
                      }}
                      className="text-[10px] font-black uppercase tracking-widest border rounded px-2"
                    >
                       <option value="links">Links List</option>
                       <option value="text">Rich Text</option>
                       <option value="contact">Contact Info</option>
                       <option value="social">Social Links</option>
                    </select>
                 </div>

                 {col.type === 'text' && (
                    <Textarea 
                      value={col.content} 
                      onChange={(e) => {
                         const cols = [...columns];
                         cols[idx].content = e.target.value;
                         onUpdate({ ...settings, footer: { ...settings.footer, columns: cols } });
                      }}
                      placeholder="Column content..."
                      className="text-sm font-medium"
                    />
                 )}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
