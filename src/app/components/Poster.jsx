'use client'

import React, { useState, useEffect } from 'react';
import fetchPoster from '../functions/fetchPoster';
import testFilmData from '../objects/testFilmData';

import './poster.css';

export const Poster = ({ oMDbApi, iMDb8Api, delay, filmName, filmYear, setVisiblePostersCount }) => {
  const [filmData, setFilmData] = useState(null);
  const [imageUrls, setImageUrls] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => {
      // fetchPosterIMDb8(api,filmName, filmYear, setFilmData)
      fetchPoster(oMDbApi, iMDb8Api, filmName, filmYear, setFilmData)
    }, delay * 1200);
    // setFilmData(testFilmData)
  }, []);

  useEffect(() => {
    if (filmData) {
      setImageUrls([filmData.Poster]);
      setLoading(false)
    }
  }, [filmData]);

  useEffect(() => {
    if (!loading && !filmData.Poster) {
      setVisiblePostersCount(prevCount => prevCount - 1);
    }
  }, [loading])

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
        <img className="poster" src={imageUrls[0]} alt="Image" />
      ) : (
        <div className="loading" onClick={handleReload}>Loading...</div>
      )}
    </div>
  );
}
