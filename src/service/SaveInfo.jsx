

import React, { useEffect, useRef, useState } from 'react';
import { CircleX } from 'lucide-react';
import forge from 'node-forge';

const SaveInfo = ({ onclose }) => {
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [publicKeyPem, setPublicKeyPem] = useState(null);
  const [selectDb, setSelectDb] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [server, setServer] = useState('');
  const [database, setDatabase] = useState('')
  const infoRef = useRef();


   useEffect(() => {
    if (selectDb === 'mysql') {
      setPort('3306');
    } else if (selectDb === 'postgress') {
      setPort('5432');
    } else if (selectDb === 'mssql') {
      setPort('');
    }
  }, [selectDb]);
  const fetchKey = async () => {
    try {
      const response = await fetch('http://192.168.1.200:7000/public-key');
      const data = await response.json();

      if (data.public_key) {
        setPublicKeyPem(data.public_key);
        return data.public_key;
      } else {
        console.error('Invalid public key');
        return null;
      }
    } catch (error) {
      console.error('Error fetching public key:', error);
      return null;
    }
  };

  const handlechange = (e) => {
    setSelectDb(e.target.value);
  };

  const handleAdd = async (save_state) => {
    setIsLoading(true);

    const fetchedKey = await fetchKey();

    if (!fetchedKey) {
      setIsLoading(false);
      alert('Failed to fetch public key');
      return;
    }

    const publicKey = forge.pki.publicKeyFromPem(fetchedKey);

    const users = {
      uName: userName,
      pwd: password,
      ht: host,
      pt: port,
    };

    const inputText = JSON.stringify(users);

    const encrypted = publicKey.encrypt(inputText, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });

    const encryptedBase64 = forge.util.encode64(encrypted);

    const db = {
      db_name: selectDb,
      connection_name: name,
      key: fetchedKey,
      users: encryptedBase64,
    };

    if (!db.connection_name) {
      alert('Please enter a connection name');
      setIsLoading(false);
      return;
    }

    const alreadyExists =
      sessionStorage.getItem(db.connection_name) || localStorage.getItem(db.connection_name);

    if (alreadyExists) {
      alert('This connection name already exists');
      setIsLoading(false);
      return;
    }

    if (save_state === 'temprary') {
      sessionStorage.setItem(db.connection_name, JSON.stringify(db));
    } else {
      localStorage.setItem(db.connection_name, JSON.stringify(db));
    }

    setIsLoading(false);
    onclose();
  };

  const closebox = (e) => {
    if (infoRef.current === e.target) {
      onclose();
    }
  };

  return (
    <div ref={infoRef} onClick={closebox} className="flex justify-center z-10">
      <div className="flex shadow-xl border-gray-200 mt-20 p-6 border absolute bg-white rounded">
        <div className="w-40 p-3 mt-10 border-r border-gray-300">
          <h1 className="font-bold text-[30px] text-gray-600">DB</h1>
          <div>
            <div>
              <input type="radio" id="mssql" value="mssql" name="database" onChange={handlechange} />
              <label className="text-lg" htmlFor="mssql">MSSQL</label>
            </div>
            <div>
              <input type="radio" id="mysql" value="mysql" name="database" onChange={handlechange} />
              <label className="text-lg" htmlFor="mysql">MYSQL</label>
            </div>
            <div>
              <input type="radio" id="postgres" value="postgress" name="database" onChange={handlechange} />
              <label className="text-lg" htmlFor="postgres">POSTGRES</label>
            </div>
          </div>
        </div>

        <div className="w-130 p-5">
          <div className="flex justify-end">
            <button className="cursor-pointer" onClick={onclose}>
              <CircleX size={30} strokeWidth={2} />
            </button>
          </div>

          <h1 className="font-bold text-[30px] text-gray-600">Connection name</h1>
          <input
            className="border border-gray-400 w-full outline-none p-1"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex justify-between mt-4 ">
            <div>
              <h1 className="text-lg">Username</h1>
              <input
                className="border border-gray-400 outline-none p-1 w-[100%]"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div>
              <h1 className="text-lg">Password</h1>
              <input
                className="border border-gray-400 outline-none p-1 w-[100%] "
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
   {selectDb === 'mssql' && (
            <div className="flex justify-between mt-4">
            <div>
              <h1 className="text-lg">Server</h1>
              <input
                className="border border-gray-400 outline-none p-1"
                type="text"
                value={server}
                onChange={(e) => setServer(e.target.value)}
                required
              />
            </div>
            <div>
              <h1 className="text-lg">Database</h1>
              <input
                className="border border-gray-400 outline-none p-1"
                type="database"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                required
              />
            </div>
          </div>
            )}
{selectDb !== 'mssql' && (
          <div className="flex justify-between mt-4">
            <div>
              <h1 className="text-lg">Host</h1>
              <input
                className="border border-gray-400 outline-none p-1"
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                required
              />
            </div>
            <div>
              <h1 className="text-lg">Port</h1>
              <input
                className="border border-gray-400 outline-none p-1"
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                required
              />
            </div>
          </div>
          )}

          <div className="flex gap-3 mt-5">
            <button
              disabled={isLoading}
              
              onClick={() => handleAdd('temprary')}
              className={`border border-gray-300 cursor-pointer text-gray-600 p-2 font-bold ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Saving...' : 'Temporary Save'}
            </button>
            <button
              disabled={isLoading}
              onClick={() => handleAdd('permanent')}
              className={`border border-gray-300 cursor-pointer text-gray-600 p-2 font-bold ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Saving...' : 'Permanent Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveInfo;
