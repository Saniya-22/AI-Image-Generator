import React, { useState, useRef, useEffect } from 'react';
import './ImageGenerator.css';
import default_image from '../Assets/default_image.svg';

const ImageGenerator = () => {
  const [image_url, setImage_url] = useState('/');
  let inputRef = useRef(null);
  const [loading, setloading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [randomPrompt, setRandomPrompt] = useState('');
  const [savedImages, setSavedImages] = useState([]);

  useEffect(() => {
    // Fetch saved images from the backend when the component mounts
    fetchSavedImages();
  }, []);

  const imageGenerator = async () => {
    if (inputRef.current.value === '') {
      return 0;
    }
    setloading(true);
    const response = await fetch(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization:
            'Bearer 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',
          'User-Agent': 'Chrome',
        },
        body: JSON.stringify({
          prompt: inputRef.current.value,
          n: 1,
          size: '512x512',
        }),
      }
    );
    let data = await response.json();
    console.log(data);
    let data_array = data.data;
    setImage_url(data_array[0].url);
    setloading(false);

    // Save the generated image and prompt to the backend
    await saveImage(data_array[0].url, inputRef.current.value);

    // Fetch updated saved images
    fetchSavedImages();
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = image_url;
    link.download = 'generated_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveImage = async (imageUrl, prompt) => {
    await fetch('http://localhost:5000/saveImage', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        url: imageUrl,
        prompt: prompt,
      }),
    });
  };

  const fetchSavedImages = async () => {
    const response = await fetch('http://localhost:5000/getSavedImages');
    const data = await response.json();
    setSavedImages(data);
  };

  const promptSuggestions = [
    'A peaceful beach sunset',
    'A futuristic city skyline',
    'A cute puppy playing in the grass',
    'An abstract geometric pattern',
    'A magical forest with fireflies',
    'A bustling market in a foreign city',
    'A cozy winter cabin in the mountains',
    'A surreal underwater landscape',
    'A vintage retro poster design',
    'A dreamy outer space scene',
  ];

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * promptSuggestions.length);
    const randomPrompt = promptSuggestions[randomIndex];
    inputRef.current.value = randomPrompt;
    setRandomPrompt(randomPrompt);
  };

  return (
    <div className='aig'>
      <div className='header'>
        AI-IMAGE-<span>GENERATOR</span>
      </div>
      <div className='search-box'>
        <input
          type='text'
          ref={inputRef}
          className='search-input'
          placeholder='Describe what you want to see'
        />
        <div className='btn' onClick={() => imageGenerator()}>
          Generate
        </div>
        {image_url !== '/' && (
          <div className='btn' onClick={() => downloadImage()}>
            Download
          </div>
        )}
      </div>
      <div className='prompt-btn' onClick={getRandomPrompt}>
        Prompt
      </div>
      {randomPrompt && <div className='random-prompt-display'></div>}
      {showPrompts && (
        <div className='prompt-suggestions'>
          <p>Try these prompts:</p>
          <ul>
            {promptSuggestions.map((prompt, index) => (
              <li
                key={index}
                onClick={() => {
                  inputRef.current.value = prompt;
                  setShowPrompts(false);
                }}
              >
                {prompt}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className='img-loading'>
        <div className='image'>
          <img
            src={image_url === '/' ? default_image : image_url}
            alt={default_image}
          />
        </div>
      </div>
      <div className='loading'>
        <div className={loading ? 'loading-bar-full' : 'loading-bar'}></div>
        <div className={loading ? 'loading-text' : 'display-none'}>
          Loading....
        </div>
      </div>

      {/* Display saved images section */}
      <div className='saved-images'>
        <h2>Saved Images</h2>
        <div className='saved-images-list'>
          {savedImages.map((savedImage, index) => (
            <div key={index} className='saved-image'>
              <img src={savedImage.url} alt={`saved-img`} />
              <p>{savedImage.prompt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
