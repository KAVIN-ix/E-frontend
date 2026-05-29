import { useState } from 'react'
import { placeOrder } from '../utils/api'
import './Cart.css'

function CartPage({ cartItems, onRemove, onUpdateQty, onClearCart, user, setPage }) {
  const [address, setAddress]   = useState('')
  const [addrErr, setAddrErr]   = useState('')
  const [placing, setPlacing]   = useState(false)
  const [success, setSuccess]   = useState(false)

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)

  const handlePlaceOrder = async () => {
    if (!user) {
      setPage('auth')
      return
    }
    if (!address.trim()) {
      setAddrErr('Please enter your delivery address')
      return
    }
    setAddrErr('')
    setPlacing(true)

    const orderData = {
      items: cartItems.map(i => ({
        product: i._id,
        name: i.name,
        price: i.price,
        quantity: i.qty,
        image: i.image,
      })),
      totalAmount: total,
      address: address.trim(),
    }

    try {
      const result = await placeOrder(orderData)
      if (result._id) {
        setSuccess(true)
        onClearCart()
      } else {
        setAddrErr(result.message || 'Failed to place order')
      }
    } catch {
      setAddrErr('Server error. Try again.')
    }
    setPlacing(false)
  }

  if (success) {
    return (
      <div className="cart-page">
        <div className="order-success card">
          <div className="success-icon">✅</div>
          <h2>Order Placed!</h2>
          <p>Your order has been placed successfully. We'll process it shortly.</p>
          <div className="success-btns">
            <button className="btn btn-primary" onClick={() => setPage('orders')}>View My Orders</button>
            <button className="btn btn-outline" onClick={() => setPage('home')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h2 className="cart-title">Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="cart-empty card">
          <div className="empty-icon">🛒</div>
          <p>Your cart is empty</p>
          <button className="btn btn-primary" onClick={() => setPage('home')}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* items list */}
          <div className="cart-items">
            {cartItems.map(item => (
              <div className="cart-item card" key={item._id}>
                <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} className="cart-item-img" />

                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="cart-item-price">₹{item.price.toLocaleString()}</p>
                </div>

                <div className="cart-item-right">
                  <div className="qty-control">
                    <button onClick={() => onUpdateQty(item._id, item.qty - 1)} disabled={item.qty <= 1}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => onUpdateQty(item._id, item.qty + 1)}>+</button>
                  </div>
                  <p className="cart-item-subtotal">₹{(item.price * item.qty).toLocaleString()}</p>
                  <button className="remove-btn" onClick={() => onRemove(item._id)}>✕ Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* order summary */}
          <div className="order-summary card">
            <h3>Order Summary</h3>

            <div className="summary-rows">
              {cartItems.map(item => (
                <div className="summary-row" key={item._id}>
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            <div className="address-section">
              <label>Delivery Address</label>
              <textarea
                className="form-input address-input"
                placeholder="Enter full delivery address..."
                value={address}
                onChange={e => { setAddress(e.target.value); setAddrErr('') }}
                rows={3}
              />
              {addrErr && <p className="addr-error">⚠ {addrErr}</p>}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? 'Placing Order...' : user ? 'Place Order' : 'Login to Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
