'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ImageList } from './ImageList';
import { Posters } from './Posters';

const DEFAULT_COLUMN_COUNT = 4

export const CollageBuilder = ({ csvData }) => {
  const [filteredCSV, setFilteredCSV] = useState(csvData);
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
      return monthYear;
    };
  };

  useEffect(() => {
    if (csvData) {
      setFilteredCSV(csvData);
      const months = Array.from(
        new Set(csvData.slice(0, -1).map((row) => {
          return filterMonth(row);
        }))
      );
      setUniqueMonths(months);
      if (selectedMonth !== 'all') {
        const urls = Array(filteredCSV.length).fill(['']);
        setPosterUrls(urls);
        setFilteredCSV(csvData.filter(((row) => {
          return filterMonth(row, selectedMonth);
        })))
      }
    } else {
      setFilteredCSV(null);
      setUniqueMonths([]);
      setSelectedMonth('all');
    }
  }, [csvData, selectedMonth]);

  const [visiblePostersCount, setVisiblePostersCount] = useState(0)
  const [colCount, setColCount] = useState(DEFAULT_COLUMN_COUNT);
  const [colInput, setColInput] = useState(DEFAULT_COLUMN_COUNT.toString());
  const posterListRef = useRef(null);

  const handleColChange = (event) => {
    let value = parseInt(event.target.value)

    if (isNaN(value)) {
      setColInput("");
      return;
    }

    if (value > 9) value = 9
    setColCount(value);
    setColInput(value.toString());
  };

  const handleColBlur = () => {
    if (colInput === "") {
      setColInput(colCount.toString());
    };
  };


  useEffect(() => {
    if (posterListRef.current)
      posterListRef.current.style.gridTemplateColumns = `repeat(${colCount}, 37.5px)`;
  }, [colCount]);


  const oMDbApiRef = useRef(null);
  const iMDb8ApiRef = useRef(null);
  const [oMDbApi, setOMDbApi] = useState(null);
  const [iMDb8Api, setIMDb8Api] = useState(null);
  const [isMassLoading, setIsMassLoading] = useState(false);

  const confirmAPIs = () => {
    if (isMassLoading) return

    const oMDbApiVal = oMDbApiRef.current.value
    const iMDb8ApiVal = iMDb8ApiRef.current.value

    const missingApiVals = (oMDbApiVal == null && iMDb8ApiVal == null) ||
                        (oMDbApiVal.length == 0 && iMDb8ApiVal.length == 0);

    let errorMessage = "";
    if (selectedMonth === 'all')
      errorMessage += "• Please select a month.\n";
    if (missingApiVals)
      errorMessage += "• Please enter at least one API key (OMDb or IMDb8).\n";

    if (errorMessage) alert(errorMessage);

    if ((oMDbApiVal == oMDbApi && iMDb8ApiVal == iMDb8Api) ||
        (oMDbApiVal == process.env.REACT_APP_PASSCODE && oMDbApi == process.env.REACT_APP_OMDB_API && iMDb8Api == process.env.REACT_APP_IMDB8_API) ||
        (iMDb8ApiVal == process.env.REACT_APP_PASSCODE && oMDbApi == process.env.REACT_APP_OMDB_API && iMDb8Api == process.env.REACT_APP_IMDB8_API)
    ) return

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
    if (filteredCSV) {
      const count = filteredCSV.length
      setVisiblePostersCount(count);
      if (count < DEFAULT_COLUMN_COUNT) {
        setColInput(count.toString())
        setColCount(count)
      } else {
        setColInput(DEFAULT_COLUMN_COUNT.toString())
        setColCount(DEFAULT_COLUMN_COUNT)
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

  const [useRatio1by1, setUseRatio1by1] = useState(true);
  const [showMonth, setShowMonth] = useState(true);

  const generateImage = () => {
    if (isMassLoading) return

    const canvas = canvasRef.current;

    const missingApis = (oMDbApi == null && iMDb8Api == null) ||
                        (oMDbApi.length == 0 && iMDb8Api.length == 0);

    let errorMessage = "";
    if (selectedMonth === 'all')
      errorMessage += "• Please select a month.\n";
    if (missingApis)
      errorMessage += "• Please enter at least one API key (OMDb or IMDb8).\n";
    if (visiblePostersCount === 0)
      errorMessage += "• No posters available to generate.\n";

    if (errorMessage) {
      alert(errorMessage);
      canvas.width = 0;
      canvas.height = 0;
      return;
    }

    const posters = document.querySelectorAll('img.poster');
    const visiblePosters = Array.from(posters).filter(p => {
      return !p.classList.contains('grayscale');
    });

    const context = canvas.getContext('2d');
    const posterWidth = 230
    const posterHeight = 345
    const gap = 15
    const finalColCount = Math.min(colCount, visiblePosters.length)
    const standardWidth = posterWidth * finalColCount + gap * (finalColCount + 1);
    const rowCount = Math.ceil((visiblePosters.length) / finalColCount);
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
      if (i != 0 && i%finalColCount == 0) {
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

  const [isDisplayPosters, setIsDisplayPosters] = useState(false);
  useEffect(() => {
    if (oMDbApi !== null && iMDb8Api !== null && selectedMonth !== 'all') {
      setIsDisplayPosters(true);
      setIsMassLoading(true);
      setVisiblePostersCount(filteredCSV.length)
    } else {
      setIsDisplayPosters(false);
    }
  }, [oMDbApi, iMDb8Api, selectedMonth]);

  const [posterUrls, setPosterUrls] = useState([]);
  useEffect(() => {
    if (isMassLoading) {
      const urls = Array(filteredCSV.length).fill(['']);
      setPosterUrls(urls)
    }
  }, [isMassLoading])

  const [showInputs, setShowInputs] = useState(false);
  const toggleInputList = () => {
    setShowInputs(prev => !prev);
  }

  return (
    <div>
     {uniqueMonths.length > 0 ? (
        <div className='diary'>
          <div className='btns flex px-4 mt-4 justify-center text-lg'>
            <div id="OMDbApi" className='mr-4'>
              <label htmlFor="OMDbApi">OMDb API: </label>
              <input
                className='w-20'
                ref={oMDbApiRef}
                disabled={isMassLoading}
                onKeyDown={(e) => {if (e.key === "Enter") confirmAPIs()}}
              />
            </div>
            <div id="IMDb8api">
              <label htmlFor="IMDb8api" className='text-nowrap'>IMDb8 API: </label>
              <input
                className='w-20'
                ref={iMDb8ApiRef}
                disabled={isMassLoading}
                onKeyDown={(e) => {if (e.key === "Enter") confirmAPIs()}}
              />
            </div>
          </div>
          <div className='btns flex px-4 mt-4 justify-center text-lg w-max-[450px]'>
            <div id='month-selector' className='mr-4'>
              <label htmlFor="monthSelector" className='text-nowrap'>Month: </label>
              <select className='w-max' onChange={(e) => setSelectedMonth(e.target.value)}>
                <option value="all">All</option>
                {uniqueMonths.map((month, i) => (
                  <option key={i} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div id='column-counter' className='mr-4'>
              <label htmlFor='colCounter' className='text-nowrap'>Cols: </label>
              <input
                className='w-9 text-center'
                type='number'
                value={colInput}
                onChange={handleColChange}
                onBlur={handleColBlur}
                min='1'
                max='9'
              />
            </div>
            <div id='poster-counter'>
              <p>{selectedMonth == 'all' || (oMDbApi == null && iMDb8Api == null)  ? 'Films' : 'Posts'}: <span> {visiblePostersCount} </span> </p>
            </div>
          </div>

          <button className={`mt-4 ${isMassLoading ? 'cursor-wait' : 'btn'}`} onClick={confirmAPIs}>{isMassLoading ? 'Fetching Posters...' : 'Confrim API Keys'}</button>

          <div className='flex mt-4'>
            { isDisplayPosters ?
                <Posters
                  key={colCount}
                  posterListRef={posterListRef}
                  colCount={colCount}
                  oMDbApi={oMDbApi}
                  iMDb8Api={iMDb8Api}
                  filteredCSV={filteredCSV}
                  setVisiblePostersCount={setVisiblePostersCount}
                  setIsMassLoading={setIsMassLoading}
                  posterUrls={posterUrls}
                  setPosterUrls={setPosterUrls}
                />
                :
                <></>
            }
          </div>

          {
            isDisplayPosters && <ImageList
                                  key={selectedMonth}
                                  isMassLoading={isMassLoading}
                                  filteredCSV={filteredCSV}
                                  posterUrls={posterUrls}
                                  setVisiblePostersCount={setVisiblePostersCount}
                                  showInputs={showInputs}
                                  toggleInputList={toggleInputList}
                                />
          }

          <div className='mt-4 flex items-center space-x-6 text-lg'>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={useRatio1by1}
                onChange={(e) => setUseRatio1by1(e.target.checked)}
                className='mr-2 cursor-pointer'
              />
              Use Ratio 1:1
            </label>

            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={showMonth}
                onChange={(e) => setShowMonth(e.target.checked)}
                className='mr-2 cursor-pointer'
              />
              Show Month
            </label>
          </div>

          <button id='canvas-btn' className={`mt-4 ${isMassLoading ? 'cursor-wait' : 'btn'}`} onClick={generateImage}>{isMassLoading ? 'Fetching Posters...' : 'Generate Poster Collage'}</button>
          <canvas ref={canvasRef} onClick={downloadImage} className='w-[100%] h-[auto] cursor-pointer mt-4' />


          <div id='csv-data' className='px-4 mt-4'>
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