

import React, { useRef, useState } from 'react';
import Leftbar from '../components/Leftbar';

const Home = ({ selectedConnection, setSelectedConnection }) => {
  const textareaRef = useRef(null);
  const [textData, setTextData] = useState("");

  const getAllLocalStorage = () => {
    return Object.fromEntries(
      Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)])
    );
  };

  const getAllSessionStorage = () => {
    return Object.fromEntries(
      Object.keys(sessionStorage).map((key) => [key, sessionStorage.getItem(key)])
    );
  };

  const expandSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = text.substring(start, end);
      console.log("Selected Text:", selectedText);
    } else {
      let startIndex = text.lastIndexOf(';', start - 1);
      startIndex = startIndex === -1 ? 0 : startIndex + 1;

      let endIndex = text.indexOf(';', end);
      endIndex = endIndex === -1 ? text.length : endIndex;

      const expandedText = text.substring(startIndex, endIndex).trim();
      console.log("Expanded Selection:", expandedText);
    }
  };

  const executeData = async (type_exe) => {
    if (!selectedConnection || !textData.trim()) {
      alert("Missing connection or query text");
      return;
    }

    const requestData = {
      textData,
      selectedConnection,
      type_exe,
    };

    const response = await fetch("http://192.168.1.200:7000/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("Success:", response.status);
    const responseData = await response.json();
    console.log("Response Data:", responseData);

  };

  return (
    <div>
      <div className='py-2 mx-8 flex justify-between items-center'>
        <div>
          <button className='px-3 cursor-pointer text-[19px] mx-2 border border-green-600 my-1 hover:border-b hover:border-b-cyan-50 hover:border-t-cyan-50 transition-colors duration-500'>
            SQL Query
          </button>
        </div>

        <div>
          <button
            onClick={() => executeData('single')}
            className='px-3 cursor-pointer text-[19px] mx-2 border border-purple-600 my-1 hover:border-b hover:border-b-cyan-50 hover:border-t-cyan-50 transition-colors duration-500'
          >
            Execute
          </button>

          <button
            onClick={() => executeData('all')}
            className='px-3 cursor-pointer text-[19px] mx-2 border border-purple-600 my-1 hover:border-b hover:border-b-cyan-50 hover:border-t-cyan-50 transition-colors duration-500'
          >
            Execute All
          </button>
        </div>
      </div>

      <div>
        <div className='flex justify-center'>
          <Leftbar
            selectedConnection={selectedConnection}
            setSelectedConnection={setSelectedConnection}
          />

          <form>
            <textarea
              ref={textareaRef}
              onClick={expandSelection}
              className='flex outline-none border-gray-200 mt-6 p-6 border rounded w-[80vw]'
              rows={20}
              cols={130}
              id="query"
              name="query"
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;

