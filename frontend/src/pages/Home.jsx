import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { getToken } from '../lib/auth'

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await api.getBooks();
        // Sort by createdAt in descending order (newest first) and take first 3
        const recentBooks = [...data].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 3);
        setBooks(recentBooks);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden mb-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjxwYXRoIGQ9Ik0xNiAxNmMyLjIgMCA0IDEuOCA0IDRzLTEuOCA0LTQgNC00LTEuOC00LTQgMS44LTQgNC00em0xNiAwYzIuMiAwIDQgMS44IDQgNHMtMS44IDQtNCA0LTQtMS44LTQtNCAxLjgtNCA0LTR6bTE2IDBjMi4yIDAgNCAxLjggNCA0cy0xLjggNC00IDQtNC0xLjgtNC00IDEuOC00IDQtNHpNMTYgMzJjMi4yIDAgNCAxLjggNCA0cy0xLjggNC00IDQtNC0xLjgtNC00IDEuOC00IDQtNHptMTYgMGMyLjIgMCA0IDEuOCA0IDRzLTEuOCA0LTQgNC00LTEuOC00LTQgMS44LTQgNC00eiIvPjxwYXRoIGQ9Ik0xNiA0OGMyLjIgMCA0IDEuOCA0IDRzLTEuOCA0LTQgNC00LTEuOC00LTQgMS44LTQgNC00em0xNiAwYzIuMiAwIDQgMS44IDQgNHMtMS44IDQtNCA0LTQtMS44LTQtNCAxLjgtNCA0LTR6bTE2IDBjMi4yIDAgNCAxLjggNCA0cy0xLjggNC00IDQtNC0xLjgtNC00IDEuOC00IDQtNHpNMCAwYzIuMiAwIDQgMS44IDQgNHMtMS44IDQtNCA0LTQtMS44LTQtNCAxLjgtNCA0LTR6bTE2IDBjMi4yIDAgNCAxLjggNCA0cy0xLjggNC00IDQtNC0xLjgtNC00IDEuOC00IDQtNHptMTYgMGMyLjIgMCA0IDEuOCA0IDRzLTEuOCA0LTQgNC00LTEuOC00LTQgMS44LTQgNC00em0xNiAwYzIuMiAwIDQgMS44IDQgNHMtMS44IDQtNCA0LTQtMS44LTQtNCAxLjgtNCA0LTR6bTE2IDBjMi4yIDAgNCAxLjggNCA0cy0xLjggNC00IDQtNC0xLjgtNC00IDEuOC00IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        <div className="relative flex flex-col md:flex-row items-center justify-between px-6 py-12 md:py-16 md:px-10">
          <div className="text-center md:text-left md:max-w-xl mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Discover Your Next Favorite Book</h1>
            <p className="text-indigo-100 text-lg mb-6">Curated collection of books for developers, designers, and tech enthusiasts.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/books" className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-full hover:bg-indigo-50 transition-colors duration-200 text-center">
                Browse Collection
              </Link>
              <Link to="/about" className="px-6 py-3 bg-indigo-700 text-white font-medium rounded-full hover:bg-indigo-800 transition-colors duration-200 text-center">
                Learn More
              </Link>
            </div>
          </div>
          <div className="hidden md:block relative">
            <svg className="w-64 h-64 text-white/20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Curated Selection</h3>
            <p className="text-gray-600">Handpicked books that are relevant to modern technology and design trends.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Shopping</h3>
            <p className="text-gray-600">Simple checkout process with secure payment options for a seamless experience.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Quick shipping options to get your favorite books delivered to your doorstep.</p>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
          <Link className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 group" to="/books">
            View all
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading books...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => {
              const coverImage = typeof book.coverImage === 'string'
                ? JSON.parse(book.coverImage)
                : book.coverImage
              const imageUrl = coverImage?.filename
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${coverImage.filename}`
                : 'https://placehold.co/400x600?text=No+Image'

              return (
                <li key={book.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                  <div className="flex flex-col h-full">
                    <Link to={`/books/${book.id}`} className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <span className="px-4 py-2 bg-white/90 rounded-full text-sm font-medium text-gray-900">View Details</span>
                      </div>
                      <img
                        src={imageUrl}
                        alt={book.title}
                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x600?text=No+Image' }}
                      />
                    </Link>
                    <div className="p-6 flex flex-col gap-2 flex-grow">
                      <Link to={`/books/${book.id}`} className="block">
                        <h3 className="font-semibold text-lg group-hover:text-indigo-600 transition-colors duration-200">{book.title}</h3>
                        <p className="text-gray-600">{book.author}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="font-medium text-lg">${parseFloat(book.price).toFixed(2)}</p>
                          {book.category && (
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{book.category}</span>
                          )}
                        </div>
                      </Link>
                      <div className="mt-auto pt-4">
                        <button
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                          onClick={async () => {
                            if (!getToken()) {
                              alert('Please login to add to cart')
                              return
                            }
                            try {
                              console.log('Adding to cart:', { bookId: book.id, quantity: 1 })
                              await api.addToCart({ bookId: book.id, quantity: 1 })
                              console.log('Successfully added to cart')
                              alert(`Added ${book.title} to cart!`)
                            } catch (err) {
                              console.error('Add to cart error:', err)
                              alert('Failed to add to cart: ' + err.message)
                            }
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to explore more books?</h2>
        <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">Browse our complete collection and find your next favorite read.</p>
        <Link to="/books" className="inline-block px-8 py-3 bg-white text-indigo-600 font-medium rounded-full hover:bg-indigo-50 transition-colors duration-200">
          Browse All Books
        </Link>
      </section>
    </main>
  )
}


