'use client'

import React, { useState } from 'react';
import { Message } from './components/Message'
import { CSVUploader } from './components/CSVUploader'
import { FilmList } from './components/FilmList';

export default function Home() {
  const [csvData, setCsvData] = useState(null);

  return (
    <main className='flex flex-col py-4  w-full items-center justify-between font-mono text-sm lg:flex'>
        <h1 className='text-lg text-center'>Letterboxd Diary Film Poster</h1>
        <h1 className='text-lg text-center mb-4'>Generator</h1>
        <Message/>
        <CSVUploader setCsvData={setCsvData}/>
        <FilmList csvData={csvData}/>
    </main>
  )
}
