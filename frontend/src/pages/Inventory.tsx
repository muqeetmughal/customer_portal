import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Filter, ShoppingCart, Search, X } from 'lucide-react';
import { useFrappeGetCall } from "frappe-react-sdk";
import FilterPanel from '../components/FilterPanel';

const Inventory = () => {
  const { data, error, isLoading } = useFrappeGetCall(
    "customer_portal.api.v1.get_product_catalog"
  );

  const INVENTORY_ITEMS = Array.isArray(data?.message) ? data.message : [];

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  // --- Local Storage addToCart functionality ---
  const [cart, setCart] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('customer_portal_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedCart = localStorage.getItem('customer_portal_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleStorageChange);
    };
  }, []);

  const columns = [
    { label: 'Product Name', key: 'name' },
    { label: 'Category', key: 'category' },
    { label: 'Product ID', key: 'id' }
  ];

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (value) newFilters[key] = value;
      else delete newFilters[key];
      return newFilters;
    });
  };

  const filteredData = useMemo(() => {
    return INVENTORY_ITEMS.filter((item: any) => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        return String(item[key] || '')
          .toLowerCase()
          .includes(value.toLowerCase());
      });
    });
  }, [activeFilters, INVENTORY_ITEMS]);

  const activeFilterCount = Object.keys(activeFilters).length;

  // --- Cart Actions ---
  const addToCart = (product: any) => {
    const savedCart = localStorage.getItem('customer_portal_cart');
    let currentCart = savedCart ? JSON.parse(savedCart) : [];
    
    const existing = currentCart.find((item: any) => item.id === product.id);
    if (existing) {
      currentCart = currentCart.map((item: any) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      currentCart = [...currentCart, { ...product, quantity: 1 }];
    }
    
    localStorage.setItem('customer_portal_cart', JSON.stringify(currentCart));
    setCart(currentCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  if (isLoading) {
    return <div className="p-10 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">Failed to load products</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Product Catalog</h2>
          <p className="text-sm text-slate-500">Browse and order items directly</p>
        </div>
        <div className="flex gap-3 relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 relative"
          >
            <Filter size={20}/>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
            <Plus size={20}/> New Request
          </button>

          <FilterPanel 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            title="Inventory"
            columns={columns}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={() => setActiveFilters({})}
          />
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Active Filters:
          </span>
          {Object.entries(activeFilters).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 text-xs font-medium">
              <span className="opacity-60">{columns.find(c => c.key === key)?.label}:</span>
              <span>{value}</span>
              <button onClick={() => handleFilterChange(key, '')} className="hover:text-indigo-900">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredData.map((item: any) => (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {item.image
                    ? <img src={item.image} className="w-full h-full object-cover rounded-2xl" alt={item.name}/>
                    : "📦"}
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {item.category}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h3>
              <p className="text-xs text-slate-400 mb-4">Item ID: {item.id}</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Price</p>
                  <p className="text-xl font-black text-slate-900">
                    ${Number(item.price || 0).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => addToCart(item)}
                  className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <ShoppingCart size={20}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-slate-50 rounded-full">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-900 font-bold">No products found</p>
            <button
              onClick={() => setActiveFilters({})}
              className="mt-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
