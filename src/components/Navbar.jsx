import './Navbar.css'

function Navbar({ user, cartCount, page, setPage, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => setPage('home')}>
          🛍️ ShopEase
        </div>

        <div className="navbar-links">
          <button className={`nav-link ${page === 'home' ? 'active' : ''}`} onClick={() => setPage('home')}>
            Products
          </button>
          {user && (
            <button className={`nav-link ${page === 'orders' ? 'active' : ''}`} onClick={() => setPage('orders')}>
              My Orders
            </button>
          )}
          {user?.isAdmin && (
            <button className={`nav-link admin-link ${page === 'admin' ? 'active' : ''}`} onClick={() => setPage('admin')}>
              ⚙️ Admin
            </button>
          )}
        </div>

        <div className="navbar-right">
          <button className="cart-btn" onClick={() => setPage('cart')}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {user ? (
            <div className="user-menu">
              <span className="user-name">
                Hi, {user.name.split(' ')[0]}
                {user.isAdmin && <span className="admin-tag">Admin</span>}
              </span>
              <button className="btn btn-outline btn-sm" onClick={onLogout}>Logout</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setPage('auth')}>Login</button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
