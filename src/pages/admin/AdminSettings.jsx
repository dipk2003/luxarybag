import React, { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useStore } from '@/contexts/ModeContext';

const AdminSettings = () => {
  const { settings, updateSettings, mode } = useStore();
  const [formData, setFormData] = useState(settings);
  const [faqValue, setFaqValue] = useState('');

  useEffect(() => {
    setFormData(settings);
    setFaqValue(
      (settings.faqItems || [])
        .map((faq) => `${faq.question}::${faq.answer}`)
        .join('\n'),
    );
  }, [settings]);

  const handleSave = async () => {
    try {
      const nextSettings = await updateSettings({
        ...formData,
        faqItems: faqValue
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [question, answer] = line.split('::');
            return { question: question?.trim(), answer: answer?.trim() };
          })
          .filter((item) => item.question && item.answer),
      });
      setFormData(nextSettings);
      setFaqValue(
        (nextSettings.faqItems || [])
          .map((faq) => `${faq.question}::${faq.answer}`)
          .join('\n'),
      );
      toast({
        title: 'Store settings saved',
      });
    } catch {}
  };

  return (
    <AdminShell
      title="Store Settings"
      description="Control brand copy, hero content, contact information, and storefront FAQs."
    >
      <div className="space-y-8">
        <section className="rounded-[32px] border border-stone-100 bg-[#faf7f3] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Store mode</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {['STARTER', 'GROWTH'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, mode: value })}
                className={`rounded-[28px] border p-6 text-left transition ${
                  (formData.mode || mode) === value
                    ? 'border-stone-950 bg-stone-950 text-white'
                    : 'border-stone-200 bg-white text-stone-700'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.24em] opacity-60">{value}</p>
                <p className="mt-3 text-sm leading-7">
                  {value === 'STARTER'
                    ? 'WhatsApp-led catalog mode.'
                    : 'Full cart and checkout mode.'}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-stone-100 bg-[#faf7f3] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={formData.brandName || ''}
              onChange={(event) =>
                setFormData({ ...formData, brandName: event.target.value })
              }
              placeholder="Brand name"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={formData.brandShortName || ''}
              onChange={(event) =>
                setFormData({ ...formData, brandShortName: event.target.value })
              }
              placeholder="Short brand name"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={formData.contactEmail || ''}
              onChange={(event) =>
                setFormData({ ...formData, contactEmail: event.target.value })
              }
              placeholder="Contact email"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={formData.supportPhone || ''}
              onChange={(event) =>
                setFormData({ ...formData, supportPhone: event.target.value })
              }
              placeholder="Support phone"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={formData.whatsappNumber || ''}
              onChange={(event) =>
                setFormData({ ...formData, whatsappNumber: event.target.value })
              }
              placeholder="WhatsApp number"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={formData.instagramHandle || ''}
              onChange={(event) =>
                setFormData({ ...formData, instagramHandle: event.target.value })
              }
              placeholder="Instagram handle"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
          </div>
          <textarea
            rows="2"
            value={formData.tagline || ''}
            onChange={(event) =>
              setFormData({ ...formData, tagline: event.target.value })
            }
            placeholder="Tagline"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <textarea
            rows="2"
            value={formData.announcementText || ''}
            onChange={(event) =>
              setFormData({ ...formData, announcementText: event.target.value })
            }
            placeholder="Announcement text"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
        </section>

        <section className="rounded-[32px] border border-stone-100 bg-[#faf7f3] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={formData.heroKicker || ''}
              onChange={(event) =>
                setFormData({ ...formData, heroKicker: event.target.value })
              }
              placeholder="Hero kicker"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={formData.trustedBadgeText || ''}
              onChange={(event) =>
                setFormData({ ...formData, trustedBadgeText: event.target.value })
              }
              placeholder="Trust badge text"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
          </div>
          <textarea
            rows="2"
            value={formData.heroTitle || ''}
            onChange={(event) =>
              setFormData({ ...formData, heroTitle: event.target.value })
            }
            placeholder="Hero title"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <textarea
            rows="3"
            value={formData.heroSubtitle || ''}
            onChange={(event) =>
              setFormData({ ...formData, heroSubtitle: event.target.value })
            }
            placeholder="Hero subtitle"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <textarea
            rows="6"
            value={faqValue}
            onChange={(event) => setFaqValue(event.target.value)}
            placeholder="FAQ entries as Question::Answer on each line"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
        </section>

        <Button
          type="button"
          onClick={handleSave}
          className="rounded-full bg-stone-950 text-white hover:bg-stone-800"
        >
          Save changes
        </Button>
      </div>
    </AdminShell>
  );
};

export default AdminSettings;
