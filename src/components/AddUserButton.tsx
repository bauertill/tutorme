"use client"
import { useState } from 'react'
import { AddUserModal } from './AddUserModal'

export function AddUserButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full p-4 text-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="text-2xl">+</span> Add New User
      </button>
      
      {isModalOpen && <AddUserModal onClose={() => setIsModalOpen(false)} />}
    </>
  )
} 