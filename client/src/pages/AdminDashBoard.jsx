import { useEffect, useState } from "react";
import API from "../api/axios";

const AdminDashboard = () => {
  const [products, setProducts] =
    useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  const addProduct = async () => {
    await API.post(
      "/products",
      form
    );

    fetchProducts();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <input
        placeholder="Name"
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value,
          })
        }
      />

      <input
        placeholder="Price"
        onChange={(e) =>
          setForm({
            ...form,
            price: e.target.value,
          })
        }
      />

      <input
        placeholder="Stock"
        onChange={(e) =>
          setForm({
            ...form,
            stock: e.target.value,
          })
        }
      />

      <button onClick={addProduct}>
        Add Product
      </button>

      <hr />

      {products.map((p) => (
        <div key={p._id}>
          {p.name} - ₹{p.price}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;