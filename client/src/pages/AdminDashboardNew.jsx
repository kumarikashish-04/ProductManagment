import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/AdminDashboard.css";

const AdminDashboardNew = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, quotationsRes, productsRes, statsRes] = await Promise.all([
          API.get("/orders"),
          API.get("/quotations"),
          API.get("/products"),
          API.get("/orders/stats")
        ]);

        setOrders(ordersRes.data);
        setQuotations(quotationsRes.data);
        setProducts(productsRes.data);
        setStats(statsRes.data);
        setError("");
      } catch (err) {
        setError("Failed to fetch dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header mb-24">
        <h1>Admin Control Panel</h1>
        <p className="text-dim mt-8">Manage inventory, orders, and review quotations.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-tabs-container mb-24">
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            📊 Overview
          </button>
          <button className={`tab-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            📦 Orders <span className="tab-badge">{orders.length}</span>
          </button>
          <button className={`tab-btn ${activeTab === "quotations" ? "active" : ""}`} onClick={() => setActiveTab("quotations")}>
            📋 Quotations <span className="tab-badge">{quotations.filter(q => q.status === "pending").length}</span>
          </button>
          <button className={`tab-btn ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
            🏭 Inventory <span className="tab-badge">{products.length}</span>
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "overview" && stats && (
          <div className="overview-section">
            <div className="grid-4 mb-24">
              <div className="stat-card card">
                <div className="stat-label">Total Orders</div>
                <div className="stat-value">{stats.totalOrders}</div>
              </div>
              <div className="stat-card card">
                <div className="stat-label">Pending Quotations</div>
                <div className="stat-value text-yellow">{quotations.filter(q => q.status === "pending").length}</div>
              </div>
              <div className="stat-card card">
                <div className="stat-label">Active Products</div>
                <div className="stat-value text-accent">{products.length}</div>
              </div>
              <div className="stat-card card">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value text-green">₹{parseFloat(stats.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
              </div>
            </div>

            <div className="card">
              <h3 className="mb-16">Recent Orders</h3>
              {orders.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(order => (
                        <tr key={order._id}>
                          <td className="font-mono text-sm text-dim">{order._id.slice(-8)}</td>
                          <td>{order.user.name}</td>
                          <td className="font-mono">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</td>
                          <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                          <td className="text-dim text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-dim">No orders yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Similar table styling for Orders, Quotations, and Products tabs */}
        {activeTab === "products" && (
          <div className="products-section">
            <div className="flex-between mb-16">
              <h3>Inventory Management</h3>
              <button className="btn btn-primary">+ Add Product</button>
            </div>
            
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Base Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td className="font-mono text-sm text-dim">{product.sku}</td>
                      <td style={{ fontWeight: 500 }}>{product.name}</td>
                      <td>{product.category || '-'}</td>
                      <td className="font-mono">₹{parseFloat(product.basePricePerUnit).toLocaleString('en-IN')}/{product.baseUnit}</td>
                      <td>{parseFloat(product.baseQuantity)}</td>
                      <td>
                        <div className="flex gap-8">
                          <button className="btn btn-secondary btn-sm">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other tabs follow same premium table design */}
        {activeTab === "orders" && (
           <div className="orders-section card" style={{ overflowX: 'auto' }}>
              <h3 className="mb-16">All Orders</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td className="font-mono text-sm text-dim">{order._id.slice(-8)}</td>
                      <td>
                        <div>{order.user.name}</div>
                        <div className="text-xs text-dim">{order.user.email}</div>
                      </td>
                      <td>{order.items.length}</td>
                      <td className="font-mono">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</td>
                      <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                      <td className="text-dim text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        )}

        {activeTab === "quotations" && (
           <div className="quotations-section card" style={{ overflowX: 'auto' }}>
              <h3 className="mb-16">Quotations</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map(quote => (
                    <tr key={quote._id}>
                      <td className="font-mono text-sm text-dim">{quote._id.slice(-8)}</td>
                      <td>
                        <div>{quote.user.name}</div>
                        <div className="text-xs text-dim">{quote.user.email}</div>
                      </td>
                      <td>{quote.items.length}</td>
                      <td className="font-mono">₹{parseFloat(quote.totalAmount).toLocaleString('en-IN')}</td>
                      <td><span className={`badge badge-${quote.status}`}>{quote.status}</span></td>
                      <td className="text-dim text-sm">{new Date(quote.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboardNew;
