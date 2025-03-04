import React, { useState, useEffect } from 'react'
import Home from '../pages/Home';

const leftbar = () => {
  const [sessionData, setSessionData] = useState([]);
  const [localData, setLocalData] = useState([])
  const [showData, setShowData] = useState('')
  const [selectedConnection, setSelectedConnection] = useState('')
 

  const getAllSessionStorage=()=>{
    return Object.fromEntries(
      Object.keys(sessionStorage).map(Key=>[Key,sessionStorage.getItem(Key)])
      
    );
    
  };

  const getAlllocalStorage=()=>{
    return Object.fromEntries(
      Object.keys(localStorage).map(Key=>[Key,localStorage.getItem(Key)])
      
    );
    
  };

  useEffect(() => {
  const temp_keys = getAllSessionStorage()
  setSessionData(temp_keys)
  const permanent_keys = getAlllocalStorage()
  setLocalData(permanent_keys)

  }, [])

  useEffect(() => {
    console.log(showData)
    console.log(selectedConnection)
  }, [showData])



  return (
    <div className='mr-10'>
      <div className='  mt-6 '>
        <Home connection ={selectedConnection} setconnection ={setSelectedConnection}/>
        <p
          className=' font-bold pb-4 text-2xl text-gray-600   '>Temprary Conn.</p>

     
          <div >
            {Object.entries(sessionData).map(([key, value], index)=> (
              <p
              className={`border-l-8 cursor-pointer my-2 p-2 ${selectedConnection == key && 'bg-pink-500'}  border-l-purple-600 hover:bg-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105`}
              onClick={()=>{setShowData(value); setSelectedConnection(key) }}
             
               key={index}>{key}</p> 
               
              
            ))}
          </div>
  

      </div>
      <div className='mt-6'>
        <p 
          className='font-bold pb-4 text-2xl text-gray-600 '>Permanant Conn.</p>

          <div>
            {Object.entries(localData).map(([key, value], index)=> (
              <p 
              className={`border-l-8 cursor-pointer my-2 p-2 ${selectedConnection == key && 'bg-pink-500'}  border-l-purple-600 hover:bg-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105`}
              onClick={()=>{setShowData(value); setSelectedConnection(key) }}
             
              key={index}>{key}</p> 
              
            ))}
          </div>

      </div>
    </div>
  )
}

export default leftbar

