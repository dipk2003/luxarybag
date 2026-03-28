import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { contentService } from '@/modules/content/contentService';
import { formatDate } from '@/modules/shared/utils/formatters';

const emptyPost = {
  title: '',
  slug: '',
  excerpt: '',
  metaDescription: '',
  category: 'Style',
  readTime: '4 min read',
  featuredImage: '',
  content: '',
  published: true,
};

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(emptyPost);
  const [showForm, setShowForm] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await contentService.listBlogPosts();
      setPosts(data);
    } catch (error) {
      toast({
        title: 'Unable to load blog posts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await contentService.saveBlogPost(editingPost);
      toast({
        title: editingPost.id ? 'Post updated' : 'Post created',
      });
      setEditingPost(emptyPost);
      setShowForm(false);
      fetchPosts();
    } catch (error) {
      toast({
        title: 'Unable to save post',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await contentService.deleteBlogPost(id);
      fetchPosts();
    } catch (error) {
      toast({
        title: 'Unable to delete post',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminShell
      title="Blog"
      description="Publish styling notes, gift guides, and care content directly from the admin."
      action={
        <Button
          type="button"
          onClick={() => {
            setEditingPost(emptyPost);
            setShowForm(true);
          }}
          className="rounded-full bg-stone-950 text-white hover:bg-stone-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          New post
        </Button>
      }
    >
      {showForm ? (
        <form
          onSubmit={handleSave}
          className="mb-8 rounded-[32px] border border-stone-100 bg-[#faf7f3] p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Editor</p>
              <h2 className="mt-2 font-display text-3xl text-stone-950">
                {editingPost.id ? 'Edit post' : 'Create post'}
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              required
              value={editingPost.title}
              onChange={(event) =>
                setEditingPost({ ...editingPost, title: event.target.value })
              }
              placeholder="Title"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              required
              value={editingPost.slug}
              onChange={(event) =>
                setEditingPost({ ...editingPost, slug: event.target.value })
              }
              placeholder="Slug"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={editingPost.category}
              onChange={(event) =>
                setEditingPost({ ...editingPost, category: event.target.value })
              }
              placeholder="Category"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={editingPost.readTime}
              onChange={(event) =>
                setEditingPost({ ...editingPost, readTime: event.target.value })
              }
              placeholder="Read time"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
          </div>
          <input
            type="text"
            value={editingPost.featuredImage}
            onChange={(event) =>
              setEditingPost({ ...editingPost, featuredImage: event.target.value })
            }
            placeholder="Featured image URL"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <textarea
            rows="3"
            value={editingPost.excerpt}
            onChange={(event) =>
              setEditingPost({ ...editingPost, excerpt: event.target.value })
            }
            placeholder="Excerpt"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <textarea
            rows="3"
            value={editingPost.metaDescription}
            onChange={(event) =>
              setEditingPost({ ...editingPost, metaDescription: event.target.value })
            }
            placeholder="Meta description"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <textarea
            rows="10"
            required
            value={editingPost.content}
            onChange={(event) =>
              setEditingPost({ ...editingPost, content: event.target.value })
            }
            placeholder="Post content"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <label className="mt-4 inline-flex items-center gap-3 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={editingPost.published}
              onChange={(event) =>
                setEditingPost({ ...editingPost, published: event.target.checked })
              }
            />
            Published
          </label>
          <Button
            type="submit"
            className="mt-6 rounded-full bg-stone-950 text-white hover:bg-stone-800"
          >
            Save post
          </Button>
        </form>
      ) : null}

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-[32px] border border-stone-100 bg-[#faf7f3] p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                    {post.category} • {post.readTime} • {formatDate(post.publishedAt)}
                  </p>
                  <h2 className="mt-3 font-display text-3xl text-stone-950">{post.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{post.excerpt}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingPost(post);
                      setShowForm(true);
                    }}
                    className="rounded-full border-stone-200 bg-white text-stone-700"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDelete(post.id)}
                    className="rounded-full border-red-200 bg-white text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-stone-300 bg-[#faf7f3] p-12 text-center text-sm text-stone-500">
          No blog posts created yet.
        </div>
      )}
    </AdminShell>
  );
};

export default AdminBlog;
