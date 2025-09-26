export default function About() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About ReadPage</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your gateway to discovering amazing books and building your personal library
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-12 sm:px-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                ReadPage is a modern book storefront application that showcases the power of 
                contemporary web technologies. Built with React, Node.js, and styled with Tailwind CSS, 
                it demonstrates seamless user experiences, responsive design, and efficient state management.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Fast & Responsive</h3>
                  </div>
                  <p className="text-gray-600">
                    Built with modern React patterns and optimized for performance, 
                    ensuring smooth interactions across all devices.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Secure & Reliable</h3>
                  </div>
                  <p className="text-gray-600">
                    Implemented with proper authentication, data validation, and 
                    secure API endpoints for a trustworthy user experience.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-8 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">User Authentication</p>
                      <p className="text-sm text-gray-500">Secure login and registration system</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Shopping Cart</p>
                      <p className="text-sm text-gray-500">Add books to cart and manage quantities</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Order Management</p>
                      <p className="text-sm text-gray-500">Track your orders and view history</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Admin Dashboard</p>
                      <p className="text-sm text-gray-500">Manage books, orders, and customers</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Technology Stack</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">React</span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Node.js</span>
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">Express</span>
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">MongoDB</span>
                  <span className="px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium">Tailwind CSS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


