import { useState } from 'react';
import { Button } from './Common';
import { FiX } from 'react-icons/fi';

export function Modal({ isOpen, onClose, title, children, onConfirm, confirmText = 'Save', isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          {onConfirm && (
            <Button onClick={onConfirm} disabled={isLoading}>
              {isLoading ? '⏳ Loading...' : confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function FormInput({ label, type = 'text', value, onChange, placeholder = '', required = false, error = '' }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-all ${
          error 
            ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function FormSelect({ label, value, onChange, options, required = false, error = '' }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-all ${
          error 
            ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
        }`}
      >
        <option value="">-- Select {label.toLowerCase()} --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
