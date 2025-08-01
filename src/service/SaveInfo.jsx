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
  const [database, setDatabase] = useState('');
  
  // SSH Tunnel fields
  const [useSSH, setUseSSH] = useState(false);
  const [sshHost, setSshHost] = useState('');
  const [sshPort, setSshPort] = useState('22');
  const [sshUsername, setSshUsername] = useState('');
  const [sshPassword, setSshPassword] = useState('');
  const [sshKeyPath, setSshKeyPath] = useState('');
  const [dbHost, setDbHost] = useState('');
  const [dbPort, setDbPort] = useState('');
  const [testSSHLoading, setTestSSHLoading] = useState(false);
  const [sshTestResult, setSshTestResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSSHPassword, setShowSSHPassword] = useState(false);
  
  const infoRef = useRef();

  useEffect(() => {
    if (selectDb === 'mysql') {
      setPort('3306');
      setDbPort('3306');
    } else if (selectDb === 'postgress') {
      setPort('5432');
      setDbPort('5432');
    } else if (selectDb === 'mssql') {
      setPort('');
      setDbPort('');
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Get the full path if available, otherwise use filename
      const fullPath = file.path || file.name;
      setSshKeyPath(fullPath);
    }
  };

  const testSSHConnection = async () => {
    setTestSSHLoading(true);
    setSshTestResult(null);

    try {
      const fetchedKey = await fetchKey();
      if (!fetchedKey) {
        setSshTestResult({ status: 'error', message: 'Failed to fetch public key' });
        setTestSSHLoading(false);
        return;
      }

      const publicKey = forge.pki.publicKeyFromPem(fetchedKey);

             // Prepare connection data
       const connectionData = {
         ssh_tunnel: {
           ssh_host: sshHost,
           ssh_port: parseInt(sshPort),
           ssh_username: sshUsername,
           ssh_password: sshPassword || null,
           ssh_key_path: sshKeyPath || null,
           db_host: dbHost,
           db_port: parseInt(dbPort)
         },
         ht: host,
         pt: parseInt(port),
         db: database,
         user: userName,
         password: password,
         db_name: selectDb
       };

      const inputText = JSON.stringify(connectionData);
      
      // Generate a random AES key
      const aesKey = forge.random.getBytesSync(32); // 256-bit key
      const iv = forge.random.getBytesSync(16); // 128-bit IV
      
      // Create AES cipher
      const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
      cipher.start({ iv: iv });
      cipher.update(forge.util.createBuffer(inputText, 'utf8'));
      cipher.finish();
      
      // Get encrypted data
      const encryptedData = cipher.output.getBytes();
      
      // Encrypt the AES key with RSA
      const encryptedAesKey = publicKey.encrypt(aesKey, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
      });
      
      // Combine IV + encrypted AES key + encrypted data
      const combinedData = iv + encryptedAesKey + encryptedData;
      const encryptedBase64 = forge.util.encode64(combinedData);

      const requestData = {
        encrytionData: JSON.stringify({
          key: fetchedKey,
          users: encryptedBase64
        })
      };

      const response = await fetch('http://192.168.1.200:7000/test-ssh-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      setSshTestResult(result);
    } catch (error) {
      setSshTestResult({ 
        status: 'error', 
        message: `SSH connection test failed: ${error.message}` 
      });
    } finally {
      setTestSSHLoading(false);
    }
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

         // Prepare connection data based on whether SSH is used
     let users;
           if (useSSH) {
        users = {
          ssh_tunnel: {
            ssh_host: sshHost,
            ssh_port: parseInt(sshPort),
            ssh_username: sshUsername,
            ssh_password: sshPassword || null,
            ssh_key_path: sshKeyPath || null,
            db_host: dbHost,
            db_port: parseInt(dbPort)
          },
          ht: host,
          pt: parseInt(port),
          db: database,
          user: userName,
          password: password,
          db_name: selectDb
        };
      } else {
        users = {
          user: userName,
          password: password,
          ht: host,
          pt: port,
          db: database,
          db_name: selectDb
        };
      }

    const inputText = JSON.stringify(users);
    
    // Generate a random AES key
    const aesKey = forge.random.getBytesSync(32); // 256-bit key
    const iv = forge.random.getBytesSync(16); // 128-bit IV
    
    // Create AES cipher
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(inputText, 'utf8'));
    cipher.finish();
    
    // Get encrypted data
    const encryptedData = cipher.output.getBytes();
    
    // Encrypt the AES key with RSA
    const encryptedAesKey = publicKey.encrypt(aesKey, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
    
    // Combine IV + encrypted AES key + encrypted data
    const combinedData = iv + encryptedAesKey + encryptedData;
    const encryptedBase64 = forge.util.encode64(combinedData);

    const db = {
      db_name: selectDb,
      connection_name: name,
      key: fetchedKey,
      users: encryptedBase64,
      use_ssh: useSSH,
    };

         if (!db.connection_name) {
       alert('Please enter a connection name');
       setIsLoading(false);
       return;
     }

     if (!selectDb) {
       alert('Please select a database type');
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

    if (save_state === 'temporary') {
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
    <div ref={infoRef} onClick={closebox} className="fixed inset-0 z-10 flex items-center justify-center">
      <div className="shadow-xl border border-gray-200 p-6 bg-white rounded flex max-h-[90vh] overflow-y-auto">
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

          {/* SSH Tunnel Toggle */}
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useSSH}
                onChange={(e) => setUseSSH(e.target.checked)}
                className="mr-2"
              />
              <span className="text-lg font-semibold">Use SSH Tunnel</span>
            </label>
          </div>

          {useSSH && (
            <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
              <h2 className="text-lg font-semibold mb-3">SSH Tunnel Configuration</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">SSH Host</h3>
                  <input
                    className="border border-gray-400 outline-none p-1 w-full"
                    type="text"
                    value={sshHost}
                    onChange={(e) => setSshHost(e.target.value)}
                    placeholder="e.g., 3.6.112.148"
                    required
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium">SSH Port</h3>
                  <input
                    className="border border-gray-400 outline-none p-1 w-full"
                    type="text"
                    value={sshPort}
                    onChange={(e) => setSshPort(e.target.value)}
                    placeholder="22"
                    required
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium">SSH Username</h3>
                  <input
                    className="border border-gray-400 outline-none p-1 w-full"
                    type="text"
                    value={sshUsername}
                    onChange={(e) => setSshUsername(e.target.value)}
                    placeholder="e.g., ubuntu"
                    required
                  />
                </div>
                                 <div>
                   <h3 className="text-sm font-medium">SSH Password (optional)</h3>
                   <div className="relative">
                     <input
                       className="border border-gray-400 outline-none p-1 w-full pr-10"
                       type={showSSHPassword ? "text" : "password"}
                       value={sshPassword}
                       onChange={(e) => setSshPassword(e.target.value)}
                       placeholder="Leave empty if using key"
                     />
                     <button
                       type="button"
                       className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                       onClick={() => setShowSSHPassword(!showSSHPassword)}
                     >
                       {showSSHPassword ? "🔭" : "👁️‍🗨️"}
                     </button>
                   </div>
                 </div>
                                                                                        <div>
                     <h3 className="text-sm font-medium">SSH Key Path (optional)</h3>
                     <div className="flex gap-2">
                       <input
                         className="border border-gray-400 outline-none p-1 flex-1"
                         type="text"
                         value={sshKeyPath}
                         onChange={(e) => setSshKeyPath(e.target.value)}
                         placeholder="Click Browse to select key file"
                       />
                       <button
                         type="button"
                         onClick={() => document.getElementById('ssh-key-file').click()}
                         className="px-3 py-1 bg-blue-500 text-white text-sm hover:bg-blue-600"
                       >
                         Browse
                       </button>
                       <input
                         type="file"
                         accept=".pem,.key,.ppk"
                         onChange={handleFileSelect}
                         className="hidden"
                         id="ssh-key-file"
                       />
                     </div>
                   </div>
                <div>
                  <h3 className="text-sm font-medium">Database Host (via SSH)</h3>
                  <input
                    className="border border-gray-400 outline-none p-1 w-full"
                    type="text"
                    value={dbHost}
                    onChange={(e) => setDbHost(e.target.value)}
                    placeholder="e.g., i4invest-db-cluster.c7ewg4cusf39.ap-south-1.rds.amazonaws.com"
                    required
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Database Port (via SSH)</h3>
                  <input
                    className="border border-gray-400 outline-none p-1 w-full"
                    type="text"
                    value={dbPort}
                    onChange={(e) => setDbPort(e.target.value)}
                    placeholder="3306"
                    required
                  />
                </div>
              </div>

              {/* Test SSH Connection Button */}
              <div className="mt-4">
                <button
                  disabled={testSSHLoading || !sshHost || !sshUsername}
                  onClick={testSSHConnection}
                  className={`px-4 py-2 rounded font-semibold ${
                    testSSHLoading || !sshHost || !sshUsername
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {testSSHLoading ? 'Testing...' : 'Test SSH Connection'}
                </button>
                
                {sshTestResult && (
                  <div className={`mt-2 p-2 rounded text-sm ${
                    sshTestResult.status === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {sshTestResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
            <h2 className="text-lg font-semibold mb-3">Database Connection</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Username</h3>
                <input
                  className="border border-gray-400 outline-none p-1 w-full"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
                             <div>
                 <h3 className="text-sm font-medium">Password</h3>
                 <div className="relative">
                   <input
                     className="border border-gray-400 outline-none p-1 w-full pr-10"
                     type={showPassword ? "text" : "password"}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="Enter password"
                     required
                   />
                   <button
                     type="button"
                     className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                     onClick={() => setShowPassword(!showPassword)}
                   >
                     {showPassword ? "🔭" : "👁️‍🗨️"}
                   </button>
                 </div>
               </div>
            </div>
          </div>

          {selectDb === 'mssql' && (
            <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
              <h2 className="text-lg font-semibold mb-3">MSSQL Server</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Server</h3>
                  <input
                    className="border border-gray-400 outline-none p-1 w-full"
                    type="text"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    placeholder="e.g., localhost\\SQLEXPRESS"
                    required
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Database</h3>
                  <input
                    className="border border-gray-400 outline-none p-1 w-full"
                    type="text"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    placeholder="Database name"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {selectDb !== 'mssql' && (
            <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
              <h2 className="text-lg font-semibold mb-3">Database Server</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Host</h3>
                  <input
                    className="border border-gray-400 outline-none p-1 w-full"
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="e.g., localhost or IP address"
                    required
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Port</h3>
                  <input
                    className="border border-gray-400 outline-none p-1 w-full"
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="e.g., 3306, 5432"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-6 justify-center">
            <button
              disabled={isLoading}
              onClick={() => handleAdd('temporary')}
              className={`px-6 py-3 font-semibold transition-all duration-200 transform hover:scale-105 ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                  : 'bg-purple-600 text-white hover:bg-purple-300 shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Temporary Save'
              )}
            </button>
            <button
              disabled={isLoading}
              onClick={() => handleAdd('permanent')}
              className={`px-6 py-3 font-semibold transition-all duration-200 transform hover:scale-105 ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                  : 'bg-purple-600 text-white hover:bg-purple-300 shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Permanent Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveInfo;
