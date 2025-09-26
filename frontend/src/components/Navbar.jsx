import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getUser, getToken, clearAuth } from '../lib/auth'

export default function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setUser(getUser())
    setLoggedIn(Boolean(getToken()))
    
    // Handle storage events (for changes in other tabs)
    const onStorage = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        setUser(getUser())
        setLoggedIn(Boolean(getToken()))
      }
    }
    
    // Handle custom auth-change event (for changes in current tab)
    const onAuthChange = () => {
      setUser(getUser())
      setLoggedIn(Boolean(getToken()))
    }
    
    window.addEventListener('storage', onStorage)
    window.addEventListener('auth-change', onAuthChange)
    
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('auth-change', onAuthChange)
    }
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ReadPage
          </span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden flex items-center text-gray-700"
          onClick={toggleMobileMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 hover:text-indigo-600 ${isActive ? 'text-indigo-600' : 'text-gray-700'}`
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/books"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 hover:text-indigo-600 ${isActive ? 'text-indigo-600' : 'text-gray-700'}`
            }
          >
            Books
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `font-medium transition-colors duration-200 hover:text-indigo-600 ${isActive ? 'text-indigo-600' : 'text-gray-700'}`
            }
          >
            About
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `font-medium transition-colors duration-200 hover:text-indigo-600 ${isActive ? 'text-indigo-600' : 'text-gray-700'}`
              }
            >
              Admin
            </NavLink>
          )}
          
          {loggedIn && (
            <>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `transition-colors duration-200 hover:text-indigo-600 ${isActive ? 'text-indigo-600' : 'text-gray-700'} relative`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </NavLink>
              
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `transition-colors duration-200 hover:text-indigo-600 ${isActive ? 'text-indigo-600' : 'text-gray-700'} relative`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </NavLink>
              
              <button
                onClick={() => {
                  clearAuth()
                  setUser(null)
                  setLoggedIn(false)
                  navigate('/login')
                }}
                className="text-gray-700 hover:text-red-600 transition-colors duration-200"
              >
                Logout
              </button>
            </>
          )}
          
          {!loggedIn && (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `font-medium transition-colors duration-200 hover:text-indigo-600 ${isActive ? 'text-indigo-600' : 'text-gray-700'}`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-md transition-all duration-200"
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t py-3 px-4 shadow-lg">
          <nav className="flex flex-col space-y-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `py-2 px-3 rounded-md ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`
              }
              onClick={() => setMobileMenuOpen(false)}
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/books"
              className={({ isActive }) =>
                `py-2 px-3 rounded-md ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Books
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `py-2 px-3 rounded-md ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `py-2 px-3 rounded-md ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </NavLink>
            )}
            
            {loggedIn ? (
              <>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    `py-2 px-3 rounded-md flex items-center gap-2 ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Cart
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `py-2 px-3 rounded-md flex items-center gap-2 ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </NavLink>
                <button
                  onClick={() => {
                    clearAuth()
                    setUser(null)
                    setLoggedIn(false)
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="py-2 px-3 rounded-md text-left text-red-600 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `py-2 px-3 rounded-md ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="py-2 px-3 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}


