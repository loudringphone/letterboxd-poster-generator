'use client'

import React, { useRef } from 'react';
import Papa from 'papaparse';

export const CsvUploader = ({ setCsvData }) => {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          setCsvData(result.data);
        },
        header: true, // the CSV has a header row
      });
    }
  };

  const handleClear = () => {
    setCsvData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div id='csv-uploader' className='px-4 text-lg'>
      <input className='cursor-pointer text-white' type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef}/>
      <button className="btn" onClick={handleClear}>Clear</button>
    </div>
  );
};