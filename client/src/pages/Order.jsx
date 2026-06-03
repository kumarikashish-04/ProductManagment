import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Order = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAdmin } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error || !order) return <div className="page"><div className="alert alert-error">{error || "Order not found"}</div></div>;

  return (
    <div className="page">
      <div className="flex-between mb-24">
        <div>
          <Link to="/orders" className="text-accent mb-8" style={{ display: 'inline-block', textDecoration: 'none' }}>
            ← Back to Orders
          </Link>
          <h1 className="mb-8">Order Details</h1>
          <div className="text-dim">
            Order ID: <span className="font-mono text-white">{order._id}</span>
          </div>
        </div>
        <span className={`badge badge-${order.status}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
          {order.status.toUpperCase()}
        </span>
      </div>
      
      <div className="grid-3 mb-24">
        <div className="card">
          <h3 className="mb-16">Customer Details</h3>
          <p className="mb-4"><strong>{order.user.name}</strong></p>
          <p className="text-sm text-dim mb-4">{order.user.email}</p>
          {order.user.companyName && <p className="text-sm text-dim">{order.user.companyName}</p>}
        </div>
        <div className="card">
          <h3 className="mb-16">Order Info</h3>
          <p className="text-sm mb-4"><span className="text-dim">Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
          <p className="text-sm mb-4"><span className="text-dim">Items:</span> {order.items.length}</p>
          <p className="text-sm"><span className="text-dim">Total:</span> ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</p>
        </div>
        <div className="card">
          <h3 className="mb-16">Notes</h3>
          <p className="text-sm text-dim">{order.notes || "No additional notes provided."}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-16">Order Items</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 500 }}>{item.product.name}</td>
                  <td className="font-mono text-sm text-dim">{item.product.sku}</td>
                  <td className="font-mono">₹{parseFloat(item.pricePerUnit).toLocaleString('en-IN')}/{item.product.baseUnit}</td>
                  <td>{parseFloat(item.quantity)} {item.unit}</td>
                  <td className="font-mono">₹{parseFloat(item.subtotal).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 600, borderBottom: 'none' }}>Subtotal:</td>
                <td className="font-mono" style={{ borderBottom: 'none' }}>₹{parseFloat(order.subtotalAmount).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 600, borderBottom: 'none' }}>Tax:</td>
                <td className="font-mono" style={{ borderBottom: 'none' }}>₹{parseFloat(order.taxAmount).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700, fontSize: '18px', borderBottom: 'none', color: 'var(--white)' }}>Total:</td>
                <td className="font-mono text-accent" style={{ fontWeight: 700, fontSize: '18px', borderBottom: 'none' }}>₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Order;