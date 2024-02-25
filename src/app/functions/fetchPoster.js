const fetchPoster = (filmName, setFilmData) => {

  const url = `https://imdb8.p.rapidapi.com/auto-complete?q=${filmName}`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API,
      'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
    }
  };
  fetch(url, options)
  .then(response => response.json())
  .then((response) => {
    setFilmData(response)
  })
  .catch(err => console.error(err));
}

export default fetchPoster;