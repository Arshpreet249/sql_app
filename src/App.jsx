import { useState } from 'react'
import Navbar from './components/Navbar'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'



function App() {
  const [selectedConnection, setSelectedConnection] = useState({});
  const [activeSheet, setActiveSheet] = useState('Sheet 1');

  
  return (
    <>
 <Navbar
 activeSheet={activeSheet}  setActiveSheet={setActiveSheet}
  />
 <Home selectedConnection={selectedConnection} setSelectedConnection={setSelectedConnection} activeSheet={activeSheet}
  setActiveSheet={setActiveSheet}/>

    </>
  )
}

export default App
