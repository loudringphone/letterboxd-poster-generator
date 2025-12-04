'use client'

import React, { useState } from 'react';
import { Message } from './components/Message'
import { CsvUploader } from './components/CsvUploader'
import { CollageBuilder } from './components/CollageBuilder';

export default function Home() {
  const [csvData, setCsvData] = useState(null);

  return (
    <main className='flex flex-col p-4  w-full items-center justify-between font-mono text-sm lg:flex'>
        <h1 className='text-xl text-center mb-4'>Letterboxd Monthly Poster Collage Generator</h1>
        <Message/>
        <CsvUploader setCsvData={setCsvData}/>
        <CollageBuilder csvData={csvData}/>
    </main>
  )
}
