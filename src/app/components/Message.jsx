export const Message = ({className}) => {
  return (
    <div className={`${className} mb-4 mr-auto ml-auto px-4`}>
      <p>
        First, export your Letterboxd account data in CSV format from <a href="https://letterboxd.com/settings/data/" target="_blank" rel="noopener noreferrer">Letterboxd Data Settings</a>. Then, import the diary.csv to generate your monthly film posters.
      </p>
    </div>
  )
}