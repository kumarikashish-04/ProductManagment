import { useEffect, useState } from "react";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  const placeOrder = async (productId) => {
    await API.post("/orders", {
      productId,
      quantity: 1,
    });

    alert("Order Placed");
  };

  return (
    <div>
      <h2>Products</h2>

      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          placeOrder={placeOrder}
        />
      ))}
    </div>
  );
};

export default Products;