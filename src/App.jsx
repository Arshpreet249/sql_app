import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'



function App() {
  const [selectedConnection, setSelectedConnection] = useState({});
  const [activeSheet, setActiveSheet] = useState('Sheet 1');

  const [ip, setIp] = useState("")
  
useEffect(() => {
  const fetchIp = () => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setIp(data.ip))
      .catch((err) => console.error(err));
  };

  fetchIp();

  const interval = setInterval(fetchIp, 15 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
  
  return (
    <>
 <Navbar
 activeSheet={activeSheet}  setActiveSheet={setActiveSheet} ip ={ip}
  />
 <Home selectedConnection={selectedConnection} setSelectedConnection={setSelectedConnection} activeSheet={activeSheet}
  setActiveSheet={setActiveSheet} ip={ip}/>

    </>
  )
}

export default App
