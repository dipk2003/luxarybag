import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { productService } from '@/modules/catalog/productService';
import { categoryCatalog } from '@/modules/shared/constants/storeDefaults';
import { formatCurrency } from '@/modules/shared/utils/formatters';

const emptyProduct = {
  name: '',
  slug: '',
  sku: '',
  category: 'bridal',
  price: 0,
  originalPrice: 0,
  discount: 0,
  shortDescription: '',
  description: '',
  material: '',
  deliveryNote: '',
  rating: 4.8,
  reviewsCount: 0,
  featured: false,
  inStock: true,
  isNewArrival: true,
  isBestSeller: false,
  isCustomizable: false,
  images: [],
  highlights: [],
  personalizationOptions: {
    base_colors: ['Gold', 'Rose Gold', 'Ivory'],
    embellishment_types: ['Crystal', 'Mirror', 'Zari'],
  },
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(emptyProduct);
  const [imagesInput, setImagesInput] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [colorOptionsInput, setColorOptionsInput] = useState('Gold, Rose Gold, Ivory');
  const [embellishmentInput, setEmbellishmentInput] = useState('Crystal, Mirror, Zari');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.list();
      setProducts(data);
    } catch (error) {
      toast({
        title: 'Unable to load products',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openEditor = (product = emptyProduct) => {
    setEditingProduct(product);
    setImagesInput((product.images || []).join('\n'));
    setHighlightsInput((product.highlights || []).join('\n'));
    setColorOptionsInput(
      (product.personalizationOptions?.base_colors || []).join(', '),
    );
    setEmbellishmentInput(
      (product.personalizationOptions?.embellishment_types || []).join(', '),
    );
    setShowForm(true);
  };

  const closeEditor = () => {
    setEditingProduct(emptyProduct);
    setShowForm(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await productService.save({
        ...editingProduct,
        images: imagesInput.split('\n').map((value) => value.trim()).filter(Boolean),
        highlights: highlightsInput.split('\n').map((value) => value.trim()).filter(Boolean),
        personalizationOptions: {
          base_colors: colorOptionsInput
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
          embellishment_types: embellishmentInput
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        },
      });
      toast({
        title: editingProduct.id ? 'Product updated' : 'Product created',
      });
      closeEditor();
      fetchProducts();
    } catch (error) {
      toast({
        title: 'Unable to save product',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await productService.remove(id);
      fetchProducts();
    } catch (error) {
      toast({
        title: 'Unable to delete product',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminShell
      title="Products"
      description="Manage the catalog, pricing, featured flags, and customization options."
      action={
        <Button
          type="button"
          onClick={() => openEditor(emptyProduct)}
          className="rounded-full bg-stone-950 text-white hover:bg-stone-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add product
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
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Catalog editor</p>
              <h2 className="mt-2 font-display text-3xl text-stone-950">
                {editingProduct.id ? 'Edit product' : 'Create product'}
              </h2>
            </div>
            <Button type="button" variant="ghost" onClick={closeEditor} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              required
              value={editingProduct.name}
              onChange={(event) =>
                setEditingProduct({ ...editingProduct, name: event.target.value })
              }
              placeholder="Product name"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              required
              value={editingProduct.slug}
              onChange={(event) =>
                setEditingProduct({ ...editingProduct, slug: event.target.value })
              }
              placeholder="Slug"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={editingProduct.sku}
              onChange={(event) =>
                setEditingProduct({ ...editingProduct, sku: event.target.value })
              }
              placeholder="SKU"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <select
              value={editingProduct.category}
              onChange={(event) =>
                setEditingProduct({ ...editingProduct, category: event.target.value })
              }
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none"
            >
              {categoryCatalog
                .filter((category) => category.slug !== 'all')
                .map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
            </select>
            <input
              type="number"
              value={editingProduct.price}
              onChange={(event) =>
                setEditingProduct({ ...editingProduct, price: Number(event.target.value) })
              }
              placeholder="Price"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="number"
              value={editingProduct.originalPrice}
              onChange={(event) =>
                setEditingProduct({
                  ...editingProduct,
                  originalPrice: Number(event.target.value),
                })
              }
              placeholder="Original price"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
          </div>

          <textarea
            rows="2"
            value={editingProduct.shortDescription}
            onChange={(event) =>
              setEditingProduct({
                ...editingProduct,
                shortDescription: event.target.value,
              })
            }
            placeholder="Short description"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <textarea
            rows="5"
            value={editingProduct.description}
            onChange={(event) =>
              setEditingProduct({
                ...editingProduct,
                description: event.target.value,
              })
            }
            placeholder="Full description"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={editingProduct.material}
              onChange={(event) =>
                setEditingProduct({ ...editingProduct, material: event.target.value })
              }
              placeholder="Material"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={editingProduct.deliveryNote}
              onChange={(event) =>
                setEditingProduct({ ...editingProduct, deliveryNote: event.target.value })
              }
              placeholder="Delivery note"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
          </div>

          <textarea
            rows="5"
            value={imagesInput}
            onChange={(event) => setImagesInput(event.target.value)}
            placeholder="One image URL per line"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <textarea
            rows="4"
            value={highlightsInput}
            onChange={(event) => setHighlightsInput(event.target.value)}
            placeholder="One highlight per line"
            className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={colorOptionsInput}
              onChange={(event) => setColorOptionsInput(event.target.value)}
              placeholder="Color options, comma separated"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
            <input
              type="text"
              value={embellishmentInput}
              onChange={(event) => setEmbellishmentInput(event.target.value)}
              placeholder="Embellishments, comma separated"
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none transition focus:border-stone-900"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-600">
            {[
              ['featured', 'Featured'],
              ['inStock', 'In stock'],
              ['isNewArrival', 'New arrival'],
              ['isBestSeller', 'Best seller'],
              ['isCustomizable', 'Customizable'],
            ].map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(editingProduct[key])}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      [key]: event.target.checked,
                    })
                  }
                />
                {label}
              </label>
            ))}
          </div>

          <Button
            type="submit"
            className="mt-6 rounded-full bg-stone-950 text-white hover:bg-stone-800"
          >
            Save product
          </Button>
        </form>
      ) : null}

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
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.featuredImage}
                          alt={product.name}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                        <div>
                          <p className="font-semibold text-stone-950">{product.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone-400">
                            {product.sku || 'No SKU'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-600">{product.category}</td>
                    <td className="px-6 py-4 font-semibold text-stone-950">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      {product.inStock ? 'In stock' : 'Out of stock'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openEditor(product)}
                          className="rounded-full border-stone-200 bg-white text-stone-700"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDelete(product.id)}
                          className="rounded-full border-red-200 bg-white text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminProducts;
