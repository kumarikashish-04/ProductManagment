import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders");
        setOrders(res.data);
      } catch (err) {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="page">
      <h1 className="mb-8">Your Orders</h1>
      <p className="text-dim mb-24">View and track all your past and current orders.</p>
      
      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 40px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h2 className="mb-8">No Orders Yet</h2>
          <p className="text-dim mb-24">You haven't placed any orders yet. Browse our inventory to get started.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="font-mono text-sm text-dim">{order._id.slice(-8)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.items.length} items</td>
                  <td className="font-mono">₹{parseFloat(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                  <td>
                    <Link to={`/order/${order._id}`} className="btn btn-secondary btn-sm">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;