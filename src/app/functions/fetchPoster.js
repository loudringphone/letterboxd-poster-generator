const debounce = (fn, delay = 600) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const fetchIMDb8 = async (iMDb8Api, filmName, filmYear) => {
  try {
    const query = encodeURIComponent(`${filmName} ${filmYear}`);
    const url = `https://imdb8.p.rapidapi.com/auto-complete?q=${query}`;
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": iMDb8Api,
        "X-RapidAPI-Host": "imdb8.p.rapidapi.com",
      },
    });

    const data = await res.json();

    return {
      Title: filmName,
      Year: filmYear,
      Poster: data.d?.map((item) => item.i?.imageUrl).filter(Boolean),
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

const fetchOMDB = async (oMDbapi, filmName, filmYear) => {
  try {
    const url = `https://www.omdbapi.com/?t=${filmName}&y=${filmYear}&apikey=${oMDbapi}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.Error) return data;
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const debouncedFetchPoster = debounce(async (oMDbapi, iMDb8Api, filmName, filmYear, setFilmData) => {
  const omdbResult = await fetchOMDB(oMDbapi, filmName, filmYear);
  if (omdbResult) {
    return setFilmData(omdbResult);
  }

  const imdbResult = await fetchIMDb8(iMDb8Api, filmName, filmYear);
  if (imdbResult) {
    setFilmData(imdbResult);
  }
}, 600);


export default debouncedFetchPoster;