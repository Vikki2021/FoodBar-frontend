import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Orders = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const flattenArray = (arr) =>
    arr.reduce(
      (acc, val) =>
        Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val),
      []
    );

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      let email;
      const storedUser = localStorage.getItem("user");
      try {
        const parsed = JSON.parse(storedUser);
        email = parsed?.email || parsed;
      } catch {
        email = storedUser;
      }

      const response = await axios.get(
        "http://foodbar-backend-3.onrender.com/api/auth/orders",
        {
          params: { email },
        }
      );

      const orders = Array.isArray(response.data)
        ? response.data
        : response.data.orders;

      const flattened = orders.flatMap((order) => {
        const flatData = flattenArray(order.order_data);
        return flatData.map((item) => ({
          orderId: order._id,
          product: item.name || item.product || "N/A",
          quantity: item.quantity || 0,
          size: item.size || "N/A",
          price: item.price || 0,
          status: item.status || "Pending",
          date: item.Order_date || "Unknown",
        }));
      });

      setItems(flattened);
    } catch (e) {
      setError("Unable to load orders, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearOrders = () => {
    setItems([]);
    setError(null);
  };

  return (
    <div className="container mt-4">
      <div className="mb-3">
        <Link to="/" className="btn btn-link p-0">
          ← Home
        </Link>
      </div>

      <h3>Your Orders</h3>

      <div className="mb-3">
        <button
          className="btn btn-primary me-2"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? "Loading..." : "Check Orders"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={clearOrders}
          disabled={loading}
        >
          Clear Orders
        </button>
      </div>

      {error && <div className="text-danger mb-3">{error}</div>}

      {items.length > 0 ? (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Order ID</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Size</th>
              <th>Price</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.orderId}</td>
                <td>{item.product}</td>
                <td>{item.quantity}</td>
                <td>{item.size}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.status}</td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p className="text-muted">No orders to display.</p>
      )}
    </div>
  );
};

export default Orders;
