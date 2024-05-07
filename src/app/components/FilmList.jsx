'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Poster } from './Poster';
import './poster.css';

export const FilmList = ({ csvData }) => {
  const [filteredCSV, setFilteredCSV] = useState(csvData)
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [uniqueMonths, setUniqueMonths] = useState([]);
  const getMonthName = (monthIndex) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthIndex];
  };

  const filterMonth = (row, selectedMonth) => {
    const date = new Date(row['Watched Date']);
    const monthYear = `${getMonthName(date.getMonth())}${date.getFullYear().toString().slice(-2)}`;
    if (selectedMonth) {
      return monthYear === selectedMonth;
    } else {
      return monthYear
    }
  }

  useEffect(() => {
    if (csvData) {
      setFilteredCSV(csvData)
      const months = Array.from(
        new Set(csvData.slice(0, -1).map((row) => {
          return filterMonth(row)
        }))
      );
      setUniqueMonths(months);
      if (selectedMonth !== 'all') {
        setFilteredCSV(csvData.filter(((row) => {
          return filterMonth(row, selectedMonth)
        })))
      }
    } else {
      setFilteredCSV(null)
      setUniqueMonths([]);
      setSelectedMonth('all')
    }
  }, [csvData, selectedMonth]);

  const [visiblePostersCount, setVisiblePostersCount] = useState(0)
  useEffect(() => {
    if (filteredCSV) {
      setVisiblePostersCount(filteredCSV.length)
    }
  }, [filteredCSV])

  const [columnCount, setColumnCount] = useState(4);
  const posterListRef = useRef(null);
  const handleColumnCountChange = (event) => {
    let value = parseInt(event.target.value)
    if (value > 9) {
      value = 9
    }
    setColumnCount(value);
  };
  useEffect(() => {
    if (posterListRef.current) {
      posterListRef.current.style.gridTemplateColumns = `repeat(${columnCount}, 37.5px)`;
    }
  }, [columnCount])

const [oMDbApi, setOMDbApi] = useState('');
const [iMDb8Api, setIMDb8Api] = useState('');

  const handleOMDbApi = (event) => {
    const value = event.target.value
    if (value === process.env.REACT_APP_PASSCODE) {
      setOMDbApi(process.env.REACT_APP_OMDB_API)
    } else {
      setOMDbApi(value)
    }
  }
  const handleIMDb8Api = (event) => {
    const value = event.target.value
    if (value === process.env.REACT_APP_PASSCODE) {
      setIMDb8Api(process.env.REACT_APP_IMDB8_API)
    } else {
      setIMDb8Api(value)
    }
  }

  const canvasRef = useRef(null);
  useEffect(() => {
    if (filteredCSV && selectedMonth != 'all') {
      if (filteredCSV.length < 4) {
        setColumnCount(filteredCSV.length)
      } else {
        setColumnCount(4)
      }
    }
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, 0, 0);
    }
  }, [filteredCSV])

  const generateImage = () => {
    const posters = document.querySelectorAll('img.poster');
    const visiblePosters = Array.from(posters).filter(p => {
      const computedStyle = window.getComputedStyle(p);
      return computedStyle.display !== 'none' && p.getAttribute('src');
    });

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const posterWidth = 300
    const posterHeight = 420
    const canvasWidth = posterWidth * columnCount;
    const canvasHeight = posterHeight * Math.ceil((visiblePosters.length) / columnCount);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    let imageCoordinates = [];

    let row = 0
    let column = 0
    for (let i = 0; i < visiblePosters.length; i++) {
      if (i != 0 && i%columnCount == 0) {
        row = row + 1
        column = 0
      }
      const src = visiblePosters[i].src
      const x = column * posterWidth
      const y = row * posterHeight
      imageCoordinates.push({ src: src, x: x, y: y})
      column = column + 1
    }

    const promises = imageCoordinates.map(({ src, x, y }) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          context.drawImage(img, x, y, posterWidth, posterHeight);
          resolve();
        };
        img.onerror = () => reject(`Failed to load image: ${src}`);
        img.src = src;
      });
    });

    Promise.all(promises)
        // .then(() => {
        //     const imageDataURL = canvas.toDataURL();
        //     console.log(imageDataURL);
        // })
        // .catch(error => {
        //     console.error(error);
        // });
  };

  const downloadImage = (event) => {
    const canvas = event.target
    const dataURL = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'canvas_image.png';
    downloadLink.click();
  }

  return (
    <div>
     {uniqueMonths.length > 0 ? (
        <div className='diary'>
          <div className='btns flex px-4 mt-4 justify-center'>
            <div id="OMDbApi" className='mr-4'>
              <label htmlFor="OMDbApi">OMDb API: </label>
              <input
                className='w-20'
                type="password"
                autocomplete='on'
                value={oMDbApi}
                onChange={handleOMDbApi}
              />
            </div>
            <div id="IMDb8api">
              <label htmlFor="IMDb8api" className='text-nowrap'>IMDb8 API: </label>
              <input
                className='w-20'
                type="password"
                autocomplete='on'
                value={iMDb8Api}
                onChange={handleIMDb8Api}
              />
            </div>
          </div>
          <div className='btns flex px-4 mt-4 justify-center'>
            <div id='month-selector' className='mr-4'>
              <label htmlFor="monthSelector" className='text-nowrap'>Month: </label>
              <select className='w-[65px]' onChange={(e) => setSelectedMonth(e.target.value)}>
                <option value="all">All</option>
                {uniqueMonths.map((month, i) => (
                  <option key={i} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div id="column-counter" className='mr-4'>
              <label htmlFor="columnCounter" className='text-nowrap'>Cols: </label>
              <input
                className='w-9 text-center'
                type="number"
                value={columnCount}
                onChange={handleColumnCountChange}
                min="1"
                max="10"
              />
            </div>
            <div id="poster-counter">
              <p>{selectedMonth == 'all' || oMDbApi !== process.env.REACT_APP_OMDB_API || iMDb8Api !== process.env.REACT_APP_IMDB8_API  ? 'Films' : 'Posts'}: <span> {visiblePostersCount} </span> </p>
            </div>
          </div>
          <div className='preview'>
            <div id='poster-list' ref={posterListRef}>
              {oMDbApi == process.env.REACT_APP_OMDB_API && iMDb8Api == process.env.REACT_APP_IMDB8_API  && selectedMonth !== 'all' && (
                filteredCSV.map((row, index) => {
                  const date = new Date(row['Watched Date']);
                  const monthYear = `${getMonthName(date.getMonth())}${date.getFullYear().toString().slice(-2)}`;
                  if (monthYear === selectedMonth) {
                      return <Poster key={index} oMDbApi={oMDbApi} iMDb8Api={iMDb8Api} delay={index} filmName={row.Name} filmYear={row.Year} setVisiblePostersCount={setVisiblePostersCount} />;
                  } else {
                    return null;
                  }
                })
              )}
            </div>
          </div>

          <button id='canvas-btn' className='mb-4' onClick={generateImage}>Click Here to Generate Image</button>
          <canvas ref={canvasRef} onClick={downloadImage} className='w-[100%] h-[auto] cursor-pointer mb-4' />


          <div id='csv-data' className='px-4 '>
            <p>CSV data:</p>
            <table className='border-spacing-x-4'>
              <thead>
                <tr className='text-left'>
                  <th className='pr-3 py-1'>Date</th>
                  <th className='pr-3 py-1'>Name</th>
                  <th className='pr-3 py-1'>Year</th>
                </tr>
              </thead>
              <tbody>
                {filteredCSV.map((row, index) => (
                  <tr key={index} className='border-t-2 border-dashed'>
                    <td className='pr-3 py-1'>{row['Watched Date']}</td>
                    <td className='pr-3 py-1'>{row.Name}</td>
                    <td className='pr-3 py-1'>{row.Year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};