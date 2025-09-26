"use client"

import { useState, useMemo, useEffect } from "react"
import { api } from "../lib/api"
import { getToken } from "../lib/auth"
import { Link } from "react-router-dom"

// Pure UI cart page using local state and mock data. No backend calls.
export default function CartPage() {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Keep selection in sync if items change
  useEffect(() => {
    setSelected((prev) => new Set(items.filter((it) => prev.has(it.id)).map((it) => it.id)))
  }, [items])

  // Load cart from backend when token exists
  useEffect(() => {
    const load = async () => {
      if (!getToken()) {
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        console.log("Loading cart...")
        const data = await api.getCart()
        console.log("Cart data:", data)
        setItems(
          data.map((row) => {
            const coverImage =
              typeof row.Book.coverImage === "string" ? JSON.parse(row.Book.coverImage) : row.Book.coverImage
            return {
              id: row.id,
              quantity: row.quantity,
              title: row.Book.title,
              author: row.Book.author,
              price: row.Book.price,
              cover: coverImage?.filename
                ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${coverImage.filename}`
                : "https://placehold.co/80x120",
            }
          }),
        )
      } catch (err) {
        console.error("Cart load error:", err)
        // keep empty UI
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + it.price * it.quantity, 0)
  }, [items])

  const selectedItems = useMemo(() => items.filter((it) => selected.has(it.id)), [items, selected])
  const selectedQty = useMemo(() => selectedItems.reduce((sum, it) => sum + it.quantity, 0), [selectedItems])
  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [selectedItems],
  )

  // Checkout modal state
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("online") // 'online' | 'cod'

  const updateQty = async (id, qty) => {
    if (qty < 1) return
    if (!getToken()) return
    try {
      await api.updateCartItem(id, qty)
      // Refresh list
      const data = await api.getCart()
      setItems(
        data.map((row) => {
          const coverImage =
            typeof row.Book.coverImage === "string" ? JSON.parse(row.Book.coverImage) : row.Book.coverImage
          return {
            id: row.id,
            quantity: row.quantity,
            title: row.Book.title,
            author: row.Book.author,
            price: row.Book.price,
            cover: coverImage?.filename
              ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${coverImage.filename}`
              : "https://placehold.co/80x120",
          }
        }),
      )
    } catch (err) {
      alert("Failed to update quantity: " + err.message)
    }
  }

  const removeItem = async (id) => {
    if (!getToken()) return
    try {
      await api.removeCartItem(id)
      setItems((prev) => prev.filter((it) => it.id !== id))
    } catch (err) {
      alert("Failed to remove item: " + err.message)
    }
  }

  const clearCart = async () => {
    if (!getToken()) return
    try {
      await api.clearCart()
      setItems([])
    } catch (err) {
      alert("Failed to clear cart: " + err.message)
    }
  }
  
  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  
  const allSelected = selected.size === items.length && items.length > 0
  
  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(items.map((it) => it.id)))
  }
  
  const removeSelected = async () => {
    if (selected.size === 0) return
    if (!getToken()) return

    try {
      // Remove each selected item from backend
      const promises = Array.from(selected).map((id) => api.removeCartItem(id))
      await Promise.all(promises)

      // Update local state
      setItems((prev) => prev.filter((it) => !selected.has(it.id)))
      setSelected(new Set())
    } catch (err) {
      alert("Failed to remove selected items: " + err.message)
    }
  }

  // Cart item component for better organization
  const CartItem = ({ item }) => (
    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <input 
          type="checkbox" 
          checked={selected.has(item.id)} 
          onChange={() => toggleOne(item.id)}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <img
          src={item.cover || "/placeholder.svg"}
          alt={item.title}
          className="w-20 h-28 object-cover rounded-md shadow-sm"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-lg text-gray-900 truncate">{item.title}</h3>
        <p className="text-sm text-gray-600">{item.author}</p>
        <p className="text-lg font-semibold text-indigo-700 mt-1">${item.price.toFixed(2)}</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
          <button 
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors" 
            onClick={() => updateQty(item.id, item.quantity - 1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQty(item.id, Number.parseInt(e.target.value || "1"))}
            className="w-12 text-center border-x border-gray-200 py-2 focus:outline-none focus:ring-0"
            min={1}
          />
          <button 
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors" 
            onClick={() => updateQty(item.id, item.quantity + 1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <button 
          className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50" 
          onClick={() => removeItem(item.id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Remove
        </button>
      </div>
    </div>
  );

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Cart Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Shopping Cart</h1>
          <div className="h-1 w-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded"></div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : !getToken() || items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 px-4">
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{getToken() ? "Your cart is empty" : "Please login to view your cart"}</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {getToken() 
                ? "Looks like you haven't added any books to your cart yet. Explore our collection and find your next favorite read!" 
                : "Sign in to your account to view your cart and continue shopping."}
            </p>
            <Link 
              to="/books" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                  <label className="inline-flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={allSelected} 
                      onChange={toggleAll}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-700">Select all items</span>
                  </label>
                  <button
                    onClick={removeSelected}
                    className="inline-flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={selected.size === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove selected ({selected.size})
                  </button>
                </div>
                
                <div className="divide-y divide-gray-100 p-4 space-y-4">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>

            <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Selected items</span>
                  <span className="font-medium">{selectedItems.length}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Selected quantity</span>
                  <span className="font-medium">{selectedQty}</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium text-gray-900">Subtotal</span>
                    <span className="font-bold text-indigo-700">${selectedTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Shipping calculated at checkout</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  disabled={selectedItems.length === 0}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  onClick={() => {
                    if (selectedItems.length > 0) setShowCheckout(true)
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Proceed to Checkout
                </button>
                
                <button 
                  onClick={clearCart} 
                  className="w-full border border-gray-300 py-3 px-4 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Cart
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-indigo-900 text-sm">Secure Checkout</h3>
                      <p className="text-xs text-indigo-700 mt-1">We protect your payment information using encryption to provide bank-level security.</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Checkout</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors" 
                onClick={() => setShowCheckout(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Choose payment method</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="font-medium text-gray-900">Online payment</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Pay securely with credit/debit card</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium text-gray-900">Cash on delivery</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Pay when you receive your order</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Subtotal</span>
                <span>${selectedTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Shipping</span>
                <span>$0.00</span>
              </div>
              <div className="flex items-center justify-between text-base font-medium text-gray-900 pt-2 border-t border-gray-200 mt-2">
                <span>Total ({selectedQty} items)</span>
                <span>${selectedTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                onClick={() => setShowCheckout(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={async () => {
                  try {
                    // Get selected cart item IDs
                    const selectedIds = Array.from(selected)
                    
                    // Create orders from selected cart items
                    await api.createOrderFromCart(selectedIds, paymentMethod)
                    
                    // Close modal and show success message
                    setShowCheckout(false)
                    
                    if (paymentMethod === "online") {
                      alert("Order placed successfully! Proceeding to online payment.")
                    } else {
                      alert("Order placed successfully! Cash on delivery selected.")
                    }
                    
                    // Refresh cart after order placement
                    const data = await api.getCart()
                    setItems(
                      data.map((row) => {
                        const coverImage =
                          typeof row.Book.coverImage === "string" ? JSON.parse(row.Book.coverImage) : row.Book.coverImage
                        return {
                          id: row.id,
                          quantity: row.quantity,
                          title: row.Book.title,
                          author: row.Book.author,
                          price: row.Book.price,
                          cover: coverImage?.filename
                            ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${coverImage.filename}`
                            : "https://placehold.co/80x120",
                        }
                      }),
                    )
                    
                    // Clear selection
                    setSelected(new Set())
                  } catch (err) {
                    alert("Failed to place order: " + (err.message || "Unknown error"))
                  }
                }}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
