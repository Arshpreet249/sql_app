import { useState , useRef} from 'react'
import SaveInfo from '../service/SaveInfo'
import { Cog } from 'lucide-react';
import { Share2 } from 'lucide-react';
import Users from '../service/Users'
const Navbar = ({activeSheet,setActiveSheet}  ) => {
  const [show, setShow] = useState(false)
  const [user, setUser] = useState(false)
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && file.name.endsWith('.sql')) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const sqlContent = event.target.result;

        // Create new sheet name
        const existingSheets = Object.keys(localStorage).filter((key) =>
          key.startsWith('Sheet ')
        );
        const newSheetNumber = existingSheets.length + 1;
        const newSheetName = `Sheet ${newSheetNumber}`;

        // Save to localStorage
        localStorage.setItem(newSheetName, sqlContent);

        // Set new active sheet
        setActiveSheet(newSheetName);
      };

      reader.readAsText(file);
      e.target.value = '';
    } else {
      alert('Please select a valid .sql file');
    }
  };

  const handleLoadFileClick = () => {
    fileInputRef.current.click();
  };

   const saveFile = () => {
     if (!activeSheet) return;
     
     const sheetName = activeSheet;
     console.log('activeSheet:', sheetName);


    const data = localStorage.getItem(sheetName);
    const blob = new Blob([data || ''], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${sheetName}.sql`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };




  
  return (
    <div>
      <nav className='w-full py-2 flex justify-between items-center bg-purple-600 bg'>
        <h1 className='mx-4 text-4xl font-bold text-amber-50'>DB Craft</h1>
        <ul className='flex justify-end   gap-5 mr-6'>
        <button 
        onClick={handleLoadFileClick}
        className="px-3 text-amber-50 cursor-pointer text-[18px] border-b border-b-purple-600 my-1 hover:border-b hover:border-b-cyan-50 transition-colors duration-500">
        Load fIle 
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".sql"
          onChange={handleFileChange}
        />
        <button 
        onClick={saveFile}
        className="px-3 text-amber-50 cursor-pointer text-[18px] border-b border-b-purple-600 my-1 hover:border-b hover:border-b-cyan-50 transition-colors duration-500">
        Save file 
        </button>
        <button className="px-3 text-amber-50 cursor-pointer text-[18px]  border-b border-b-purple-600 my-1 hover:border-b hover:border-b-cyan-50 transition-colors duration-500">
        Statistics 
        </button>

          <li >
          <button onClick={()=>setShow(true)} className=' cursor-pointer p-2'> <Cog size={35} strokeWidth={1} color="#fff"  /></button>
          </li>
        </ul>
      </nav>
      {show &&<SaveInfo onclose={()=>setShow(false)} />}
        {user && <Users onclose={()=>setUser(false)} />}


    </div>
  )
}

export default Navbar
