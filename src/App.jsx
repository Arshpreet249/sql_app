import { useState } from 'react'
import Navbar from './components/Navbar'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'




function App() {

  
  return (
    <>
 <Navbar />
 <Home />
 
    </>
  )
}

export default App
