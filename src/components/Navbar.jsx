import { useState } from 'react'
import SaveInfo from '../service/SaveInfo'
import { Cog } from 'lucide-react';
import { Share2 } from 'lucide-react';
import Users from '../service/users';
const Navbar = () => {
  const [show, setShow] = useState(false)
  const [user, setUser] = useState(false)
  
  return (
    <div>
      <nav className='w-full py-2 flex justify-between items-center bg-purple-600 bg'>
        <h1 className='mx-4 text-4xl font-bold text-amber-50'>DB Craft</h1>
        <ul className='flex justify-end   gap-5 mr-6'>
        <button className="px-3 text-amber-50 cursor-pointer text-[18px] border-b border-b-purple-600 my-1 hover:border-b hover:border-b-cyan-50 transition-colors duration-500">
        Load fIle 
        </button>
        <button className="px-3 text-amber-50 cursor-pointer text-[18px] border-b border-b-purple-600 my-1 hover:border-b hover:border-b-cyan-50 transition-colors duration-500">
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
