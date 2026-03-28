import { supabase } from '@/lib/customSupabaseClient';
import { normalizeOrder } from '@/modules/shared/utils/normalizers';

const getCount = async (table) => {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw error;
  }

  return count || 0;
};

export const dashboardService = {
  async getSummary() {
    const [products, leads, reviews, blogPosts, ordersResponse, orderTotalsResponse] = await Promise.all([
      getCount('products'),
      getCount('leads'),
      getCount('reviews'),
      getCount('blog_posts'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('orders').select('total_amount'),
    ]);

    if (ordersResponse.error) {
      throw ordersResponse.error;
    }

    if (orderTotalsResponse.error) {
      throw orderTotalsResponse.error;
    }

    const recentOrders = (ordersResponse.data || []).map(normalizeOrder);
    const totalRevenue = (orderTotalsResponse.data || []).reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0,
    );

    return {
      stats: {
        products,
        leads,
        reviews,
        blogPosts,
        totalRevenue,
      },
      recentOrders,
    };
  },
};
