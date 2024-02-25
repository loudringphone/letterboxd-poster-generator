'use client'

import React, { useState } from 'react';
import { Poster } from './components/Poster'
import { CSVUploader } from './components/CSVUploader'
import { FilmList } from './components/FilmList';

export default function Home() {
  const [csvData, setCsvData] = useState(null);

  const getCSV = (csv) => {
    setCsvData(csv)
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <CSVUploader getCSV={getCSV}/>
        <FilmList csvData={csvData}/>
      </div>
    </main>
  )
}
