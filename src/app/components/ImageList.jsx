import { useRef, useState } from 'react';

export const ImageList = ({ isMassLoading, filteredCSV, posterUrls, setVisiblePostersCount, showInputs, toggleInputList }) => {
  const inputRefs = useRef([]);
  const isManuallyChanged = useRef([]);
  const tempValues = useRef([]);

  const handlePosterChange = (idx, newUrl) => {
    if (!isManuallyChanged.current.includes(idx)) {
      isManuallyChanged.current.push(idx);
    }
    tempValues.current[idx] = newUrl;
  };

  const updatePosters = () => {
    isManuallyChanged.current.forEach((idx) => {
      const img = document.getElementById(`poster${idx}`)
      const srcset = tempValues.current[idx]
      const testImg = new Image();
      testImg.onload = () => {
        if (img.classList.contains('grayscale')) {
          img.classList.remove('grayscale');
          setVisiblePostersCount(prev => prev + 1);
        }
      };
      testImg.onerror = () => {
        img.classList.add('grayscale');
      };

      testImg.src = srcset;
      img.srcset = srcset
    })
    isManuallyChanged.current = [];
    tempValues.current = [];
  }

  return (
    <div className={'mb-4'}>
      <div className='flex font-bold items-center space-x-2 justify-center'>
        <h2 className='btn !text-2xl !no-underline cursor-pointer'
            onClick={toggleInputList}>
          {showInputs ? '-' : '+'}
        </h2>
        <h2 className='text-lg'>(Optional) Poster Manual Override</h2>
      </div>
      {showInputs && (
        <div>
          {filteredCSV.map((row, index) => (
            <div key={index} className='flex items-center mt-3'>

              <span className=''>{row.Name} ({row.Year})</span>

              <input
                key={`${row.Name} ${row.Year}`}
                type='text'
                className='flex-1 border px-2 py-1 ml-2'
                placeholder='Poster URL'
                defaultValue={posterUrls[index]?.[0] || ''}
                onChange={(e) => handlePosterChange(index, e.target.value)}
                ref={el => inputRefs.current[index] = el}
                disabled={isMassLoading}
              />
            </div>
          ))}
          <button
            onClick={updatePosters}
            className={`float-right mt-4 text-lg underline px-1 ${isMassLoading ? '' : 'btn'}`}
            disabled={isMassLoading}
          >
            Update Posters
          </button>
        </div>
      )}
    </div>
  )
}