

import React, { useState } from 'react';

const Rightbar = ({ summaryData, onOptionClick }) => {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (db) => {
    setOpenMenu(openMenu === db ? null : db);
  };

  const databases = Object.entries(summaryData || {}).map(([schemaName, schemaObj]) => ({
    name: schemaName,
    tables: schemaObj.tables || [],
    views: schemaObj.views || [],
  }));

  return (
    <div className="h-full w-full bg-gray-50 p-8 rounded-l-xl shadow-md  overflow-y-scroll">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">Schemas</h2>
      <ul className="space-y-4 font-medium text-gray-800 ">
        {databases.map((db) => (
          <li key={db.name} className=" group">
            {/* Schema Name */}
            <div
              className="flex justify-between items-center px-4 py-2 border-l-8 border-purple-600 hover:bg-purple-600 hover:text-white cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 rounded"
              onClick={() => toggleMenu(db.name)}
            >
              {db.name}
              <span className="ml-2">{openMenu === db.name ? '<' : '>'}</span>
            </div>

            {/* Submenu with Tables + Views */}
            {openMenu === db.name && (
              <ul className="border-l border-gray-300 rounded-l-xl overflow-y-auto p-3  top-5 absolute max-h-[95vh] min-w-38 bg-white right-full">
                {/* Tables */}
                {db.tables.length > 0 && (
                  <>
                    <li className="px-4 py-2 font-semibold bg-purple-400 rounded">Tables</li>
                    {db.tables.map((table) => (
                      <li
                        key={table}
                        onClick={() => onOptionClick({ dbName: db.name, option: table })}
                        className="px-4 py-2 hover:bg-purple-300 cursor-pointer transition duration-300"
                      >
                        {table}
                      </li>
                    ))}
                  </>
                )}

                {/* Views */}
                {db.views.length > 0 && (
                  <>
                    <li className="px-4 py-2 font-semibold bg-purple-400 rounded">Views</li>
                    {db.views.map((view) => (
                      <li
                        key={view}
                        onClick={() => onOptionClick({ dbName: db.name, option: view })}
                        className="px-4 py-2 hover:bg-purple-300 cursor-pointer transition duration-300"
                      >
                        {view}
                      </li>
                    ))}
                  </>
                )}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Rightbar;

