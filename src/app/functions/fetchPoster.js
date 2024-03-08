const fetchPosterIMDb8 = (api, filmName, filmYear, setFilmData) => {
  const url = `https://imdb8.p.rapidapi.com/auto-complete?q=${filmName} ${filmYear}`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': api,
      'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
    }
  };
  fetch(url, options)
  .then(response => response.json())
  .then((response) => {
    const filmData = {Poster: response.d?.map(item => item.i && item.i.imageUrl).filter(Boolean)}
    setFilmData(filmData)
  })
  .catch(err => console.error(err));
}

const fetchPoster = (api, filmName, filmYear, setFilmData) => {
  const url = `https://www.omdbapi.com/?t=${filmName}&y=${filmYear}&apikey=${api}`;
  fetch(url)
  .then(response => response.json())
  .then((response) => {
    if (!response.Error)
      setFilmData(response)
    else {
      fetchPosterIMDb8(process.env.REACT_APP_RAPID_API, filmName, filmYear, setFilmData)
    }
  })
  .catch(err => console.error(err));
}

export default fetchPoster;