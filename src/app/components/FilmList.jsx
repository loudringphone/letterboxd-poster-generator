'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Poster } from './Poster';
import './poster.css';

export const FilmList = ({ csvData }) => {
  const [filterCSV, setFilterCSV] = useState(csvData)
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [uniqueMonths, setUniqueMonths] = useState([]);

  useEffect(() => {
    if (csvData) {
      setFilterCSV(csvData)
      const months = Array.from(
        new Set(csvData.slice(0, -1).map((row) => {
          const date = new Date(row['Watched Date']);
          const monthYear = `${getMonthName(date.getMonth())} ${date.getFullYear().toString().slice(-2)}`;
          return monthYear;
        }))
      );
      setUniqueMonths(months);
    } else {
      setFilterCSV(null)
      setUniqueMonths([]);
    }
    setSelectedMonth('all')
  }, [csvData]);

  const getMonthName = (monthIndex) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthIndex];
  };

  const [manualHidden, setManualHidden] = useState(0)

  useEffect(() => {
    setManualHidden(0)
    if (selectedMonth == 'all') {
      setFilterCSV(csvData)
    } else {
      setFilterCSV(csvData.filter(((row) => {
        const date = new Date(row['Watched Date']);
        const monthYear = `${getMonthName(date.getMonth())} ${date.getFullYear().toString().slice(-2)}`;
        return monthYear == selectedMonth
      })))
    }
  }, [selectedMonth]);

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

  const [api, setApi] = useState('');

  const handleApi = (event) => {
    setApi(event.target.value)
  }

  const canvasRef = useRef(null);
  const [posterCount, setPosterCount] = useState(0);
  const posterCounter = useRef(null)
  useEffect(() => {
    const posterCounterElement = posterCounter.current
    if (posterCounterElement && filterCSV && selectedMonth != 'all') {
      setPosterCount(filterCSV.length)
      posterCounterElement.style.visibility = 'visible'
      if (filterCSV.length < 4) {
        setColumnCount(filterCSV.length)
      } else {
        setColumnCount(4)
      }
    } else if (posterCounterElement) {
      posterCounterElement.style.visibility = 'hidden'
    }
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, 0, 0);
    }
  }, [filterCSV])
  const handlePosterCountChange = (event) => {
    let value = parseInt(event.target.value)
    if (selectedMonth != 'all' && value > filterCSV.length) {
      value = filterCSV.length
    } else if (selectedMonth == 'all') {
      value = ''
    }
    setPosterCount(value);
    setManualHidden(0)
    if (value != '') {
      const posters = document.querySelectorAll('img.poster');
      for (let i = 0; i < posters.length; i++) {
        if (i < value) {
          posters[i].style.display = 'block'
        } else {
          posters[i].style.display = 'none'
        }
      }
    }
  };

  const generateImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const posterWidth = 300
    const posterHeight = 420
    const canvasWidth = posterWidth * columnCount;
    const canvasHeight = posterHeight * Math.ceil((posterCount - manualHidden) / columnCount);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    let imageCoordinates = [];
    const posters = document.querySelectorAll('img.poster');
    const visiblePosters = Array.from(posters).filter(p => {
      const computedStyle = window.getComputedStyle(p);
      return computedStyle.display !== 'none';
    });
    console.log(visiblePosters)
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
          <div className='btns'>

            <div id='month-selector'>
              <label>Month: </label>
              <select onChange={(e) => setSelectedMonth(e.target.value)}>
                <option value="all">All</option>
                {uniqueMonths.map((month, i) => (
                  <option key={i} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="api">OMDb API: </label>
              <input
                id="password"
                type="password"
                value={api}
                onChange={handleApi}
              />
            </div>
            <div ref={posterCounter}>
              <label htmlFor="posterCounter">Posters: </label>
              <input
                id="poster-counter"
                type="number"
                value={posterCount}
                onChange={handlePosterCountChange}
                min="1"
              />
            </div>
            <div>
              <label htmlFor="columnCount">Columns: </label>
              <input
                id="column-count"
                type="number"
                value={columnCount}
                onChange={handleColumnCountChange}
                min="1"
                max="10"
              />
            </div>
          </div>
          <div className='preview'>
            <label htmlFor="preview">Preview: </label>
            <div id='poster-list' ref={posterListRef}>
              {api == process.env.REACT_APP_OMDB_API && selectedMonth !== 'all' && (
                filterCSV.map((row, index) => {
                  const date = new Date(row['Watched Date']);
                  const monthYear = `${getMonthName(date.getMonth())} ${date.getFullYear().toString().slice(-2)}`;
                  if (monthYear === selectedMonth) {
                      return <Poster key={index} api={api} delay={index} filmName={row.Name} filmYear={row.Year} manualHidden={manualHidden} setManualHidden={setManualHidden} />;
                  } else {
                    return null;
                  }
                })
              )}
            </div>
          </div>

          <button id='canvas-btn' onClick={generateImage}>Click Here to Generate Image</button>
          <canvas ref={canvasRef} onClick={downloadImage} />


          <div id='csv-data'>
            <p>CSV data:</p>
            <table>
              <thead>
                <tr className='text-left'>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {filterCSV.map((row, index) => (
                  <tr key={index} className='border-t-2 border-dashed'>
                    <td>{row['Watched Date']}</td>
                    <td>{row.Name}</td>
                    <td>{row.Year}</td>
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