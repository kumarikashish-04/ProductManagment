import { useState } from "react";

const OrderForm = ({ onSubmit }) => {
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(quantity);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={quantity}
        min="1"
        onChange={(e) =>
          setQuantity(e.target.value)
        }
      />

      <button type="submit">
        Place Order
      </button>
    </form>
  );
};

export default OrderForm;