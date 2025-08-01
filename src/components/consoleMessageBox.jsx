import React, { useEffect, useRef } from 'react';

const ConsoleMessageBox = ({ consoleMessages }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [consoleMessages]);

 return (
    <>
      <h2 className='font-bold text-slate-800 mx-5'>Console Messages</h2>
      <div
        ref={containerRef}
        className='border border-slate-300 p-3 m-5 rounded h-[25vh] px-10 overflow-y-auto overflow-x-hidden'
      >
        {consoleMessages.map((item, index) => (
          <p key={index} className='text-green-600'>
            <b className='text-slate-600'>Message:</b> {item.message} &nbsp;
            row_count: {item.row_count} &nbsp;
            affected_rows: {item.affected_rows}
          </p>
        ))}
      </div>
    </>
  );
};


export default ConsoleMessageBox;
