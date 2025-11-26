export const Message = ({className}) => {
  return (
    <div className={`${className} mb-4 mr-auto ml-auto px-4`}>
      <p>
        First, export your Letterboxd account data in CSV format from <a href="https://letterboxd.com/settings/data/" target="_blank" rel="noopener noreferrer">Letterboxd Data Settings</a>. Then, import the diary.csv to generate your monthly film posters.
      </p>
      <p className="mt-2">
        To fetch movie posters, you need your own APIs:{' '}
        <a href="https://www.omdbapi.com/" target="_blank" rel="noopener noreferrer">OMDb API</a> and/or{' '}
        <a href="https://rapidapi.com/apidojo/api/imdb8" target="_blank" rel="noopener noreferrer">IMDb8 API</a>.
      </p>
    </div>
  )
}