import React, { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { leadService } from '@/modules/marketing/leadService';
import { formatDate } from '@/modules/shared/utils/formatters';

const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadLeads = async () => {
      try {
        const data = await leadService.listLeads();
        if (active) {
          setLeads(data);
        }
      } catch (error) {
        toast({
          title: 'Unable to load leads',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLeads();

    return () => {
      active = false;
    };
  }, []);

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Source', 'Discount', 'Created'];
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.source,
      lead.discount || '',
      formatDate(lead.created_at),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'luxebag-leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminShell
      title="Leads"
      description="Captured emails from the popup, campaigns, and other lead magnets."
      action={
        <Button
          type="button"
          onClick={handleExport}
          className="rounded-full bg-stone-950 text-white hover:bg-stone-800"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
        </div>
      ) : leads.length > 0 ? (
        <div className="overflow-hidden rounded-[32px] border border-stone-100">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-[#faf7f3] text-left text-stone-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Source</th>
                  <th className="px-6 py-4 font-medium">Discount</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 font-semibold text-stone-950">{lead.name}</td>
                    <td className="px-6 py-4 text-stone-600">{lead.email}</td>
                    <td className="px-6 py-4 text-stone-600">{lead.source}</td>
                    <td className="px-6 py-4 text-stone-600">{lead.discount || '-'}</td>
                    <td className="px-6 py-4 text-stone-500">{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-stone-300 bg-[#faf7f3] p-12 text-center text-sm text-stone-500">
          No leads captured yet.
        </div>
      )}
    </AdminShell>
  );
};

export default AdminLeads;
