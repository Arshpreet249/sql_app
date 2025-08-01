import React, { useRef, useState, useMemo, useEffect } from 'react';
import Leftbar from '../components/Leftbar';
import Paper from '../assets/images/paper.png'
import Table from '../assets/images/table.png'
import Stack from '../assets/images/stack.png'
import delete_img from '../assets/images/delete.png'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import {
  useMantineReactTable,
  MantineReactTable,
} from 'mantine-react-table';
import { Plus } from 'lucide-react'
import ConsoleMessageBox from '../components/ConsoleMessageBox';
import Rightbar from '../components/Rightbar';

const Home = ({ selectedConnection, setSelectedConnection, activeSheet, setActiveSheet }) => {
  const textareaRef = useRef(null);
  const tableRef = useRef(null);
   const consoleRef = useRef(null);
   const rightbarRef = useRef(null);
  const [textData, setTextData] = useState('');
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [tableDataObject, setTableDataObject] = useState([]);
  const [sheets, setSheets] = useState([]); // list of all the sheets avalialbel in storage and ther content
  // const [activeSheet, setActiveSheet] = useState('Sheet 1') // get active sheet
  const [isReady, setIsReady] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // delete sheets
  const [sheetToDelete, setSheetToDelete] = useState(null);
  const [activeExecution, setActiveExecution] = useState(null);
  const [showRightbar, setShowRightbar] = useState(false);



useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      rightbarRef.current &&
      !rightbarRef.current.contains(event.target)
    ) {
      setShowRightbar(false);
    }
  };

  if (showRightbar) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showRightbar]);

  useEffect(() => {
    const allKeys = Object.keys(localStorage);
    const sheetKeys = allKeys.filter((key) => key.startsWith('Sheet'));

    // Only set activeSheet if it’s not already set
    if (!activeSheet || !sheetKeys.includes(activeSheet)) {
      const defaultSheet = sheetKeys.length > 0 ? sheetKeys[0] : 'Sheet 1';
      setActiveSheet(defaultSheet);
      setTextData(localStorage.getItem(defaultSheet) || '');
    }

    setSheets(sheetKeys.length > 0 ? sheetKeys : ['Sheet 1']);
    setIsReady(true);
  }, []);


  useEffect(() => {
    const allKeys = Object.keys(localStorage);
    const sheetKeys = allKeys.filter((key) => key.startsWith('Sheet'));
    setSheets(sheetKeys.length > 0 ? sheetKeys : []);
  }, [activeSheet]);


  // useEffect(() => {
  //   const allKeys = Object.keys(localStorage);
  //   const sheetKeys = allKeys.filter((key) => key.startsWith('Sheet'));

  //   setSheets(sheetKeys.length > 0 ? sheetKeys : []);
  //   setIsReady(true);
  // }, []);





  // Load saved data from localStorage when active sheet changes
  useEffect(() => {
    const stored = localStorage.getItem(activeSheet)
    setTextData(stored || '')
  }, [activeSheet])


  // Save to localStorage whenever text changes
  useEffect(() => {
    if (isReady) {
      localStorage.setItem(activeSheet, textData);
    }
  }, [textData, activeSheet, isReady]);

  // butt to add sheet 
  const addSheet = () => {
    const newSheetName = `Sheet ${sheets.length + 1}`

    // Save empty content
    localStorage.setItem(newSheetName, '');

    // Add to list & activate
    setSheets([...sheets, newSheetName])
    setActiveSheet(newSheetName)
    setTextData('') // Clear textarea for new sheet
  }

  const deleteActiveSheet = () => {
    if (!activeSheet) return;
    setSheetToDelete(activeSheet);
    setShowDeleteDialog(true);
  };


  const confirmDeleteSheet = () => {
    if (!sheetToDelete) return;

    // Remove from localStorage
    localStorage.removeItem(sheetToDelete);

    // Filter out the deleted sheet
    const updatedSheets = sheets.filter((sheet) => sheet !== sheetToDelete);
    setSheets(updatedSheets);

    // Switch to another sheet or create new
    if (updatedSheets.length > 0) {
      const nextSheet = updatedSheets[0];
      setActiveSheet(nextSheet);
      setTextData(localStorage.getItem(nextSheet) || '');
    } else {
      const fallbackSheet = 'Sheet 1';
      setSheets([fallbackSheet]);
      setActiveSheet(fallbackSheet);
      setTextData('');
      localStorage.setItem(fallbackSheet, '');
    }

    setShowDeleteDialog(false);
    setSheetToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setSheetToDelete(null);
  };


  // keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        executeData('single');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);



  const expandSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = text.substring(start, end);
      console.log('Selected Text:', selectedText);
    } else {
      let startIndex = text.lastIndexOf(';', start - 1);
      startIndex = startIndex === -1 ? 0 : startIndex + 1;

      let endIndex = text.indexOf(';', end);
      endIndex = endIndex === -1 ? text.length : endIndex;

      const expandedText = text.substring(startIndex, endIndex).trim();
      console.log('Expanded Selection:', expandedText);
    }
  };

  const executeData = async (type_exe) => {
    if (!selectedConnection || !textData.trim()) {
      alert('Missing connection or query text');
      return;
    }

     setActiveExecution(type_exe);  

    const textarea = textareaRef.current;
    let textToExecute = textData;

    if (textarea) {
      const text = textarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
        // Case 1: If user selected text
        textToExecute = text.substring(start, end).trim();
      } else {
        // Case 2: No selection, extract nearest SQL statement
        let startIndex = text.lastIndexOf(';', start - 1);
        startIndex = startIndex === -1 ? 0 : startIndex + 1;

        let endIndex = text.indexOf(';', start);
        endIndex = endIndex === -1 ? text.length : endIndex;

        textToExecute = text.substring(startIndex, endIndex).trim();
      }
    }


    textToExecute = textToExecute
      .replace(/\s*\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!textToExecute) {
      alert('No valid text selected to execute.');
        setActiveExecution(null);
      return;
    }

    const encrytionData =
      sessionStorage.getItem(selectedConnection) ||
      localStorage.getItem(selectedConnection);

    const requestData = {
      textData: textToExecute,
      type_exe,
      selectedConnection,
      encrytionData,
    };

    console.log('Executing:', requestData);

    try {
      const response = await fetch('http://192.168.1.200:7000/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Success:', response.status);
      const responseData = await response.json();

      console.log('Response Data:', responseData);
      console.log('Response Data:', responseData.message);
      console.log('Response Data:', responseData.data);
      console.log("error>>>>>>", responseData.error)



      if (responseData.execution_type === 'multiple' && Array.isArray(responseData.all_results)) {
        const messages = responseData.all_results.map((res) => ({
          message: res.message,
          row_count: res.row_count,
          affected_rows: res.affected_rows,
          error: res.error,
        }));
        setConsoleMessages((prev) => [...prev, ...messages]);
         if (messages.some((m) => m.error)) {
          consoleRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
          tableRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (responseData.execution_type === 'single') {
        const singleMessage = {
          message: responseData.message,
          row_count: responseData.row_count,
          affected_rows: responseData.affected_rows,
          error: responseData.error,
        };
        setConsoleMessages((prev) => [...prev, singleMessage]);
          if (responseData.error) {
          consoleRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
          tableRef.current?.scrollIntoView({ behavior: 'smooth' });
        }

      } else if (responseData.error) {
        const errorMessage = {
          error: responseData.error,
        };
        setConsoleMessages((prev) => [...prev, errorMessage]);
        consoleRef.current?.scrollIntoView({ behavior: 'smooth' });
      }


      setTableDataObject(responseData.data || []);
      console.log('consoleMessages', consoleMessages)
      console.log(responseData)


    } catch (err) {

      console.error('Execution failed:', err);
      consoleRef.current?.scrollIntoView({ behavior: 'smooth' });
    }finally {
    setActiveExecution(null);
  }
  };

  const handleFocusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const tableColumns = useMemo(() => {
    if (!tableDataObject || tableDataObject.length === 0) return [];

    return Object.keys(tableDataObject[0]).map((key) => ({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1),
    }));
  }, [tableDataObject]);


  const table = useMantineReactTable({
    columns: tableColumns.map((col) => ({
      ...col,
      // Cell: ({ cell }) => <div className="text-center">{cell.getValue()}</div>,
      // mantineTableHeadCellProps: {
      //   className: 'text-center px-6 py-3',  // 🔼 More horizontal spacing
      //   // style: { textAlign: 'center' },
      // },
      // mantineTableBodyCellProps: {
      //   className: 'text-center px-6 py-2',  // 🔼 More horizontal spacing
      //   // style: { textAlign: 'center' },
      // },
    })),

    data: tableDataObject,

    initialState: {
      pagination: { pageSize: 30 },
      density: 'compact',
      columnSizing: {
        id: 60,
        name: 150,
      },
    },

    mantineTableProps: {
      striped: true,
      highlightOnHover: true,
      className: 'table-auto w-full border-collapse',
    },

    mantineTableContainerProps: {
      className: [
        '[&>table>thead>tr>th:first-child]:pl-6',
        '[&>table>thead>tr>th:last-child]:pr-6',
        '[&>table>tbody>tr>td:first-child]:pl-6',
        '[&>table>tbody>tr>td:last-child]:pr-6',
        '[&>table>thead>tr>th]:border',
        '[&>table>tbody>tr>td]:border',
        '[&>table>thead>tr>th]:border-slate-200',
        '[&>table>tbody>tr>td]:border-slate-200',
      ].join(' '),
    },
  });



  return (
    <div className=''>

      <div className='py-2 mx-8 flex justify-between items-center'>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {sheets.map((sheet) => (
            <button
              key={sheet}
              onClick={() => setActiveSheet(sheet)}
              className={`px-3 py-1 text-[18px] border  ${sheet === activeSheet
                ? 'bg-purple-600 text-white'
                : 'border-purple-600'
                } hover:border-b hover:border-b-cyan-50 hover:border-t-cyan-50 transition-colors duration-300`}
            >
              {sheet}
            </button>
          ))}
          <button
            onClick={addSheet}
            className="px-3 py-1 text-[18px] border  border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-colors duration-300 flex items-center gap-1"
          >
            <Plus size={18} /> Add
          </button>
        </div>


        <div className='mb-4 flex flex-wrap items-center gap-2'>


          <button
            onClick={() => executeData('single')}
            disabled={activeExecution !== null && activeExecution !== 'single'}
            className='px-3 py-1 text-[18px] cursor-pointer border border-purple-600  hover:border-b hover:border-b-cyan-50 hover:border-t-cyan-50 transition-colors duration-500'
          >
            Execute
          </button>
          <button
            onClick={() => executeData('multiple')}
             disabled={activeExecution !== null && activeExecution !== 'multiple'}
            className='px-3 py-1 text-[18px] cursor-pointer border border-purple-600  hover:border-b hover:border-b-cyan-50 hover:border-t-cyan-50 transition-colors duration-500'

          >
            Exe. All
          </button>
          <button
            onClick={() => executeData('stop')}
            disabled={activeExecution !== null && activeExecution !== 'download'}
            className='px-3 py-1 text-[18px] cursor-pointer border border-red-600  hover:border-b hover:border-b-cyan-50 hover:border-t-cyan-50 transition-colors duration-500'

          >
            Stop Query
          </button>
          <button
            onClick={() => executeData('download')}
            className='px-3 py-1 text-[18px] cursor-pointer border border-green-600  hover:border-b hover:border-b-cyan-50 hover:border-t-cyan-50 transition-colors duration-500'

          >
            Download
          </button>
        </div>
      </div>

      <div className='flex justify-evenly'>

        <Leftbar
          selectedConnection={selectedConnection}
          setSelectedConnection={setSelectedConnection}
        />

        <form>
          <textarea
            ref={textareaRef}
            onClick={expandSelection}
            className='flex outline-none border-gray-200 m-5 p-6 border rounded w-[80vw] selection:bg-purple-300 '
            rows={15}
            cols={130}
            id='query'
            name='query'
            value={textData}
            onChange={(e) => setTextData(e.target.value)}

          />
        </form>
        
        <div className='fixed top-36 right-10 flex flex-col gap-4'>
          <div className='cursor-pointer '
            onClick={handleFocusTextarea}>
            <img src={Paper} alt="" className='w-7 h-7' />
          </div>
          <div
            className='cursor-pointer'
            onClick={() => {
              if (tableRef.current) {
                tableRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <img src={Table} alt="" className='w-7 h-7' />
          </div>

          <div className='cursor-pointer 'onClick={() => setShowRightbar(!showRightbar)}>
            <img src={Stack} alt="" className='w-8 h-8' />
          </div>

          <div className='cursor-pointer '>
            <button onClick={deleteActiveSheet}>

              <img src={delete_img} alt="" className='w-8 h-8' />
            </button>
          </div>
        </div>



      </div>
 

      {/* <h2 className='font-bold text-slate-800 mx-5'>Console Messages</h2>
      <div className='border border-slate-300 p-3 m-5 rounded h-[25vh] px-10 overflow-scroll scroll-smooth'>
        
        <div>

          {consoleMessages.map((item, index) => (
            <p key={index} className='text-green-600'>
              <b className='text-slate-600'>Message:</b> {item.message}    row_count: {item.row_count}    affected_rows: {item.affected_rows}
            </p>
          ))}
          </div>

        
      </div> */}
       {showRightbar && (

        <div   ref={rightbarRef}
        className="fixed top-0 right-0 h-[100vh] w-[20vw] z-50 bg-white shadow-xl rounded-l-xl">
          <Rightbar />
        </div>
      )}
      <ConsoleMessageBox consoleMessages={consoleMessages} ref={consoleRef} />

      {/* Delete sheet dialogue box */}
      {showDeleteDialog && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete <strong>"{sheetToDelete}"</strong>?</p>
            <div className="flex justify-end gap-4">
              <button onClick={cancelDelete} className="px-4 py-2 bg-purple-400  hover:bg-purple-600">Cancel</button>
              <button onClick={confirmDeleteSheet} className="px-4 py-2 bg-red-500 text-white  hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}





      {/* Mantine Table Section */}
      <div ref={tableRef} className='mt-5 mb-10 border border-slate-100 px-6 py-4'>
        <MantineReactTable table={table} />
      </div>
    </div>
  );
};

export default Home;
