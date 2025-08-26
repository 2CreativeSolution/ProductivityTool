// src/components/FormModal/FormModal.jsx
import React from 'react'
import 'src/index.css' // Ensures Tailwind styles are available

const FormModal = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-xl text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  )
}

export default FormModal
