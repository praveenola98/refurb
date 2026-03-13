import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Product } from '../../types';
import { Plus, Edit2, Trash2, Package, X } from 'lucide-react';
import axios from 'axios';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    processor: '',
    ram: '',
    ssd: '',
    price: 0,
    discountPrice: 0,
    condition: 'A',
    stock: 0,
    description: '',
    warranty: '1 Year',
    featured: false,
    category: 'Laptop',
    images: [] as string[],
    specifications: {} as Record<string, string>
  });

  const [newSpec, setNewSpec] = useState({ key: '', value: '' });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addSpec = () => {
    if (newSpec.key && newSpec.value) {
      setFormData(prev => ({
        ...prev,
        specifications: { ...prev.specifications, [newSpec.key]: newSpec.value }
      }));
      setNewSpec({ key: '', value: '' });
    }
  };

  const removeSpec = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const { data } = await axios.post('/api/upload', uploadData);
      setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Image upload failed. Please check your Cloudinary configuration.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = { ...formData };
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), dataToSave).catch(err => handleFirestoreError(err, OperationType.UPDATE, `products/${editingProduct.id}`));
      } else {
        await addDoc(collection(db, 'products'), dataToSave).catch(err => handleFirestoreError(err, OperationType.CREATE, 'products'));
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({
        name: '', brand: '', processor: '', ram: '', ssd: '', price: 0, discountPrice: 0,
        condition: 'A', stock: 0, description: '', warranty: '1 Year', featured: false, category: 'Laptop', images: [],
        specifications: {}
      });
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id)).catch(err => handleFirestoreError(err, OperationType.DELETE, `products/${id}`));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <button
          onClick={() => { 
            setEditingProduct(null); 
            setFormData({
              name: '', brand: '', processor: '', ram: '', ssd: '', price: 0, discountPrice: 0,
              condition: 'A', stock: 0, description: '', warranty: '1 Year', featured: false, category: 'Laptop', images: [],
              specifications: {}
            });
            setIsModalOpen(true); 
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Condition</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg mr-3 overflow-hidden">
                      <img src={product.images?.[0] || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">₹{product.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {product.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-600">Grade {product.condition}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button onClick={() => { 
                      setEditingProduct(product); 
                      setFormData({
                        ...product,
                        specifications: product.specifications || {}
                      } as any); 
                      setIsModalOpen(true); 
                    }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                <input required name="brand" value={formData.brand} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Condition</label>
                <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <input required name="category" value={formData.category} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
                <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Warranty</label>
                <input required name="warranty" value={formData.warranty} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="md:col-span-3 border-t border-gray-100 pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Core Specs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Processor</label>
                    <input name="processor" value={formData.processor} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">RAM</label>
                    <input name="ram" value={formData.ram} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">SSD/Storage</label>
                    <input name="ssd" value={formData.ssd} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 border-t border-gray-100 pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Additional Specifications</h3>
                <div className="space-y-2 mb-4">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <span className="text-sm"><span className="font-bold">{key}:</span> {value}</span>
                      <button type="button" onClick={() => removeSpec(key)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input placeholder="Key (e.g. Screen)" value={newSpec.key} onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })} className="flex-1 p-2 border border-gray-200 rounded-lg outline-none" />
                  <input placeholder="Value (e.g. 14 inch)" value={newSpec.value} onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })} className="flex-1 p-2 border border-gray-200 rounded-lg outline-none" />
                  <button type="button" onClick={addSpec} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200">Add</button>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">Images</label>
                <div className="flex flex-wrap gap-4 mb-4">
                  {formData.images.map((img, i) => (
                    <div key={i} className="h-20 w-20 relative rounded-lg overflow-hidden border border-gray-100">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <label className="h-20 w-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <Plus className="h-6 w-6 text-gray-400" />
                    <input type="file" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))} className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-bold text-gray-700">Featured Product</span>
                </label>
              </div>

              <div className="md:col-span-3 pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
