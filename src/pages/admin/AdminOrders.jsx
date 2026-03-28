import React, { useEffect, useState } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { toast } from '@/components/ui/use-toast';
import { orderService } from '@/modules/orders/orderService';
import { orderStatusOptions } from '@/modules/shared/constants/storeDefaults';
import { formatCurrency, formatDate } from '@/modules/shared/utils/formatters';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.list();
      setOrders(data);
    } catch (error) {
      toast({
        title: 'Unable to load orders',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, status);
      toast({
        title: 'Status updated',
        description: `Order moved to ${status}.`,
      });
      fetchOrders();
    } catch (error) {
      toast({
        title: 'Status update failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredOrders =
    filter === 'All' ? orders : orders.filter((order) => order.status === filter);

  return (
    <AdminShell
      title="Orders"
      description="View recent COD orders, change statuses, and message customers directly."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {['All', ...orderStatusOptions].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === status ? 'bg-stone-950 text-white' : 'bg-[#faf7f3] text-stone-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-[32px] border border-stone-100">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-[#faf7f3] text-left text-stone-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Placed</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-stone-950">{order.orderId}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone-400">
                        {order.items?.length || 0} items
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-stone-950">{order.customerName}</p>
                      <p className="mt-1 text-stone-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-stone-950">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(event) => updateStatus(order.id, event.target.value)}
                        className="rounded-full border border-stone-200 bg-[#faf7f3] px-4 py-2 outline-none"
                      >
                        {orderStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-stone-500">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `https://wa.me/${order.customerPhone}?text=${encodeURIComponent(
                              `Hi ${order.customerName}, your order ${order.orderId} is now ${order.status}.`,
                            )}`,
                            '_blank',
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-10 text-center text-sm text-stone-500">
              No orders found in this state.
            </div>
          ) : null}
        </div>
      )}
    </AdminShell>
  );
};

export default AdminOrders;
