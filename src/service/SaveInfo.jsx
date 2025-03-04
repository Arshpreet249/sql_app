import React, { useEffect, useRef, useState } from 'react'
import { CircleX } from 'lucide-react';
import forge from "node-forge";

const SaveInfo = ({ onclose }) => {
  const [name, setName] = useState("")
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [host, setHost] = useState("")
  const [port, setPort] = useState("")
  const [publicKeyPem, setPublicKeyPem] = useState(null)
  const [selectDb, setSelectDb] = useState("")
  const infoRef = useRef()
  

  const fetchKey = async () => {
    let response = await fetch("http://192.168.1.5:7000/public-key")
    let data = await response.json()
    console.log('response>>', response)
    console.log('data>>', data)


    if (data.public_key) {
      setPublicKeyPem(data.public_key)
      return data.public_key
    } else {
      console.log("invalid public key")
    }

  }
 

  const handlechange=(e)=> {
    setSelectDb(e.target.value)
  }
  const handleAdd = async (save_state) => {

    await fetchKey();

    console.log("public key Pem ", publicKeyPem)
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    const users = {
      uName: userName,
      pwd: password,
      ht: host,
      pt: port
    }

    
    const inputText = JSON.stringify(users);
    console.log("input text", inputText)

    const encrypted = publicKey.encrypt(inputText, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });
    const encryptedBase64 = forge.util.encode64(encrypted);
    console.log("Encrypted Data:", encryptedBase64);

    console.log(selectDb)


    const db = {
      db_name: selectDb,
      connection_name: name,
      key: publicKeyPem,
      users: encryptedBase64,
       
     
    }

    if (save_state === 'temprary') {
      temperarySave(db)
    } else {
      permanantSave(db)
    }

  }

  const temperarySave = (db) => {
    if (db.connection_name) {
      sessionStorage.setItem(db.connection_name, JSON.stringify(db))
    }
  }

  const permanantSave = (db) => {
    if (db.connection_name) {
      localStorage.setItem(db.connection_name, JSON.stringify(db))
    }

  }

  const closebox = (e) => {
    if (infoRef.current === e.target) {
      onclose()
    }

  }

  useEffect(() => {
    const existingConnection = localStorage.getItem(name) || sessionStorage.getItem(name);
    if (existingConnection) {
        alert("This connection name already exists");
    }
}, [name]);



  return (
    
    <div ref={infoRef} onClick={closebox} className='flex justify-center z-10  '>

      <div className='flex shadow-xl border-gray-200 mt-20 p-6 border absolute bg-white rounded'>
        <div className='w-40 p-3 mt-10 border-r-1 border-gray-300'>
          <div >
            <div>
              <div>
                <h1 className='font-bold text-[30px] text-gray-600'>DB</h1>
                <div>
                  <input type="radio" id='mssql' value="mssql" name='database'  onChange={handlechange}/>
                  <label className='text-lg' htmlFor="mssql">MSSQL</label>
                </div>
                <div>
                  <input type="radio" id='mysql' value="mysql" name='database'onChange={handlechange}  />
                  <label className='text-lg' htmlFor="mysql">MYSQL</label>
                </div>
                <div>
                  <input type="radio" id='postgres' value="postgress" name='database'onChange={handlechange} />
                  <label className='text-lg' htmlFor="postgres">POSTGRES</label>
                </div>
               
              </div>

            </div>
          </div>
        </div>
        <div className='w-130 p-5 '>
          <div >
            <div className='flex justify-end'>
              <button   className='cursor-pointer' onClick={onclose}> <CircleX size={30} strokeWidth={2} /></button>
            </div>
            <h1 className='font-bold text-[30px] text-gray-600 '>Connection name</h1>
            <input className='border border-gray-400 w-100 outline-none'
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required />
            <div className='flex gap-5'>
              <div >
                <h1 className='text-lg '>Username</h1>
                <input className='border  border-gray-400 outline-none  '
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required />
              </div>
              <div>
                <h1 className='text-lg'>Password</h1>
                <input className='border  border-gray-400 outline-none'
                  type="Password "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />
              </div>
            </div>
            <div className='flex gap-5'>
              <div>
                <h1 className='text-lg'>Host</h1>
                <input className='border  border-gray-400 outline-none'
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  required />
              </div>
              <div>
                <h1 className='text-lg'>Port</h1>
                <input className='border  border-gray-400 outline-none'
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  required />
              </div>
            </div>
            <div className='flex gap-3 mt-3'>
              <div>
                <button onClick={() => handleAdd('temprary')}
                  className=' border border-gray-300 text-gray-600  p-2 cursor-pointer font-bold'> Temporary Save</button>
              </div>
              <div>
                <button onClick={() => handleAdd('permanent')}
                  className='  border  border-gray-300 text-gray-600  p-2 cursor-pointer font-bold'>Permanant Save</button>
              </div>
            </div>

          </div>
        </div>
      </div>


    </div>
  )
}

export default SaveInfo;
