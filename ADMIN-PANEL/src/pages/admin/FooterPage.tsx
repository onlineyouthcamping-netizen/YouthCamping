import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsService } from "@/services/settings.service";
import { toast } from "sonner";
import { Save, Layout, Info, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import api from "@/services/api";

export default function FooterPage() {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, watch, setValue } = useForm<any>();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await settingsService.get();
        reset(data);
      } catch (err) {
        toast.error("Failed to load footer settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reset]);

  const onSubmit = async (data: any) => {
    try {
      await settingsService.update(data);
      toast.success("Footer updated successfully");
      api.post('/revalidate', { path: '/' }).catch(() => {});
    } catch (err) {
      toast.error("Failed to update footer");
    }
  };

  if (loading) return <div className="p-10 text-center font-black uppercase tracking-widest opacity-40">Loading Footer Config...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Footer Management</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Configure global site footer & legal information</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} className="rounded-xl h-12 px-8 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20">
          <Save className="w-4 h-4 mr-2" /> Save Footer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Footer Info */}
          <Card className="rounded-[32px] border-2 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-8">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-black uppercase tracking-widest">General Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Footer Brand Tagline</Label>
                <Input 
                  {...register("footer.tagline")} 
                  className="h-14 rounded-2xl border-2 text-sm font-bold" 
                  placeholder="e.g. Your Story Starts Here"
                />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Copyright Information</Label>
                <Input 
                  {...register("footer.copyright")} 
                  className="h-14 rounded-2xl border-2 text-sm font-bold" 
                  placeholder="e.g. © 2024 Youthcamping. All rights reserved."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="rounded-[32px] border-2 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-8">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Layout className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-black uppercase tracking-widest">Footer Contact Info</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Public Email</Label>
                    <Input {...register("footer.email")} className="h-14 rounded-2xl border-2 font-bold" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Public Phone</Label>
                    <Input {...register("footer.phone")} className="h-14 rounded-2xl border-2 font-bold" />
                  </div>
               </div>
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Office Address</Label>
                  <Input {...register("footer.address")} className="h-14 rounded-2xl border-2 font-bold" />
               </div>
            </CardContent>
          </Card>

          {/* Footer Navigation Links */}
          <Card className="rounded-[32px] border-2 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <LinkIcon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Footer Navigation Links</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  const current = watch('footer.links') || [];
                  setValue('footer.links', [...current, { label: '', href: '' }]);
                }} className="rounded-xl border-2 font-black text-[10px] tracking-widest">
                  <Plus className="w-3 h-3 mr-2" /> ADD LINK
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {(watch('footer.links') || []).map((link: any, index: number) => (
                <div key={index} className="flex gap-4 items-center bg-muted/20 p-4 rounded-2xl border-2 border-dashed group">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <Input {...register(`footer.links.${index}.label`)} placeholder="Label (e.g. About Us)" className="h-12 rounded-xl border-2 font-bold" />
                    <Input {...register(`footer.links.${index}.href`)} placeholder="Href (e.g. /about)" className="h-12 rounded-xl border-2 font-mono text-xs" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => {
                    const current = watch('footer.links') || [];
                    setValue('footer.links', current.filter((_: any, i: number) => i !== index));
                  }} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {(!watch('footer.links') || watch('footer.links').length === 0) && (
                <div className="text-center py-10 border-2 border-dashed rounded-[32px] opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">No links added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Logo Management */}
          <Card className="rounded-[32px] border-2 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-8">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Footer Logo</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="aspect-square rounded-[32px] bg-muted/20 border-4 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center p-8 gap-4 group hover:border-primary/50 transition-all cursor-pointer">
                {watch('footer.logoUrl') ? (
                  <img src={watch('footer.logoUrl')} className="max-w-full max-h-full object-contain" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl">
                      <Layout className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">No Logo Selected</p>
                  </>
                )}
              </div>
              <Input 
                {...register("footer.logoUrl")} 
                placeholder="Logo URL" 
                className="rounded-xl border-2 text-[10px] font-mono"
              />
            </CardContent>
          </Card>

          <div className="bg-primary/5 p-8 rounded-[32px] border-2 border-primary/10">
            <h4 className="font-black text-xs uppercase tracking-widest mb-4">Quick Tip</h4>
            <p className="text-[11px] font-medium leading-relaxed opacity-60 italic">
              Updating your footer settings will automatically refresh your site across all pages including legal and expedition pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
