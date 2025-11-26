'use client'

import React, { useState, useEffect } from 'react';
import fetchPoster from '../functions/fetchPoster';

import './poster.css';

export const Poster = ({ oMDbApi, iMDb8Api, index, lastIndex, filmName, filmYear, setVisiblePostersCount, setIsMassLoading }) => {
  const [filmData, setFilmData] = useState(null);
  const [imageUrls, setImageUrls] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    setIsMassLoading(true)
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
    if (!isLoading && (imageUrls == null || imageUrls[0] == undefined)) {
      setVisiblePostersCount(prevCount => prevCount - 1)
      setIsError(true)
    }

    if (!isLoading && index == lastIndex) setIsMassLoading(false)
  }, [isLoading])

  const toggleDisplay = (event) => {
    let image = event.target.firstChild || event.target
    if (image.classList.contains('grayscale')) {
      image.classList.remove('grayscale')
      setVisiblePostersCount(prevCount => prevCount + 1)
    } else {
      image.classList.add('grayscale')
      setVisiblePostersCount(prevCount => prevCount - 1)
    }
  }

  return (
    <div className='poster cursor-pointer' onClick={toggleDisplay} >
      {Array.isArray(imageUrls) ? (
        <img
          className={`poster ${isError ? 'grayscale' : ''}`}
          srcSet={imageUrls.length > 1 ? imageUrls.join(", ") : imageUrls[0]}
          alt="Image"
          onError={(e) => {
            setVisiblePostersCount(prev => prev - 1);
            setIsError(true)
          }}
        />
      ) : (
        <div className="loading" onClick={()=>{fetchPoster(oMDbApi, iMDb8Api, filmName, filmYear, setFilmData)}}>Loading...</div>
      )}
    </div>
  );
}
