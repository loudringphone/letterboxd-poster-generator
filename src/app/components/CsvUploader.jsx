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
          const data = result.data;
          const expectedHeaders = ["Date", "Name", "Year"];
          const parsedHeaders = Object.keys(data[0] || {});

          const hasAllHeaders = expectedHeaders.every(h =>
                                  parsedHeaders.includes(h)
                                );

          if (!hasAllHeaders) {
            alert("This doesn't look like a Letterboxd diary.csv file.\nPlease double-check and try again.");
            fileInputRef.current.value = null;
            setCsvData(null);
            return;
          }

          setCsvData(data);
        },
        header: true, // the CSV has a header row
        skipEmptyLines: true
      });
    }
  };

  const handleClear = () => {
    setCsvData(null);
    fileInputRef.current.value = null;
  };

  return (
    <div id='csv-uploader' className='px-4 text-lg'>
      <input className='cursor-pointer text-white' type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef}/>
      <button className="btn" onClick={handleClear}>Clear</button>
    </div>
  );
};