import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
          Tailwind Test Card
        </div>
        <p className="text-gray-700 mb-6">
         This is for testing current tailwind setup is working
        </p>
        <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
           Hello world
        </button>
      </div>
    </>
  )
}

export default App
