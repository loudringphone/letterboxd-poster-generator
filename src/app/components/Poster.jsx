'use client'

import React, { useState, useEffect } from 'react';
import fetchPoster from '../functions/fetchPoster';
import testFilmData from '../objects/testFilmData';

import './poster.css';

export const Poster = ({ api, delay, filmName }) => {
  const [filmData, setFilmData] = useState(null);
  const [imageUrls, setImageUrls] = useState(null)
  useEffect(() => {
    setTimeout(() => {
      fetchPoster(api,filmName, setFilmData)
    }, delay * 1500);
    // setFilmData(testFilmData)
  }, []);

  useEffect(() => {
    if (filmData) {
      setImageUrls(filmData.d?.map(item => item.i && item.i.imageUrl).filter(Boolean));
    }
  }, [filmData]);

  const handleReload = () => {
    fetchPoster(api,filmName, setFilmData)
  }

  return (
    <div className='poster'>
      {Array.isArray(imageUrls) ? (
        <img className="poster" src={imageUrls[0]} alt="Image" crossorigin="anonymous" />
      ) : (
        <div className="poster loading" onClick={handleReload}>Loading...</div>
      )}
    </div>
  );
}
