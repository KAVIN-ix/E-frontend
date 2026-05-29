const BASE = '/api'
const token = () => localStorage.getItem('token')
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token()}`,
})

// AUTH
export const registerUser = (name, email, password, adminCode = '') =>
  fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, adminCode }),
  }).then(r => r.json())

export const loginUser = (email, password) =>
  fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(r => r.json())

// PRODUCTS
export const getProducts = (params = '') =>
  fetch(`${BASE}/products?${params}`).then(r => r.json())

export const addProduct = (data) =>
  fetch(`${BASE}/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(r => r.json())

export const updateProduct = (id, data) =>
  fetch(`${BASE}/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(r => r.json())

export const deleteProduct = (id) =>
  fetch(`${BASE}/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(r => r.json())

// ORDERS
export const placeOrder = (data) =>
  fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(r => r.json())

export const getMyOrders = () =>
  fetch(`${BASE}/orders`, { headers: authHeaders() }).then(r => r.json())

// ADMIN
export const getAdminStats = () =>
  fetch(`${BASE}/orders/admin/stats`, { headers: authHeaders() }).then(r => r.json())

export const getAdminOrders = () =>
  fetch(`${BASE}/orders/admin/all`, { headers: authHeaders() }).then(r => r.json())

export const getSalesData = (basis) =>
  fetch(`${BASE}/orders/admin/sales?basis=${basis}`, { headers: authHeaders() }).then(r => r.json())

export const updateOrderStatus = (id, status) =>
  fetch(`${BASE}/orders/admin/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  }).then(r => r.json())
