import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/Quotation.css";

const QuotationPage = () => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }
    const updated = [...cart];
    updated[index].quantity = parseFloat(newQuantity);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const updateItemUnit = (index, newUnit) => {
    const updated = [...cart];
    updated[index].unit = newUnit;
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (index) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const calculateTotal = () => {
    let subtotal = 0;
    let totalTax = 0;

    cart.forEach(item => {
      const product = item.product;
      const basePrice = parseFloat(product.basePricePerUnit);
      
      const unitFactors = { "g": 1, "kg": 1000, "mL": 1, "L": 1000, "item": 1 };
      const baseQuantity = item.quantity * (unitFactors[item.unit] / unitFactors[product.baseUnit]);
      const itemSubtotal = baseQuantity * basePrice;
      const itemTax = itemSubtotal * (product.taxPercentage / 100);

      subtotal += itemSubtotal;
      totalTax += itemTax;
    });

    return { subtotal, tax: totalTax, total: subtotal + totalTax };
  };

  const { subtotal, tax, total } = calculateTotal();

  const handleAction = async (isOrder) => {
    if (cart.length === 0) {
      setError("Cart is empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          unit: item.unit
        })),
        notes
      };

      const endpoint = isOrder ? "/orders" : "/quotations";
      const res = await API.post(endpoint, payload);
      
      setCart([]);
      localStorage.removeItem("cart");

      if (isOrder) {
        navigate(`/orders/${res.data.order._id}`);
      } else {
        navigate(`/quotations/${res.data.quotation._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to create ${isOrder ? 'order' : 'quotation'}`);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="page flex-center" style={{ minHeight: '60vh', flexDirection: 'column' }}>
        <div className="card text-center" style={{ padding: '60px 40px', maxWidth: '500px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <h2 className="mb-8">Your Cart is Empty</h2>
          <p className="text-dim mb-24">Add products to your cart to create a quotation or place an order.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="quotation-page">
      <div className="quotation-header">
        <h1>Quotation Request</h1>
        <p className="text-dim mt-8">Review your items and request a quotation or place a direct order.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="quotation-layout">
        <div className="cart-items-section">
          <div className="cart-items">
            <div className="cart-item" style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
              <div>Product</div>
              <div>Unit</div>
              <div>Qty</div>
              <div style={{ textAlign: 'right' }}>Total</div>
              <div></div>
            </div>
            
            {cart.map((item, index) => {
              const product = item.product;
              const basePrice = parseFloat(product.basePricePerUnit);
              const unitFactors = { "g": 1, "kg": 1000, "mL": 1, "L": 1000, "item": 1 };
              const baseQuantity = item.quantity * (unitFactors[item.unit] / unitFactors[product.baseUnit]);
              const itemTotal = baseQuantity * basePrice;

              return (
                <div key={index} className="cart-item">
                  <div className="item-info">
                    <span className="item-name">{product.name}</span>
                    <span className="item-sku">SKU: {product.sku}</span>
                  </div>
                  
                  <div className="item-unit">
                    <select
                      value={item.unit}
                      onChange={(e) => updateItemUnit(index, e.target.value)}
                    >
                      {product.supportedUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  <div className="item-quantity">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(index, e.target.value)}
                    />
                  </div>

                  <div className="item-total">
                    ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  <div>
                    <button onClick={() => removeItem(index)} className="remove-btn" title="Remove Item">
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="summary-section">
          <div className="summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Items Total:</span>
              <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            <div className="summary-row">
              <span>Estimated GST:</span>
              <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            <div className="summary-row total">
              <span>Grand Total:</span>
              <span className="text-accent">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="form-group mt-16">
              <label>Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. Required delivery by next week..."
                rows={3}
              />
            </div>

            <div className="summary-actions">
              <button 
                onClick={() => handleAction(false)} 
                disabled={loading}
                className="btn btn-secondary"
              >
                {loading ? "Processing..." : "Request Quotation"}
              </button>
              
              <button 
                onClick={() => handleAction(true)} 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "Processing..." : "Place Direct Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPage;
