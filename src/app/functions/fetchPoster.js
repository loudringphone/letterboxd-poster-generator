const fetchPoster = (api, filmName, setFilmData) => {

  const url = `https://imdb8.p.rapidapi.com/auto-complete?q=${filmName}`;
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
    setFilmData(response)
  })
  .catch(err => console.error(err));
}

export default fetchPoster;