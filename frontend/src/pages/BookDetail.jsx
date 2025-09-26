import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { getToken } from '../lib/auth'

export default function BookDetail() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await api.getBook(id)
        setBook(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const coverImage = useMemo(() => {
    if (!book) return null
    return typeof book.coverImage === 'string' ? JSON.parse(book.coverImage) : book.coverImage
  }, [book])

  const handleAddToCart = async () => {
    if (!getToken()) {
      alert('Please login to add to cart')
      return
    }
    try {
      console.log('Adding to cart:', { bookId: book.id, quantity })
      await api.addToCart({ bookId: book.id, quantity })
      console.log('Successfully added to cart')
      alert(`Added ${book.title} to cart!`)
    } catch (err) {
      console.error('Add to cart error:', err)
      alert('Failed to add to cart: ' + err.message)
    }
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
              <svg className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Book not found</h3>
              <p className="mt-1 text-sm text-gray-500">The book you're looking for doesn't exist or has been removed.</p>
              <div className="mt-6">
                <Link to="/books" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Back to Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link to="/books" className="ml-2 text-gray-500 hover:text-gray-700">Books</Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-gray-700 font-medium truncate">{book.title}</span>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Book Image */}
            <div className="relative p-6 flex items-center justify-center bg-gray-100">
              <div className="relative w-full max-w-md aspect-[3/4] overflow-hidden rounded-lg shadow-lg">
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${coverImage?.filename}`}
                  alt={book.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x600?text=No+Image' }}
                />
              </div>
            </div>

            {/* Book Details */}
            <div className="p-8 flex flex-col">
              {book.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-4">
                  {book.category}
                </span>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-lg text-gray-600 mb-6">by <span className="font-medium">{book.author}</span></p>
              
              <div className="mb-6">
                <p className="text-3xl font-bold text-indigo-600">${parseFloat(book.price).toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {book.stock > 0 ? (
                    <span className="text-green-600">In Stock ({book.stock} available)</span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </p>
              </div>
              
              {book.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              )}
              
              <div className="mt-auto">
                <div className="flex items-center mb-6">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mr-4">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button 
                      type="button" 
                      className="p-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                      onClick={decrementQuantity}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 text-center border-0 focus:ring-0"
                    />
                    <button 
                      type="button" 
                      className="p-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                      onClick={incrementQuantity}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    disabled={book.stock <= 0}
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </span>
                  </button>
                  <Link 
                    to="/books" 
                    className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Back to Books
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


