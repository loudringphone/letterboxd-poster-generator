const fetchPosterIMDb8 = (iMDb8Api, filmName, filmYear, setFilmData) => {
  const query = encodeURIComponent(`${filmName} ${filmYear}`);
  const url = `https://imdb8.p.rapidapi.com/auto-complete?q=${query}`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': iMDb8Api,
      'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
    }
  };
  fetch(url, options)
  .then(response => response.json())
  .then((response) => {
    const filmData = {Title: filmName, Year: filmYear, Poster: response.d?.map(item => item.i && item.i.imageUrl).filter(Boolean)}
    setFilmData(filmData)
  })
  .catch(err => console.error(err));
}

const fetchPoster = (oMDbapi, iMDb8Api, filmName, filmYear, setFilmData) => {
  const url = `https://www.omdbapi.com/?t=${filmName}&y=${filmYear}&apikey=${oMDbapi}`;
  fetch(url)
  .then(response => response.json())
  .then((response) => {
    if (!response.Error)
      setFilmData(response)
    else {
      fetchPosterIMDb8(iMDb8Api, filmName, filmYear, setFilmData)
    }
  })
  .catch(err => console.error(err));
}

export default fetchPoster;