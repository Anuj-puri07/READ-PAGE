const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const message = data?.message || data?.errors?.[0]?.msg || 'Request failed'
    const error = new Error(message)
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}

export const api = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  verifyEmail: (token) => request(`/api/auth/verify-email?token=${token}`),
  forgotPassword: (payload) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  getProfile: () => request('/api/auth/profile', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }),
  updateProfile: (payload) =>
  request('/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(payload)
  }),

  changePassword: (payload) => request('/api/auth/change-password', { 
    method: 'PUT', 
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify(payload) 
  }),
  uploadProfilePhoto: (formData) => {
    return fetch(`${BASE_URL}/api/auth/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(async (res) => {
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) {
        const message = data?.message || data?.errors?.[0]?.msg || 'Request failed'
        const error = new Error(message)
        error.status = res.status
        error.data = data
        throw error
      }
      return data
    })
  },
  
  // Book operations
  getBooks: () => request('/api/books'),
  getBook: (id) => request(`/api/books/${id}`),
  createBook: (formData) => {
    return fetch(`${BASE_URL}/api/books`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData // Don't set Content-Type for FormData
    }).then(async (res) => {
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) {
        const message = data?.message || data?.errors?.[0]?.msg || 'Request failed'
        const error = new Error(message)
        error.status = res.status
        error.data = data
        throw error
      }
      return data
    })
  },
  updateBook: (id, formData) => {
    return fetch(`${BASE_URL}/api/books/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData // Don't set Content-Type for FormData
    }).then(async (res) => {
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) {
        const message = data?.message || data?.errors?.[0]?.msg || 'Request failed'
        const error = new Error(message)
        error.status = res.status
        error.data = data
        throw error
      }
      return data
    })
  },
  deleteBook: (id) => request(`/api/books/${id}`, { 
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),

  // Cart operations (auth required)
  getCart: () => request('/api/cart', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }),
  addToCart: ({ bookId, quantity = 1 }) => request('/api/cart', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bookId, quantity })
  }),
  updateCartItem: (id, quantity) => request(`/api/cart/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantity })
  }),
  removeCartItem: (id) => request(`/api/cart/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }),
  clearCart: () => request('/api/cart', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }),

  
  // Order operations
  createOrderFromCart: (cartItemIds, paymentMethod) => request('/api/orders/from-cart', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cartItemIds, paymentMethod })
  }),
  getOrders: () => request('/api/orders', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }),
  updateOrderStatus: (id, statuses) => request(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(statuses)
  }),
  
  // Payment operations
  verifyKhaltiPayment: (payload) => request('/api/payments/khalti/verify', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }),
  getPaymentStatus: (orderId) => request(`/api/payments/${orderId}/status`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }),

  // Customer operations (admin only)
  getCustomers: (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.search) queryParams.append('search', params.search)
    
    const queryString = queryParams.toString()
    const url = `/api/auth/customers${queryString ? `?${queryString}` : ''}`
    
    return request(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
  },
}

export default api


