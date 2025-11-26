'use client'

import React, { useState, useEffect } from 'react';
import fetchPoster from '../functions/fetchPoster';

import './poster.css';

export const Poster = ({ oMDbApi, iMDb8Api, index, lastIndex, filmName, filmYear, setVisiblePostersCount, setIsMassLoading }) => {
  const [filmData, setFilmData] = useState(null);
  const [imageUrls, setImageUrls] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => {
      fetchPoster(oMDbApi, iMDb8Api, filmName, filmYear, setFilmData)
    }, index * 1200);
  }, []);

  useEffect(() => {
    if (filmData) {
      if (Array.isArray(filmData.Poster)) {
        // console.log(filmData)
        setImageUrls(filmData.Poster);
      }
      else {
        setImageUrls([filmData.Poster]);
      }
      setIsLoading(false)
    }
  }, [filmData]);

  useEffect(() => {
    if (!isLoading && !filmData.Poster) setVisiblePostersCount(prevCount => prevCount - 1)

    if (!isLoading && index == lastIndex) setIsMassLoading(false)
  }, [isLoading])

  const handleDisplay = (event) => {
    let image = event.target.firstChild || event.target
    if (image.style.display === 'block' || image.style.display === '') {
      image.style.display = 'none'
      setVisiblePostersCount(prevCount => prevCount - 1);
    } else {
      image.style.display = 'block'
      setVisiblePostersCount(prevCount => prevCount + 1);
    }
  }
  const handleReload = () => {
    fetchPoster(oMDbApi, iMDb8Api, filmName, filmYear, setFilmData)
  }

  return (
    <div className='poster cursor-pointer' onClick={handleDisplay} >
      {Array.isArray(imageUrls) ? (
        <img className="poster" srcSet={imageUrls.length > 1 ? imageUrls.join(", ") : imageUrls[0]} alt="Image" onError={() => setVisiblePostersCount(prev => prev - 1)}/>
      ) : (
        <div className="loading" onClick={handleReload}>Loading...</div>
      )}
    </div>
  );
}
