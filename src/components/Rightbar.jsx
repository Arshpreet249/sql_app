import React from 'react'


const Rightbar = () => {
  return (
    <div className="h-full w-full bg-gray-50 p-8 rounded-l-xl shadow-md">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">Databases</h2>
      <ul className="space-y-4 font-medium text-gray-800">
        <li className="px-4 py-2 border-l-8 border-purple-600 hover:bg-purple-600 hover:text-white cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 rounded">
          MSSQL
        </li>
        <li className="px-3 py-2 border-l-8 border-purple-600 hover:bg-purple-600 hover:text-white cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 rounded">
          MySQL
        </li>
        <li className="px-4 py-2 border-l-8 border-purple-600 hover:bg-purple-600 hover:text-white cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 rounded">
          PostgreSQL
        </li>
      </ul>
    </div>
  );
};

export default Rightbar;
