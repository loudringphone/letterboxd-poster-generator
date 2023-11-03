'use client'

import React, { useState, useEffect } from 'react';

export const Poster = () => {
  const [filmData, setFilmData] = useState(null);

  useEffect(() => {
    // Define the API URL
    const apiUrl = 'https://api.letterboxd.com/api/v0/film/4Y7O0h';

    // Fetch data from the API
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setFilmData(data);
        console.log(data)
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div> test </div>
  )
}
