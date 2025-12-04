'use client'

import React, { useRef, useState, useEffect } from 'react';
import fetchPoster from '../functions/fetchPoster';

import './poster.css';

export const Posters = ({ posterListRef, oMDbApi, iMDb8Api, filteredCSV, setVisiblePostersCount, setIsMassLoading, posterUrls, setPosterUrls }) => {
  const [loadings, setLoadings] = useState([])
  const [errors, setErrors] = useState([])

  useEffect(() => {
    const loads = Array(filteredCSV.length).fill(true);
    setLoadings(loads)

    const errs = Array(filteredCSV.length).fill(false);
    setErrors(errs)

    const controller = new AbortController();
    const { signal } = controller;

    const fetchPostersQueue = async () => {
      for (let i = 0; i < filteredCSV.length; i++) {
        const row = filteredCSV[i];
        if (signal.aborted) break; // stop if user switches month
        await fetchPoster(oMDbApi, iMDb8Api, row.Name, row.Year, (data) => {
          setLoadings(prev => {
            const newLoads = [...prev];
            newLoads[i] = false;
            return newLoads;
          });
          if (i == filteredCSV.length - 1) setIsMassLoading(false);

          if (data.Poster?.length > 0) {
            setPosterUrls(prev => {
            const newUrls = [...prev];
            newUrls[i] = Array.isArray(data.Poster) ? data.Poster : [data.Poster];
            return newUrls;
            });
          } else {
            setVisiblePostersCount(prevCount => prevCount - 1)
            setErrors(prev => {
            const newErrs = [...prev];
            newErrs[i] = true;
            return newErrs;
            });
          }
        }, signal);
      }
    };

    fetchPostersQueue();

    return () => {
      controller.abort();
    };
  }, [oMDbApi, iMDb8Api, filteredCSV]);

  const toggleDisplay = (event) => {
    let image = event.target.firstChild || event.target
    if (image.tagName != 'IMG') return

    if (image.classList.contains('grayscale')) {
      image.classList.remove('grayscale')
      setVisiblePostersCount(prevCount => prevCount + 1)
    } else {
      image.classList.add('grayscale')
      setVisiblePostersCount(prevCount => prevCount - 1)
    }
  }

  return (
    <div id='poster-list' ref={posterListRef}>
      {filteredCSV.map((row, idx) => (
        <div key={`${idx}-${oMDbApi}-${iMDb8Api}`}
             className='poster cursor-pointer'
             onClick={toggleDisplay}
        >
          {!loadings[idx] ? (
            <img
              id={`poster${idx}`}
              className={`poster ${errors[idx] ? 'grayscale' : ''}`}
              srcSet={
                      posterUrls?.[idx]?.length > 1
                        ? posterUrls[idx].join(", ")
                        : posterUrls?.[idx]?.[0] || ""
                     }
              alt="Image"
              onError={(e) => {
                setVisiblePostersCount(prev => prev - 1);
                setErrors(prev => {
                  const newErrs = [...prev];
                  newErrs[idx] = true;
                  return newErrs;
                });
              }}
            />
          ) : (
            <div className="loading" onClick={()=>{
              fetchPoster(oMDbApi, iMDb8Api, row.Name, row.Year, setFilmData)
            }}>Loading...</div>
          )}
        </div>
      ))}
    </div>
  );
}
