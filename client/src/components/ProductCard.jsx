const ProductCard = ({ product, placeOrder }) => {
    return (
      <div
        style={{
          border: "1px solid gray",
          padding: "10px",
          margin: "10px",
        }}
      >
        <h3>{product.name}</h3>
  
        <p>Price: ₹{product.price}</p>
  
        <p>Stock: {product.stock}</p>
  
        <button onClick={() => placeOrder(product._id)}>
          Order
        </button>
      </div>
    );
  };
  
  export default ProductCard;