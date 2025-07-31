import React, { useEffect, useRef } from 'react';

const ConsoleMessageBox = ({ consoleMessages }) => {
  const endRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new message is added
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleMessages]);

  return (
    <>
      <h2 className='font-bold text-slate-800 mx-5'>Console Messages</h2>
      <div className='border border-slate-300 p-3 m-5 rounded h-[25vh] px-10 overflow-y-scroll overflow-x-hidden scroll-smooth'>

        {consoleMessages.map((item, index) => (
          <p key={index} className='text-green-600'>
            <b className='text-slate-600'>Message:</b> {item.message} &nbsp;
            row_count: {item.row_count} &nbsp;
            affected_rows: {item.affected_rows}
          </p>
        ))}

        {/* Invisible div to scroll to bottom */}
        <div ref={endRef} />
      </div>
    </>
  );
};

export default ConsoleMessageBox;
