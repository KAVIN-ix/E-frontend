import { useState, useEffect } from 'react'
import { getMyOrders } from '../utils/api'
import './Orders.css'

function OrdersPage({ user, setPage }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setPage('auth'); return }
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await getMyOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setOrders([])
    }
    setLoading(false)
  }

  const statusColor = (status) => {
    if (status === 'Delivered')  return '#10b981'
    if (status === 'Shipped')    return '#3b82f6'
    if (status === 'Processing') return '#f59e0b'
    return '#6b7280'  // Pending
  }

  return (
    <div className="orders-page">
      <h2 className="orders-title">My Orders</h2>

      {loading ? (
        <p className="loading-msg">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="orders-empty card">
          <div className="empty-icon">📦</div>
          <p>You haven't placed any orders yet.</p>
          <button className="btn btn-primary" onClick={() => setPage('home')}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div className="order-card card" key={order._id}>
              <div className="order-header">
                <div>
                  <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <span
                  className="order-status"
                  style={{ background: statusColor(order.status) + '20', color: statusColor(order.status), border: `1px solid ${statusColor(order.status)}50` }}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, i) => (
                  <div className="order-item-row" key={i}>
                    {item.image && <img src={item.image} alt={item.name} className="order-item-img" />}
                    <span className="order-item-name">{item.name}</span>
                    <span className="order-item-qty">× {item.quantity}</span>
                    <span className="order-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <span className="order-address">📍 {order.address}</span>
                <span className="order-total">Total: <strong>₹{order.totalAmount.toLocaleString()}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
