import React, { useEffect, useRef, forwardRef } from 'react';

const ConsoleMessageBox = forwardRef(({ consoleMessages }, ref) => {
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
        ref={(node) => {
          containerRef.current = node;
          if (ref) ref.current = node;
        }}
        className='border border-slate-300 p-3 m-5 rounded h-[25vh] px-10 overflow-y-auto overflow-x-hidden'
      >
        {consoleMessages.map((item, index) => (
          <div key={index} className={`mb-2 ${item.error ? 'text-red-600' : 'text-green-600'}`}>
            {item.message && (
              <p>
                <b className='text-slate-600'>Message:</b> {item.message}
              </p>
            )}
            {item.error && (
              <p>
                <b className='text-slate-600'>Error:</b> {item.error}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
});

export default ConsoleMessageBox;
