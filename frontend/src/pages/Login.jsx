import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../lib/api'
import { setAuth } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("")

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-600">Sign in to your ReadPage account</p>
            {location.state?.verified && (
              <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                Your email has been verified. Please sign in.
              </div>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-10">

              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget
                const email = form.email.value.trim()
                const password = form.password.value
                
                if (!email || !password) {
                  setError("Please fill in all fields")
                  return
                }
                
                setError("")
                setLoading(true)
                
                try {
                  const { token, user } = await api.login({ email, password })
                  setAuth(token, user)
                  // Dispatch a custom event to notify navbar of authentication change
                  window.dispatchEvent(new Event('auth-change'))
                  if (user?.role === 'admin') {
                    navigate('/admin')
                  } else {
                    navigate('/')
                  }
                } catch (err) {
                  setError(err.message || "Login failed. Please try again.")
                } finally {
                  setLoading(false)
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed" 
                        placeholder="Enter your email"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input 
                        id="password" 
                        name="password" 
                        type="password" 
                        required
                        minLength="6"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed" 
                        placeholder="Enter your password"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button 
                  disabled={loading} 
                  type="submit" 
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              {/* Forgot Password Modal */}
              {showForgotPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
                      <button 
                        className="text-gray-400 hover:text-gray-600 transition-colors" 
                        onClick={() => {
                          setShowForgotPassword(false)
                          setForgotPasswordEmail("")
                          setForgotPasswordMessage("")
                        }}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Step 1: Request OTP */}
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      if (!forgotPasswordEmail) {
                        setForgotPasswordMessage("Please enter your email address")
                        return
                      }
                      
                      setForgotPasswordLoading(true)
                      setForgotPasswordMessage("")
                      
                      try {
                        const response = await api.forgotPassword({ email: forgotPasswordEmail })
                        setForgotPasswordMessage(response.message || "OTP sent to your email")
                      } catch (err) {
                        setForgotPasswordMessage(err.message || "Failed to send OTP")
                      } finally {
                        setForgotPasswordLoading(false)
                      }
                    }}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                      {/* Step 2: Enter OTP and new password */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            onChange={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter the 6-digit OTP"
                            id="reset-otp-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter new password"
                            id="reset-newpass-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Confirm new password"
                            id="reset-confirmpass-input"
                          />
                        </div>
                      </div>

                      {forgotPasswordMessage && (
                        <div className={`mb-4 p-3 rounded-md ${
                          forgotPasswordMessage.includes('sent') 
                            ? 'bg-green-50 text-green-800 border border-green-200' 
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {forgotPasswordMessage}
                        </div>
                      )}
                      <div className="flex justify-between space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(false)
                            setForgotPasswordEmail("")
                            setForgotPasswordMessage("")
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={forgotPasswordLoading}
                          onClick={async () => {
                            const otp = document.getElementById('reset-otp-input')?.value.trim()
                            const newPassword = document.getElementById('reset-newpass-input')?.value
                            const confirmPassword = document.getElementById('reset-confirmpass-input')?.value
                            if (!otp || !newPassword || !confirmPassword) {
                              setForgotPasswordMessage('Please enter OTP and new password')
                              return
                            }
                            if (newPassword !== confirmPassword) {
                              setForgotPasswordMessage('Passwords do not match')
                              return
                            }
                            try {
                              setForgotPasswordLoading(true)
                              const resp = await api.resetPassword({ email: forgotPasswordEmail, otp, newPassword })
                              setForgotPasswordMessage(resp.message || 'Password reset successfully. You can now log in.')
                            } catch (err) {
                              setForgotPasswordMessage(err.message || 'Failed to reset password')
                            } finally {
                              setForgotPasswordLoading(false)
                            }
                          }}
                          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {forgotPasswordLoading ? 'Processing...' : 'Verify OTP & Reset'}
                        </button>
                        <button
                          type="submit"
                          disabled={forgotPasswordLoading}
                          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {forgotPasswordLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}