import React, { useEffect, useState } from 'react';
import { Loader2, Star, Trash2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { contentService } from '@/modules/content/contentService';
import { formatDate } from '@/modules/shared/utils/formatters';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await contentService.listReviews();
      setReviews(data);
    } catch (error) {
      toast({
        title: 'Unable to load reviews',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleVerify = async (review) => {
    try {
      await contentService.saveReview({ ...review, verified: !review.verified });
      fetchReviews();
    } catch (error) {
      toast({
        title: 'Unable to update review',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await contentService.deleteReview(id);
      fetchReviews();
    } catch (error) {
      toast({
        title: 'Unable to delete review',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminShell
      title="Reviews"
      description="Moderate customer reviews, verify proof, or remove low-quality submissions."
    >
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-[32px] border border-stone-100 bg-[#faf7f3] p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-1 text-stone-950">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-4 h-4 ${
                          index < review.rating ? 'fill-current' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-stone-950">{review.name}</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {review.product} • {formatDate(review.createdAt)}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-stone-600">“{review.comment}”</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={review.verified ? 'default' : 'outline'}
                    onClick={() => toggleVerify(review)}
                    className={
                      review.verified
                        ? 'rounded-full bg-stone-950 text-white hover:bg-stone-800'
                        : 'rounded-full border-stone-200 bg-white text-stone-700'
                    }
                  >
                    {review.verified ? 'Verified' : 'Verify'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDelete(review.id)}
                    className="rounded-full border-red-200 bg-white text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
};

export default AdminReviews;
