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
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef}/>
      <button onClick={handleClear}>Clear</button>
    </div>
  );
};