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

const fetchPoster = async (oMDbapi, iMDb8Api, filmName, filmYear, setFilmData, signal = undefined) => {
  try {
    const omdbResult = await fetchOMDB(oMDbapi, filmName, filmYear);
    if (signal.aborted) return null;
    if (omdbResult) {
      return setFilmData(omdbResult);
    }

    const imdbResult = await fetchIMDb8(iMDb8Api, filmName, filmYear);
    if (signal.aborted) return null;
    if (imdbResult) {
      setFilmData(imdbResult);
    }
  } catch (err) {
    if (err.name === 'AbortError') return null;
  }
};


export default fetchPoster;