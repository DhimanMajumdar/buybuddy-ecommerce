import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full border-t border-sky-200/50 bg-sky-100 py-12">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="text-sm font-medium text-sky-600">
          © {new Date().getFullYear()} buybuddy. Optimized for a seamless shopping experience.
        </p>
        <p>
          Created with ❤️ by {'Dhiman Majumdar'}
        </p>
      </div>
    </footer>
  )
}

export default Footer