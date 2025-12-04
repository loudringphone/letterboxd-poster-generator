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
    setIsMassLoading(false)
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


  const oMDbApiRef = useRef(null);
  const iMDb8ApiRef = useRef(null);
  const [oMDbApi, setOMDbApi] = useState(null);
  const [iMDb8Api, setIMDb8Api] = useState(null);
  const [isMassLoading, setIsMassLoading] = useState(false);

  const confirmAPIs = () => {
    if (selectedMonth=='all') alert('Please select a month to generate your monthly poster collage.')

    const oMDbApiVal = oMDbApiRef.current.value
    const iMDb8ApiVal = iMDb8ApiRef.current.value

    if ((oMDbApiVal == oMDbApi && iMDb8ApiVal == iMDb8Api) ||
        (oMDbApiVal == process.env.REACT_APP_PASSCODE && oMDbApi == process.env.REACT_APP_OMDB_API && iMDb8Api == process.env.REACT_APP_IMDB8_API) ||
        (iMDb8ApiVal == process.env.REACT_APP_PASSCODE && oMDbApi == process.env.REACT_APP_OMDB_API && iMDb8Api == process.env.REACT_APP_IMDB8_API)
    ) return

    if (isMassLoading) return

    if (oMDbApiVal == process.env.REACT_APP_PASSCODE || iMDb8ApiVal == process.env.REACT_APP_PASSCODE) {
      if (oMDbApiVal && oMDbApiVal != process.env.REACT_APP_PASSCODE)
        setOMDbApi(oMDbApiVal)
      else
        setOMDbApi(process.env.REACT_APP_OMDB_API)
      if (iMDb8ApiVal && iMDb8ApiVal != process.env.REACT_APP_PASSCODE)
        setIMDb8Api(iMDb8ApiVal)
      else
        setIMDb8Api(process.env.REACT_APP_IMDB8_API)
    } else {
      setOMDbApi(oMDbApiVal)
      setIMDb8Api(iMDb8ApiVal)
    }

    setVisiblePostersCount(filteredCSV.length)
  }

  const canvasRef = useRef(null);
  useEffect(() => {
    if (filteredCSV && selectedMonth != 'all') {
      if (filteredCSV.length < 4)
        setColumnCount(filteredCSV.length)
      else
        setColumnCount(4)
    }
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, 0, 0);
    }
  }, [filteredCSV])

  const [useRatio1by1, setUseRatio1by1] = useState(true);
  const [showMonth, setShowMonth] = useState(true);

  const generateImage = () => {
    if (isMassLoading) return

    const canvas = canvasRef.current;

    if (selectedMonth == 'all' || (oMDbApi == null && iMDb8Api == null) || visiblePostersCount == 0) {
      canvas.width = 0;
      canvas.height = 0;
      return
    }
    const posters = document.querySelectorAll('img.poster');
    const visiblePosters = Array.from(posters).filter(p => {
      return !p.classList.contains('grayscale');
    });

    const context = canvas.getContext('2d');
    const posterWidth = 230
    const posterHeight = 345
    const gap = 15
    const finalColumnCount = Math.min(columnCount, visiblePosters.length)
    const standardWidth = posterWidth * finalColumnCount + gap * (finalColumnCount + 1);
    const rowCount = Math.ceil((visiblePosters.length) / finalColumnCount);
    const standardHeight = posterHeight * rowCount + gap * (rowCount + 1);
    let canvasWidth = standardWidth
    let canvasHeight = standardHeight

    if (useRatio1by1) {
      if (canvasWidth > canvasHeight)
        canvasHeight = canvasWidth;
      else
        canvasWidth = canvasHeight
    }

    const fontSize = 24;
    canvas.width = canvasWidth;
    canvas.height = showMonth ? canvasHeight + fontSize : canvasHeight;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvasWidth, canvas.height);

    let imageCoordinates = [];

    let row = 0
    let column = 0
    for (let i = 0; i < visiblePosters.length; i++) {
      if (i != 0 && i%finalColumnCount == 0) {
        row = row + 1
        column = 0
      }
      const srcSet = visiblePosters[i].srcset
      let x = gap + column * (posterWidth + gap);
      let y = gap + row * (posterHeight + gap);
      if (useRatio1by1) {
        x += (canvasWidth - standardWidth)/2
        y += (canvasHeight - standardHeight)/2
      }
      imageCoordinates.push({ srcSet: srcSet, x: x, y: y})
      column = column + 1
    }

    const borderRadius = 8;
    const borderColor = '#89a';
    const boxShadowColor = 'rgba(20, 24, 28, 0.125)';
    const borderWidth = 1;
    const promises = imageCoordinates.map(({ srcSet, x, y }) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          context.save();

          // Rounded rectangle path
          context.beginPath();
          context.moveTo(x + borderRadius, y);
          context.lineTo(x + posterWidth - borderRadius, y);
          context.quadraticCurveTo(x + posterWidth, y, x + posterWidth, y + borderRadius);
          context.lineTo(x + posterWidth, y + posterHeight - borderRadius);
          context.quadraticCurveTo(x + posterWidth, y + posterHeight, x + posterWidth - borderRadius, y + posterHeight);
          context.lineTo(x + borderRadius, y + posterHeight);
          context.quadraticCurveTo(x, y + posterHeight, x, y + posterHeight - borderRadius);
          context.lineTo(x, y + borderRadius);
          context.quadraticCurveTo(x, y, x + borderRadius, y);
          context.closePath();

          // Clip image
          context.clip();
          context.drawImage(img, x, y, posterWidth, posterHeight);
          context.restore();

          // Draw border
          context.beginPath();
          context.moveTo(x + borderRadius, y);
          context.lineTo(x + posterWidth - borderRadius, y);
          context.quadraticCurveTo(x + posterWidth, y, x + posterWidth, y + borderRadius);
          context.lineTo(x + posterWidth, y + posterHeight - borderRadius);
          context.quadraticCurveTo(x + posterWidth, y + posterHeight, x + posterWidth - borderRadius, y + posterHeight);
          context.lineTo(x + borderRadius, y + posterHeight);
          context.quadraticCurveTo(x, y + posterHeight, x, y + posterHeight - borderRadius);
          context.lineTo(x, y + borderRadius);
          context.quadraticCurveTo(x, y, x + borderRadius, y);
          context.closePath();

          // Shadow effect (simulated inset)
          context.shadowColor = boxShadowColor;
          context.shadowBlur = 0;
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;

          context.strokeStyle = borderColor;
          context.lineWidth = borderWidth;
          context.stroke();

          resolve();
        };
        img.onerror = () => reject(`Failed to load image: ${srcSet}`);
        img.srcset = srcSet;
      });
    });

    if (showMonth && selectedMonth !== 'all') {
      context.save();
      context.fillStyle = '#9ab'; // text color
      context.font = `bold ${fontSize}px Helvetica, Arial, sans-serif`; // font size & family
      context.textAlign = 'right'; // horizontal alignment
      context.textBaseline = 'top'; // vertical alignment

      // Position: center horizontally, small padding from top
      const x = canvasWidth - gap;
      const y = (canvasHeight - standardHeight)/2 + (row+1) * (posterHeight + gap) + gap/2;
      const displayMonth = selectedMonth.replace(/([a-zA-Z]+)(\d+)/, '$1 $2');
      context.fillText(displayMonth, x, y);

      context.restore();
    }

    Promise.all(promises)
  };

  const downloadImage = (event) => {
    const canvas = event.target
    const dataURL = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = selectedMonth + '.png';
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
                ref={oMDbApiRef}
                onKeyDown={(e) => {if (e.key === "Enter") confirmAPIs()}}
              />
            </div>
            <div id="IMDb8api">
              <label htmlFor="IMDb8api" className='text-nowrap'>IMDb8 API: </label>
              <input
                className='w-20'
                type="password"
                ref={iMDb8ApiRef}
                onKeyDown={(e) => {if (e.key === "Enter") confirmAPIs()}}
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
            <div id='column-counter' className='mr-4'>
              <label htmlFor='columnCounter' className='text-nowrap'>Cols: </label>
              <input
                className='w-9 text-center'
                type='number'
                value={columnCount}
                onChange={handleColumnCountChange}
                min='1'
                max='10'
              />
            </div>
            <div id='poster-counter'>
              <p>{selectedMonth == 'all' || (oMDbApi == null && iMDb8Api == null)  ? 'Films' : 'Posts'}: <span> {visiblePostersCount} </span> </p>
            </div>
          </div>

          <button className={`mt-4 ${isMassLoading ? 'cursor-wait' : 'btn'}`} onClick={confirmAPIs}>{isMassLoading ? 'Fetching posters...' : 'Click Here to confrim API keys'}</button>

          <div className='preview'>
            <div id='poster-list' ref={posterListRef}>
              {oMDbApi !== null && iMDb8Api !== null  && selectedMonth !== 'all' && (
                filteredCSV.map((row, index) => {
                  const date = new Date(row['Watched Date']);
                  const monthYear = `${getMonthName(date.getMonth())}${date.getFullYear().toString().slice(-2)}`;
                  if (monthYear === selectedMonth) {
                      return (
                        <Poster
                          key={`${index}-${oMDbApi}-${iMDb8Api}`}
                          oMDbApi={oMDbApi}
                          iMDb8Api={iMDb8Api}
                          index={index}
                          lastIndex = {filteredCSV.length-1}
                          filmName={row.Name}
                          filmYear={row.Year}
                          setVisiblePostersCount={setVisiblePostersCount}
                          setIsMassLoading={setIsMassLoading}
                        />
                      );
                  } else {
                    return null;
                  }
                })
              )}
            </div>
          </div>

          <div className='mb-4 flex items-center space-x-6'>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={useRatio1by1}
                onChange={(e) => setUseRatio1by1(e.target.checked)}
                className='mr-2'
              />
              Use Ratio 1:1
            </label>

            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={showMonth}
                onChange={(e) => setShowMonth(e.target.checked)}
                className='mr-2'
              />
              Show Month
            </label>
          </div>

          <button id='canvas-btn' className={`mb-4 ${isMassLoading ? 'cursor-wait' : 'btn'}`} onClick={generateImage}>{isMassLoading ? 'Fetching posters...' : 'Click Here to Generate Poster Collage'}</button>
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