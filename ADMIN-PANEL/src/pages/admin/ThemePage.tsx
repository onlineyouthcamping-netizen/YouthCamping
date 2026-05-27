import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Save, RefreshCw, Type, Palette, Layout, 
  Smartphone, Monitor, MousePointer2, Box, 
  Layers, Settings2, Undo2
} from 'lucide-react';
import { toast } from 'sonner';
import { themeService, ThemeConfig } from '@/services/theme.service';
import { useTheme } from '@/components/admin/DynamicThemeProvider';

export default function ThemePage() {
  const { theme, updateLocalTheme, refreshTheme } = useTheme();
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (theme) {
      setConfig(theme);
      setLoading(false);
    } else {
      themeService.get().then(data => {
        setConfig(data);
        setLoading(false);
      });
    }
  }, [theme]);

  const handleChange = (key: keyof ThemeConfig, value: any) => {
    if (!config) return;
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    updateLocalTheme(newConfig); // Live update
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await themeService.update(config);
      toast.success("Theme settings published globally!");
    } catch (err) {
      toast.error("Failed to save theme settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all theme settings to default?")) return;
    setLoading(true);
    try {
      const defaultTheme = await themeService.reset();
      setConfig(defaultTheme);
      updateLocalTheme(defaultTheme);
      toast.success("Theme reset to defaults");
    } catch (err) {
      toast.error("Failed to reset theme");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-md p-8 rounded-[32px] border border-slate-100 sticky top-0 z-40 shadow-sm">
         <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900">Website Theme</h1>
            <p className="text-slate-500 font-medium">Configure the global design system for your entire platform.</p>
         </div>
         <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleReset} className="rounded-2xl h-12 px-6 font-bold border-slate-200">
               <Undo2 className="w-4 h-4 mr-2" />
               Reset
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
               {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
               Publish Changes
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Brand Identity */}
          <ThemeSection icon={<Palette className="w-5 h-5" />} title="Brand Identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ColorInput 
                label="Primary Brand Color" 
                value={config.primaryColor} 
                onChange={(v) => handleChange('primaryColor', v)} 
              />
              <ColorInput 
                label="Secondary / Accent" 
                value={config.secondaryColor} 
                onChange={(v) => handleChange('secondaryColor', v)} 
              />
              <ColorInput 
                label="Global Background" 
                value={config.backgroundColor} 
                onChange={(v) => handleChange('backgroundColor', v)} 
              />
              <ColorInput 
                label="Main Text Color" 
                value={config.textColor} 
                onChange={(v) => handleChange('textColor', v)} 
              />
            </div>
          </ThemeSection>

          {/* Typography */}
          <ThemeSection icon={<Type className="w-5 h-5" />} title="Typography">
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heading Font</Label>
                  <select 
                    value={config.headingFont} 
                    onChange={(e) => handleChange('headingFont', e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    {['Montserrat', 'Inter', 'Poppins', 'Outfit', 'Playfair Display', 'Space Grotesk'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Body Font</Label>
                  <select 
                    value={config.bodyFont} 
                    onChange={(e) => handleChange('bodyFont', e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    {['Montserrat', 'Inter', 'Poppins', 'Outfit', 'Playfair Display', 'Space Grotesk'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <SliderControl 
                  label={`Base Font Size: ${config.fontSizeBase}px`} 
                  value={Number(config.fontSizeBase)} 
                  min={12} max={24} 
                  onChange={(v) => handleChange('fontSizeBase', v.toString())} 
                />
                <SliderControl 
                  label={`Heading Font Size: ${config.fontSizeHeading}px`} 
                  value={Number(config.fontSizeHeading)} 
                  min={24} max={64} 
                  onChange={(v) => handleChange('fontSizeHeading', v.toString())} 
                />
              </div>
            </div>
          </ThemeSection>

          {/* Elements Style */}
          <ThemeSection icon={<Box className="w-5 h-5" />} title="Elements & UI">
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SliderControl 
                  label={`Card Radius: ${config.cardRadius}px`} 
                  value={Number(config.cardRadius)} 
                  min={0} max={60} 
                  onChange={(v) => handleChange('cardRadius', v.toString())} 
                />
                <SliderControl 
                  label={`Button Radius: ${config.buttonRadius}px`} 
                  value={Number(config.buttonRadius)} 
                  min={0} max={40} 
                  onChange={(v) => handleChange('buttonRadius', v.toString())} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                <ColorInput 
                  label="Button Background" 
                  value={config.buttonColor} 
                  onChange={(v) => handleChange('buttonColor', v)} 
                />
                <ColorInput 
                  label="Button Text" 
                  value={config.buttonTextColor} 
                  onChange={(v) => handleChange('buttonTextColor', v)} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Card Shadow Intensity</Label>
                  <select 
                    value={config.cardShadow} 
                    onChange={(e) => handleChange('cardShadow', e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold"
                  >
                    <option value="none">None</option>
                    <option value="0 4px 6px rgba(0,0,0,0.05)">Subtle</option>
                    <option value="0 10px 40px rgba(0,0,0,0.03)">Luxury Soft (Default)</option>
                    <option value="0 20px 50px rgba(0,0,0,0.1)">Modern Deep</option>
                    <option value="0 30px 60px rgba(0,0,0,0.15)">Ultra Premium</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                  <div className="space-y-1">
                    <Label className="text-sm font-bold text-slate-900">Dark Mode</Label>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enable system-wide dark UI</p>
                  </div>
                  <Switch 
                    checked={config.darkMode} 
                    onCheckedChange={(v) => handleChange('darkMode', v)} 
                  />
                </div>
              </div>
            </div>
          </ThemeSection>

        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-5 relative">
           <div className="sticky top-40 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Real-time Preview
                </h2>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Sync Active</span>
                </div>
              </div>
              
              <div 
                className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[650px] transition-all duration-500"
                style={{ 
                  backgroundColor: config.backgroundColor,
                  color: config.textColor,
                  fontFamily: config.bodyFont
                }}
              >
                  {/* Mock Navbar */}
                  <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: config.borderColor }}>
                     <div className="font-black text-xl italic tracking-tighter" style={{ color: config.primaryColor, fontFamily: config.headingFont }}>YouthCamping</div>
                     <div className="flex gap-6 items-center">
                        <div className="w-10 h-1 bg-slate-100 rounded-full" />
                        <div className="w-10 h-1 bg-slate-100 rounded-full" />
                        <div className="w-8 h-8 rounded-full bg-slate-50" />
                     </div>
                  </div>

                  {/* Mock Hero */}
                  <div className="flex-1 p-10 space-y-6 flex flex-col justify-center text-center">
                      <div className="inline-block self-center px-4 py-1.5 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary" style={{ color: config.primaryColor, backgroundColor: `${config.primaryColor}15` }}>
                        The Ultimate Adventure
                      </div>
                      <h3 className="text-4xl font-black leading-tight uppercase tracking-tighter" style={{ color: config.primaryColor, fontFamily: config.headingFont, fontSize: `${config.fontSizeHeading}px` }}>
                        One Trip at <br/> a time
                      </h3>
                      <p className="text-slate-500 font-medium text-sm">Explore the wilderness with high-end luxury expedition experts.</p>
                      <button 
                        className={`font-black uppercase text-[10px] tracking-widest h-14 px-10 self-center transition-all flex items-center gap-3`}
                        style={{ 
                          backgroundColor: config.buttonColor, 
                          color: config.buttonTextColor,
                          borderRadius: `${config.buttonRadius}px`,
                          boxShadow: `0 20px 40px ${config.buttonColor}33`
                        }}
                      >
                        <MousePointer2 className="w-4 h-4" />
                        Book Adventure
                      </button>
                  </div>

                  {/* Mock Cards */}
                  <div className="p-8 grid grid-cols-2 gap-4 bg-slate-50/50">
                     {[...Array(2)].map((_, i) => (
                       <div key={i} className="bg-white p-4 border border-slate-100 transition-all duration-500" style={{ backgroundColor: config.cardBgColor, borderRadius: `${config.cardRadius}px`, boxShadow: config.cardShadow }}>
                          <div className="aspect-square bg-slate-100 mb-4 rounded-2xl overflow-hidden relative">
                             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </div>
                          <div className="space-y-2">
                             <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                             <div className="h-2 w-1/2 bg-slate-50 rounded-full" />
                          </div>
                       </div>
                     ))}
                  </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function ThemeSection({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">{title}</h2>
      </div>
      <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
        {children}
      </div>
    </section>
  );
}

function ColorInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</Label>
      <div className="flex gap-3 group">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer group-hover:scale-105 transition-transform">
          <input 
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-[-8px] w-[calc(100%+16px)] h-[calc(100%+16px)] cursor-pointer"
          />
        </div>
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="font-black uppercase text-xs tracking-widest rounded-xl border-slate-200 h-12"
        />
      </div>
    </div>
  );
}

function SliderControl({ label, value, min, max, onChange }: { label: string, value: number, min: number, max: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-4">
      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</Label>
      <Slider 
        value={[value]} 
        onValueChange={(v) => onChange(v[0])} 
        min={min} 
        max={max} 
        step={1} 
        className="py-2"
      />
    </div>
  );
}
