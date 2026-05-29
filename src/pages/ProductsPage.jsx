import { useState, useEffect } from 'react'
import { getProducts } from '../utils/api'
import './Products.css'

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Sports', 'Home', 'Accessories']

function ProductsPage({ onAddToCart, cartItems }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    loadProducts()
  }, [category])

  const loadProducts = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category !== 'All') params.set('category', category)
    if (search) params.set('search', search)
    const data = await getProducts(params.toString())
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadProducts()
  }

  const cartIds = cartItems.map(i => i._id)

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

  return (
    <div className="products-page">
      <div className="products-top">
        <div className="products-top-left">
          <h2>Our Products</h2>
          <p className="products-count">{products.length} items found</p>
        </div>

        {/* search bar */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="form-input search-input"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
      </div>

      {/* category tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-tab ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-box">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-box">
          <p>No products available yet.</p>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '6px' }}>
            Admin can add products from the ⚙️ Admin Panel.
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => {
            const inCart = cartIds.includes(product._id)
            return (
              <div className="product-card card" key={product._id}>
                <div className="product-img-wrap">
                  <img
                    src={product.image || 'https://via.placeholder.com/300x200?text=Product'}
                    alt={product.name}
                    className="product-img"
                  />
                  <span className="product-category-tag">{product.category}</span>
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>

                  <div className="product-rating">
                    <span className="stars">{renderStars(product.rating)}</span>
                  </div>

                  <div className="product-footer">
                    <span className="product-price">₹{product.price.toLocaleString()}</span>
                    <button
                      className={`btn btn-sm ${inCart ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => onAddToCart(product)}
                      disabled={inCart}
                    >
                      {inCart ? '✓ Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProductsPage