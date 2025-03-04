import React, { useRef ,useState} from 'react'
import Leftbar from '../components/leftbar'

const Home = ({selectedConnection}) => {
  const textareaRef = useRef(null)
  const [textData, setTextData] = useState(""); 


  const getAlllocalStorage=()=>{
    return Object.fromEntries(
      Object.keys(localStorage).map(Key=>[Key,localStorage.getItem(Key)])
      
    );
    
  };

  const getAllSessionStorage=()=>{
    return Object.fromEntries(
      Object.keys(sessionStorage).map(Key=>[Key,sessionStorage.getItem(Key)])
      
    );
    
  };


  const expandSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const end = textarea.selectionStart;
    const start = textarea.selectionEnd;

    let startIndex = text.lastIndexOf(';', start - 1);
    startIndex = startIndex === -1 ? 0 : startIndex + 1;

    let endIndex = text.indexOf(';', end);
    endIndex = endIndex === -1 ? text.length : endIndex;
  
  
    console.log(text.substring(startIndex, endIndex));
    
  }


  const executeData =async(type_exe)=> {
    // const sessionData = getAllSessionStorage();
    // const localData = getAlllocalStorage();

    const requestData = {
      textData,
      selectedConnection,
      type_exe:type_exe
    };

    const response = await fetch("http://192.168.1.5:7000/execute",{
      method:"POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    console.log("Success:", response.status);
    console.log("requested data ", requestData)
    console.log("response",response)
    
  }



  return (
    <div>
      <div className='py-2 mx-8 flex justify-between align-middle'>
        <div>

        <button className=' px-3  cursor-pointer text-[19px] mx-2 border border-green-600 my-1 hover:border-b hover:border-b-cyan-50 hover:border-t-cyan-50 transition-colors duration-500'> sql query</button>
        </div>
        <div >

        <button onClick={executeData('single')}
        className=' px-3  cursor-pointer text-[19px] mx-2 border border-purple-600 my-1 hover:border-b hover:border-b-cyan-50 hover:border-t-cyan-50 transition-colors duration-500'>
          Execute</button>
        <button className=' px-3  cursor-pointer text-[19px] mx-2 border border-purple-600 my-1 hover:border-b hover:border-b-cyan-50 hover:border-t-cyan-50 transition-colors duration-500'>Execute all</button>
        </div>

      </div>
      <div>
        <div className='flex justify-center'>
          <Leftbar />

          <form >
            <textarea ref={textareaRef} onClick={expandSelection} className='flex  outline-none border-gray-200 mt-6 p-6 border rounded w-[80vw]'
             rows={20} cols={130} id="query" name="query" value={textData}
             onChange={(e)=>setTextData(e.target.value)}>
            
            </textarea>
          </form>
        </div>
      
      </div>

    </div>
  )
}

export default Home
