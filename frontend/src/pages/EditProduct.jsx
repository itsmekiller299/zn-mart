import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, updateProduct, reset } from '../features/products/productSlice';
import { getCategories } from '../features/categories/categorySlice';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, Upload } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: '',
  });

  const { name, description, price, category, stock, imageUrl } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, isSuccess, isError, message, isLoading } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getProduct(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category?._id || '',
        stock: product.stock || '',
        imageUrl: product.images?.[0]?.url || '',
      });
    }
  }, [product]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && message !== 'Product deleted') { // message check to avoid trigger on delete success if shared state
      // Note: In a real app, you'd have a separate isUpdated state
    }
  }, [isError, isSuccess, message]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const productData = {
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      images: [{ url: imageUrl, public_id: product.images?.[0]?.public_id || `manual_${Date.now()}` }]
    };
    dispatch(updateProduct({ id, productData }))
      .unwrap()
      .then(() => {
        toast.success('Product updated successfully');
        navigate('/admin/products');
      });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button 
        onClick={() => navigate('/admin/products')}
        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6 font-medium"
      >
        <ArrowLeft size={20} /> Back to Products
      </button>

      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
        <p className="text-gray-500 mb-8">Update your product details and pricing.</p>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={name}
                  onChange={onChange}
                  className="w-full border rounded-xl px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select 
                  name="category"
                  value={category}
                  onChange={onChange}
                  className="w-full border rounded-xl px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                  <input 
                    type="number" 
                    name="price"
                    value={price}
                    onChange={onChange}
                    className="w-full border rounded-xl px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                  <input 
                    type="number" 
                    name="stock"
                    value={stock}
                    onChange={onChange}
                    className="w-full border rounded-xl px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image URL</label>
                <div className="relative">
                   <input 
                    type="text" 
                    name="imageUrl"
                    value={imageUrl}
                    onChange={onChange}
                    className="w-full border rounded-xl pl-11 pr-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                    required
                  />
                  <Upload size={18} className="absolute left-4 top-3.5 text-gray-400" />
                </div>
              </div>

              {imageUrl && (
                <div className="border rounded-xl p-4 bg-gray-50 flex items-center justify-center h-48 overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="max-h-full object-contain" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea 
              name="description"
              value={description}
              onChange={onChange}
              rows="4"
              className="w-full border rounded-xl px-4 py-3 bg-gray-50 outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" 
              required
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary py-3 px-10 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} /> {isLoading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
