import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { contentService } from '@/modules/content/contentService';

const AdminInstagram = () => {
  const [settings, setSettings] = useState({
    handle: '',
    profileUrl: '',
    badgeText: '',
    gallery: [],
  });
  const [galleryInput, setGalleryInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const data = await contentService.getInstagramSettings();
        if (active) {
          setSettings(data);
          setGalleryInput((data.gallery || []).join('\n'));
        }
      } catch (error) {
        toast({
          title: 'Unable to load Instagram settings',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      const nextSettings = await contentService.saveInstagramSettings({
        ...settings,
        gallery: galleryInput
          .split('\n')
          .map((value) => value.trim())
          .filter(Boolean),
      });
      setSettings(nextSettings);
      setGalleryInput((nextSettings.gallery || []).join('\n'));
      toast({ title: 'Instagram settings saved' });
    } catch (error) {
      toast({
        title: 'Unable to save settings',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminShell
      title="Instagram"
      description="Control the feed handle, trust badge, and image gallery shown on the storefront."
    >
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
        </div>
      ) : (
        <div className="rounded-[32px] border border-stone-100 bg-[#faf7f3] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={settings.handle}
              onChange={(event) => setSettings({ ...settings, handle: event.target.value })}
              placeholder="Instagram handle"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={settings.profileUrl}
              onChange={(event) =>
                setSettings({ ...settings, profileUrl: event.target.value })
              }
              placeholder="Profile URL"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
          </div>
          <input
            type="text"
            value={settings.badgeText}
            onChange={(event) =>
              setSettings({ ...settings, badgeText: event.target.value })
            }
            placeholder="Badge text"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <textarea
            rows="8"
            value={galleryInput}
            onChange={(event) => setGalleryInput(event.target.value)}
            placeholder="One image URL per line"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <Button
            type="button"
            onClick={handleSave}
            className="mt-6 rounded-full bg-stone-950 text-white hover:bg-stone-800"
          >
            Save settings
          </Button>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminInstagram;
