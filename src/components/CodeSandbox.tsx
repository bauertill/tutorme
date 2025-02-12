'use client';

import { useState } from 'react';

export default function CodeSandbox() {
  const [code, setCode] = useState('');

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Code Sandbox</h2>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 p-2 font-mono text-sm bg-gray-800 text-gray-100 rounded"
        placeholder="Write your code here..."
      />
      <button 
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => {
          // Add code execution logic here
          console.log('Executing code:', code);
        }}
      >
        Run Code
      </button>
    </div>
  );
} 