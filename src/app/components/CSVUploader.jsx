'use client'

import React, { useRef } from 'react';
import Papa from 'papaparse';

export const CSVUploader = ({ getCSV }) => {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          getCSV(result.data);
        },
        header: true, // Assuming the CSV has a header row
      });
    } else {
      getCSV(null)
    }
  };

  const handleClear = () => {
    getCSV(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div id='csv-uploader' className='px-4'>
      <input className='text-white' type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef}/>
      <button className="px-1 hover:bg-gray-200 hover:text-gray-500 active:bg-gray-500 active:text-gray-200 focus:outline-none" onClick={handleClear}>Clear</button>
    </div>
  );
};