import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/Products.css";

const ProductsNew = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState("latest");
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [addedItems, setAddedItems] = useState({});
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (category) params.append("category", category);
        if (sort) params.append("sort", sort);

        const res = await API.get(`/products?${params}`);
        setProducts(res.data);
        setError("");
      } catch (err) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, sort]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/products/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    if (!isLoggedIn) return;

    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, unit: product.baseUnit }]);
    }
    
    // Show added animation
    setAddedItems(prev => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <div>
          <h1>Chemical Inventory</h1>
          <p className="text-dim mt-8">High-precision laboratory and industrial chemicals.</p>
        </div>
        {isLoggedIn && cart.length > 0 && (
          <Link to="/quotation" className="quotation-link">
            <span>📋 View Quotation</span>
            <span className="badge badge-confirmed">{cart.length}</span>
          </Link>
        )}
      </div>

      <div className="filters-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="filter-select"
        >
          <option value="latest">Latest Additions</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
        
        {(search || category || sort !== "latest") && (
          <button onClick={() => { setSearch(""); setCategory(""); setSort("latest"); }} className="btn btn-secondary">
            Clear
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading inventory...</div>
      ) : products.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px' }}>
          <h3>No products found</h3>
          <p className="text-dim">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-card-header">
                <h3>{product.name}</h3>
                <span className="sku-badge">{product.sku}</span>
              </div>

              <div className="product-description">
                {product.description || "No description available."}
              </div>

              <div className="product-meta">
                <div className="price-row">
                  <div className="price-value">
                    ₹{parseFloat(product.basePricePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    <span className="price-unit"> / {product.baseUnit}</span>
                  </div>
                  {product.taxPercentage > 0 && (
                    <div className="tax-info">+{product.taxPercentage}% GST</div>
                  )}
                </div>
                
                <div className="units-row">
                  <span className="text-xs text-dim">Supported Units:</span>
                  {product.supportedUnitsDisplay?.map(unit => (
                    <span key={unit.code} className="unit-tag">{unit.label}</span>
                  ))}
                </div>
              </div>

              {isLoggedIn ? (
                <button
                  onClick={() => addToCart(product)}
                  className={`btn ${addedItems[product._id] ? 'btn-success add-to-cart-btn added' : 'btn-primary add-to-cart-btn'}`}
                >
                  {addedItems[product._id] ? '✓ Added' : '+ Add to Quotation'}
                </button>
              ) : (
                <Link to="/login" className="btn btn-secondary add-to-cart-btn">
                  Sign in to Order
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsNew;
