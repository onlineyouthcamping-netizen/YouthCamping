import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { settingsService } from "@/services/settings.service";
import { toast } from "sonner";
import { 
  Palette, Navigation, Layout, Share2, Phone, Save, Plus, Trash2 
} from "lucide-react";
import api from "@/services/api";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, watch, setValue } = useForm<any>();

  const navbarLinks = watch('navbarLinks') || [];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await settingsService.get();
        reset(data);
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reset]);

  const onSubmit = async (data: any) => {
    try {
      await settingsService.update(data);
      toast.success("Settings updated");
      api.post('/revalidate', { path: '/' }).catch(() => {});
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  const addNavbarLink = () => {
    setValue('navbarLinks', [...navbarLinks, { label: '', href: '', order: navbarLinks.length }]);
  };

  const removeNavbarLink = (index: number) => {
    setValue('navbarLinks', navbarLinks.filter((_: any, i: number) => i !== index));
  };

  if (loading) return <div className="p-10 text-center font-black uppercase tracking-widest opacity-40">Loading System...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase tracking-tight">Global Settings</h1>
        <Button onClick={handleSubmit(onSubmit)}>
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid grid-cols-5 w-full bg-muted/50 rounded-2xl p-1 h-14">
          <TabsTrigger value="branding" className="rounded-xl font-bold uppercase text-[10px] tracking-widest"><Palette className="w-3 h-3 mr-2" /> Branding</TabsTrigger>
          <TabsTrigger value="navigation" className="rounded-xl font-bold uppercase text-[10px] tracking-widest"><Navigation className="w-3 h-3 mr-2" /> Navigation</TabsTrigger>
          <TabsTrigger value="footer" className="rounded-xl font-bold uppercase text-[10px] tracking-widest"><Layout className="w-3 h-3 mr-2" /> Footer</TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl font-bold uppercase text-[10px] tracking-widest"><Share2 className="w-3 h-3 mr-2" /> Social</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-xl font-bold uppercase text-[10px] tracking-widest"><Phone className="w-3 h-3 mr-2" /> Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-sm">
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Logo URL</Label>
                <div className="flex gap-4">
                  <Input {...register("logo.url")} className="h-14 rounded-2xl border-2" />
                  {watch('logo.url') && (
                    <div className="w-14 h-14 rounded-2xl bg-muted p-2 flex items-center justify-center border-2 overflow-hidden shadow-inner">
                      <img src={watch('logo.url')} className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Logo Alt Text</Label>
                <Input {...register("logo.alt")} className="h-14 rounded-2xl border-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-sm">
            <CardContent className="p-10 space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Navbar Links</Label>
                <Button variant="outline" size="sm" onClick={addNavbarLink}>
                  <Plus className="w-3 h-3 mr-2" /> Add Link
                </Button>
              </div>
              <div className="space-y-4">
                {navbarLinks.map((link: any, index: number) => (
                  <div key={index} className="flex gap-4 items-center bg-muted/20 p-4 rounded-2xl border-2 border-dashed">
                    <Input {...register(`navbarLinks.${index}.label`)} placeholder="Label" className="h-12 rounded-xl" />
                    <Input {...register(`navbarLinks.${index}.href`)} placeholder="Href" className="h-12 rounded-xl" />
                    <Button variant="ghost" size="icon" onClick={() => removeNavbarLink(index)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-sm">
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Footer Tagline</Label>
                <Input {...register("footer.tagline")} className="h-14 rounded-2xl border-2" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Copyright Text</Label>
                <Input {...register("footer.copyright")} className="h-14 rounded-2xl border-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-sm">
            <CardContent className="p-10 space-y-8">
              {['instagram', 'facebook', 'youtube'].map(platform => (
                <div key={platform} className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 capitalize">{platform} URL</Label>
                  <Input {...register(`socialLinks.${platform}`)} className="h-14 rounded-2xl border-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-sm">
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Contact Phone</Label>
                <Input {...register("contactPhone")} className="h-14 rounded-2xl border-2" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Contact Email</Label>
                <Input {...register("contactEmail")} className="h-14 rounded-2xl border-2" />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Office Address</Label>
                <Input {...register("address")} className="h-14 rounded-2xl border-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-sm">
            <CardContent className="p-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Room Sharing Options</Label>
                  <Button variant="outline" size="sm" onClick={() => setValue('bookingForm.roomSharingOptions', [...(watch('bookingForm.roomSharingOptions') || []), { label: '', priceAdjustment: 0 }])}>
                    <Plus className="w-3 h-3 mr-2" /> Add Option
                  </Button>
                </div>
                <div className="space-y-3">
                  {(watch('bookingForm.roomSharingOptions') || []).map((_: any, index: number) => (
                    <div key={index} className="flex gap-4 items-center bg-muted/20 p-4 rounded-2xl border-2 border-dashed">
                      <Input {...register(`bookingForm.roomSharingOptions.${index}.label`)} placeholder="Label (e.g. Twin Sharing)" className="h-12 rounded-xl" />
                      <Input {...register(`bookingForm.roomSharingOptions.${index}.priceAdjustment`)} type="number" placeholder="Price +/-" className="h-12 rounded-xl w-32" />
                      <Button variant="ghost" size="icon" onClick={() => setValue('bookingForm.roomSharingOptions', watch('bookingForm.roomSharingOptions').filter((_: any, i: number) => i !== index))} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Train Travel Options</Label>
                  <Button variant="outline" size="sm" onClick={() => setValue('bookingForm.trainOptions', [...(watch('bookingForm.trainOptions') || []), { label: '', priceAdjustment: 0 }])}>
                    <Plus className="w-3 h-3 mr-2" /> Add Option
                  </Button>
                </div>
                <div className="space-y-3">
                  {(watch('bookingForm.trainOptions') || []).map((_: any, index: number) => (
                    <div key={index} className="flex gap-4 items-center bg-muted/20 p-4 rounded-2xl border-2 border-dashed">
                      <Input {...register(`bookingForm.trainOptions.${index}.label`)} placeholder="Label (e.g. 3AC)" className="h-12 rounded-xl" />
                      <Input {...register(`bookingForm.trainOptions.${index}.priceAdjustment`)} type="number" placeholder="Price +/-" className="h-12 rounded-xl w-32" />
                      <Button variant="ghost" size="icon" onClick={() => setValue('bookingForm.trainOptions', watch('bookingForm.trainOptions').filter((_: any, i: number) => i !== index))} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Submit Button Text</Label>
                <Input {...register("bookingForm.submitButtonText")} className="h-14 rounded-2xl border-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
