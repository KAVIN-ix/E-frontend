import { useState, useEffect } from 'react'
import {
  getAdminStats,
  getAdminOrders,
  getSalesData,
  updateOrderStatus,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../utils/api'
import './AdminPanel.css'

// ── helpers ──────────────────────────────────────────────────
const STATUS_COLORS = {
  Pending:    { bg: '#fef3c7', color: '#d97706' },
  Processing: { bg: '#dbeafe', color: '#2563eb' },
  Shipped:    { bg: '#ede9fe', color: '#7c3aed' },
  Delivered:  { bg: '#d1fae5', color: '#059669' },
}

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered']
const CATEGORIES = ['Electronics', 'Clothing', 'Sports', 'Home', 'Accessories']

const EMPTY_FORM = {
  name: '', description: '', price: '',
  category: 'Electronics', image: '', stock: '', rating: '4',
}

// ── sub-components ───────────────────────────────────────────

function StatCards({ stats, loading }) {
  if (loading) return <div className="admin-loading">Loading stats...</div>
  return (
    <div className="stats-grid">
      <div className="stat-card stat-card--total">
        <div className="stat-card__icon">📦</div>
        <div className="stat-card__value">{stats.total}</div>
        <div className="stat-card__label">Total Orders</div>
      </div>
      <div className="stat-card stat-card--pending">
        <div className="stat-card__icon">🕐</div>
        <div className="stat-card__value">{stats.pending}</div>
        <div className="stat-card__label">Pending</div>
      </div>
      <div className="stat-card stat-card--processing">
        <div className="stat-card__icon">⚙️</div>
        <div className="stat-card__value">{stats.processing}</div>
        <div className="stat-card__label">Processing</div>
      </div>
      <div className="stat-card stat-card--shipped">
        <div className="stat-card__icon">🚚</div>
        <div className="stat-card__value">{stats.shipped}</div>
        <div className="stat-card__label">Shipped</div>
      </div>
      <div className="stat-card stat-card--delivered">
        <div className="stat-card__icon">✅</div>
        <div className="stat-card__value">{stats.delivered}</div>
        <div className="stat-card__label">Delivered</div>
      </div>
      <div className="stat-card stat-card--revenue">
        <div className="stat-card__icon">💰</div>
        <div className="stat-card__value">₹{(stats.revenue || 0).toLocaleString()}</div>
        <div className="stat-card__label">Total Revenue</div>
      </div>
    </div>
  )
}

// ── Sales Graph ──────────────────────────────────────────────
function SalesGraph() {
  const [basis, setBasis] = useState('monthly')
  const [data, setData]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSales()
  }, [basis])

  const loadSales = async () => {
    setLoading(true)
    try {
      const result = await getSalesData(basis)
      setData(Array.isArray(result) ? result : [])
    } catch {
      setData([])
    }
    setLoading(false)
  }

  // find max sales to calculate bar heights
  const maxSales = Math.max(...data.map(d => d.sales), 1)

  return (
    <div className="sales-card">
      <div className="sales-header">
        <h3>📈 Sales Overview</h3>
        <div className="basis-tabs">
          {['daily', 'monthly', 'yearly'].map(b => (
            <button
              key={b}
              className={`basis-tab ${basis === b ? 'active' : ''}`}
              onClick={() => setBasis(b)}
            >
              {b.charAt(0).toUpperCase() + b.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="chart-empty">Loading chart...</div>
      ) : data.length === 0 ? (
        <div className="chart-empty">
          No sales data yet. Place some orders to see the graph.
        </div>
      ) : (
        <>
          <div className="bar-chart">
            {data.map((item, i) => {
              const heightPct = (item.sales / maxSales) * 160
              return (
                <div className="bar-col" key={i}>
                  <span className="bar-value">
                    ₹{item.sales >= 1000 ? (item.sales / 1000).toFixed(1) + 'k' : item.sales}
                  </span>
                  <div
                    className="bar-fill"
                    style={{ height: `${heightPct}px` }}
                    title={`Sales: ₹${item.sales.toLocaleString()} | Orders: ${item.orders}`}
                  >
                    {item.orders > 0 && <div className="bar-orders-dot" title={`${item.orders} orders`} />}
                  </div>
                  <span className="bar-label">{item.label}</span>
                </div>
              )
            })}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#4f46e5' }} />
              <span>Sales (₹)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#f59e0b', borderRadius: '50%' }} />
              <span>Orders count (dot)</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Products Management ──────────────────────────────────────
function ProductsManager() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formErr, setFormErr]     = useState('')
  const [saving, setSaving]       = useState(false)

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true)
    const data = await getProducts()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }))
    setFormErr('')
  }

  const handleEdit = (product) => {
    setForm({
      name:        product.name,
      description: product.description,
      price:       product.price,
      category:    product.category,
      image:       product.image,
      stock:       product.stock,
      rating:      product.rating,
    })
    setEditingId(product._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErr('')
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return setFormErr('Product name is required')
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      return setFormErr('Enter a valid price')
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0)
      return setFormErr('Enter a valid stock count')

    setSaving(true)
    const payload = {
      ...form,
      price:  Number(form.price),
      stock:  Number(form.stock),
      rating: Number(form.rating),
    }

    try {
      if (editingId) {
        const updated = await updateProduct(editingId, payload)
        if (updated._id) {
          setProducts(prev => prev.map(p => p._id === editingId ? updated : p))
          handleCancel()
        } else {
          setFormErr(updated.message || 'Update failed')
        }
      } else {
        const created = await addProduct(payload)
        if (created._id) {
          setProducts(prev => [created, ...prev])
          handleCancel()
        } else {
          setFormErr(created.message || 'Failed to add product')
        }
      }
    } catch {
      setFormErr('Server error')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    setProducts(prev => prev.filter(p => p._id !== id))
    await deleteProduct(id)
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-section-title" style={{ margin: 0 }}>
          🛒 Products ({products.length})
        </h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY_FORM) }}>
          {showForm && !editingId ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="product-form-card">
          <h4>{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h4>
          <div className="product-form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input className="form-input" placeholder="e.g. Wireless Headphones"
                value={form.name} onChange={e => handleChange('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={form.category}
                onChange={e => handleChange('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input className="form-input" type="number" placeholder="999"
                value={form.price} onChange={e => handleChange('price', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Stock *</label>
              <input className="form-input" type="number" placeholder="10"
                value={form.stock} onChange={e => handleChange('stock', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Rating (1–5)</label>
              <select className="form-input" value={form.rating}
                onChange={e => handleChange('rating', e.target.value)}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input className="form-input" placeholder="https://..."
                value={form.image} onChange={e => handleChange('image', e.target.value)} />
            </div>
            <div className="form-group full">
              <label>Description</label>
              <input className="form-input" placeholder="Short product description"
                value={form.description} onChange={e => handleChange('description', e.target.value)} />
            </div>
          </div>

          {formErr && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>⚠ {formErr}</p>}

          <div className="product-form-actions">
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
            </button>
            <button className="btn btn-outline" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="admin-loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="admin-loading">No products yet. Add one above!</div>
      ) : (
        <div className="products-table">
          <div className="table-header">
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Rating</span>
            <span>Actions</span>
          </div>
          {products.map(p => (
            <div className="table-row" key={p._id}>
              <img
                src={p.image || 'https://via.placeholder.com/44?text=?'}
                alt={p.name}
                className="table-img"
              />
              <span className="table-name">{p.name}</span>
              <span className="table-cat">{p.category}</span>
              <span className="table-price">₹{p.price.toLocaleString()}</span>
              <span className="table-stock">{p.stock}</span>
              <span>{'★'.repeat(p.rating)}</span>
              <div className="table-actions">
                <button className="btn-icon edit" onClick={() => handleEdit(p)}>✏️</button>
                <button className="btn-icon delete" onClick={() => handleDelete(p._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Orders Management ────────────────────────────────────────
function OrdersManager() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [filterStatus, setFilter] = useState('All')

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await getAdminOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setOrders([])
    }
    setLoading(false)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    // optimistic update
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
    await updateOrderStatus(orderId, newStatus)
  }

  const filtered = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-section-title" style={{ margin: 0 }}>
          📋 All Orders ({filtered.length})
        </h2>
        {/* filter by status */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', ...STATUSES].map(s => (
            <button
              key={s}
              className={`basis-tab ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="admin-loading">No orders found.</div>
      ) : (
        <div className="orders-table">
          <div className="orders-table-header">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Amount</span>
            <span>Current Status</span>
            <span>Update Status</span>
          </div>
          {filtered.map(order => {
            const sc = STATUS_COLORS[order.status] || {}
            return (
              <div className="orders-table-row" key={order._id}>
                <div className="order-id-cell">
                  #{order._id.slice(-8).toUpperCase()}
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div>
                  <div className="order-user-cell">{order.user?.name || 'User'}</div>
                  <div className="order-user-email">{order.user?.email || ''}</div>
                </div>

                <div className="order-amount-cell">₹{order.totalAmount.toLocaleString()}</div>

                <div>
                  <span
                    className="status-badge"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    {order.status}
                  </span>
                </div>

                <div>
                  <select
                    className="status-select"
                    value={order.status}
                    onChange={e => handleStatusChange(order._id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main Admin Panel ─────────────────────────────────────────
function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats]         = useState({})
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (activeTab === 'dashboard') loadStats()
  }, [activeTab])

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const data = await getAdminStats()
      setStats(data)
    } catch {
      setStats({})
    }
    setStatsLoading(false)
  }

  const tabs = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'products',  icon: '🛒', label: 'Products' },
    { key: 'orders',    icon: '📋', label: 'Orders' },
  ]

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <p className="sidebar-title">Admin Panel</p>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`sidebar-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="sidebar-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </aside>

      {/* Content */}
      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <>
            <h2 className="admin-section-title">📊 Dashboard</h2>
            <StatCards stats={stats} loading={statsLoading} />
            <SalesGraph />
          </>
        )}
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'orders'   && <OrdersManager />}
      </div>
    </div>
  )
}

export default AdminPanel
