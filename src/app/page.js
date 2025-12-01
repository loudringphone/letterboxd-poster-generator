'use client'

import React, { useState } from 'react';
import { Message } from './components/Message'
import { CsvUploader } from './components/CsvUploader'
import { FilmList } from './components/FilmList';

export default function Home() {
  const [csvData, setCsvData] = useState(null);

  return (
    <main className='flex flex-col py-4  w-full items-center justify-between font-mono text-sm lg:flex'>
        <h1 className='text-lg text-center mb-4'>Letterboxd Monthly Poster Collage Generator</h1>
        <Message/>
        <CsvUploader setCsvData={setCsvData}/>
        <FilmList csvData={csvData}/>
    </main>
  )
}
