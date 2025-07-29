import { useState } from 'react'
import Navbar from './components/Navbar'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import MentineTable from './components/MentineTable'




function App() {
  const [selectedConnection, setSelectedConnection] = useState('');
  
  return (
    <>
 <Navbar />
 <Home selectedConnection={selectedConnection} setSelectedConnection={setSelectedConnection}/>
 <MentineTable/>

    </>
  )
}

export default App
