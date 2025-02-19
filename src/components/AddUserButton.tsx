"use client";
import { useState } from "react";
import { AddUserModal } from "./AddUserModal";

export function AddUserButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full p-4 text-center text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
      >
        <span className="text-2xl">+</span> Add New User
      </button>

      {isModalOpen && <AddUserModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
