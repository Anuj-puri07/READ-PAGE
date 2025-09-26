import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { getToken } from '../lib/auth'

export default function Books() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await api.getBooks();
        setBooks(data);
        setFilteredBooks(data);
        
        // Extract unique categories from books
        const uniqueCategories = [...new Set(data.map(book => book.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Derived filtered list by category and search
  const visibleBooks = useMemo(() => {
    const list = selectedCategory === 'all'
      ? books
      : books.filter(book => book.category === selectedCategory);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((b) => {
      const title = String(b.title || '').toLowerCase();
      const author = String(b.author || '').toLowerCase();
      const price = String(b.price ?? '').toLowerCase();
      return title.includes(q) || author.includes(q) || price.includes(q);
    });
  }, [books, selectedCategory, search]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Discover Books
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            Explore our collection of books across various categories
          </p>
        </div>
        
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Filter by Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Search Books</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                  placeholder="Search by title, author, or price"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading, Error, and Empty States */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
              <svg className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Something went wrong</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
            </div>
          </div>
        ) : visibleBooks.length === 0 ? (
          <div className="text-center py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
              <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No books found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleBooks.map((book) => {
              // Parse coverImage if it's a string
              const coverImage = typeof book.coverImage === 'string' 
                ? JSON.parse(book.coverImage) 
                : book.coverImage;
              
              return (
                <div key={book.id} className="group relative bg-white rounded-2xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${coverImage?.filename}`} 
                      alt={book.title} 
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x600?text=No+Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{book.title}</h3>
                      {book.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {book.category}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">by <span className="font-medium">{book.author}</span></p>
                    
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-lg font-bold text-indigo-600">NPR {parseFloat(book.price).toFixed(2)}</p>
                      
                      <div className="flex space-x-2">
                        <Link 
                          to={`/books/${book.id}`} 
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-indigo-600 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          Details
                        </Link>
                        
                        <button
                          onClick={async (e) => {
                            e.preventDefault()
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
                          className="inline-flex items-center justify-center px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


