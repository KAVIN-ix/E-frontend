import { useState } from 'react'
import Navbar       from './components/Navbar'
import AuthPage     from './pages/AuthPage'
import ProductsPage from './pages/ProductsPage'
import CartPage     from './pages/CartPage'
import OrdersPage   from './pages/OrdersPage'
import AdminPanel   from './pages/AdminPanel'

function App() {
  const saved = localStorage.getItem('user')
  const [user, setUser] = useState(saved ? JSON.parse(saved) : null)
  const [page, setPage] = useState('home')
  const [cart, setCart] = useState([])

  const handleLogin = (userData) => {
    setUser(userData)
    // redirect admin straight to admin panel
    setPage(userData.isAdmin ? 'admin' : 'home')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setPage('home')
  }

  const addToCart = (product) => {
    const exists = cart.find(i => i._id === product._id)
    if (exists) return
    setCart([...cart, { ...product, qty: 1 }])
  }

  const removeFromCart = (id) => setCart(cart.filter(i => i._id !== id))

  const updateQty = (id, qty) => {
    if (qty < 1) return
    setCart(cart.map(i => i._id === id ? { ...i, qty } : i))
  }

  const clearCart = () => setCart([])

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  const renderPage = () => {
    switch (page) {
      case 'auth':
        return <AuthPage onLogin={handleLogin} />
      case 'cart':
        return <CartPage cartItems={cart} onRemove={removeFromCart} onUpdateQty={updateQty} onClearCart={clearCart} user={user} setPage={setPage} />
      case 'orders':
        return <OrdersPage user={user} setPage={setPage} />
      case 'admin':
        return user?.isAdmin ? <AdminPanel /> : <ProductsPage onAddToCart={addToCart} cartItems={cart} />
      default:
        return <ProductsPage onAddToCart={addToCart} cartItems={cart} />
    }
  }

  return (
    <>
      <Navbar user={user} cartCount={cartCount} page={page} setPage={setPage} onLogout={handleLogout} />
      <main>{renderPage()}</main>
    </>
  )
}

export default App
