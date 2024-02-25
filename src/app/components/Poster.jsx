'use client'

import React, { useState, useEffect } from 'react';
import fetchPoster from '../functions/fetchPoster';
import testFilmData from '../objects/testFilmData';

import './poster.css';

export const Poster = ({ delay, filmName }) => {
  const [filmData, setFilmData] = useState(null);
  const [imageUrls, setImageUrls] = useState(null)
  useEffect(() => {
    setTimeout(() => {
      fetchPoster(filmName, setFilmData)
    }, delay * 1000);
    // setFilmData(testFilmData)
  }, []);

  useEffect(() => {
    if (filmData) {
      setImageUrls(filmData.d?.map(item => item.i && item.i.imageUrl).filter(Boolean));
    }
  }, [filmData]);

  return (
    <div className='poster'>
      {Array.isArray(imageUrls) ? (
        <img className="poster" src={imageUrls[0]} alt="Image" />
      ) : (
        <div className="poster">Loading...</div>
      )}
    </div>
  );
}
