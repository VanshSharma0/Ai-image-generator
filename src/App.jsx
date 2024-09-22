import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_STABILITY_API_KEY;
const API_HOST = 'https://api.stability.ai';

function App() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [recentImages, setRecentImages] = useState([]);
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem('recentImages')) || [];
    const savedPrompts = JSON.parse(localStorage.getItem('recentPrompts')) || [];
    setRecentImages(savedImages);
    setRecentPrompts(savedPrompts);
  }, []);

  const saveToLocalStorage = (image, prompt) => {
    const savedImages = JSON.parse(localStorage.getItem('recentImages')) || [];
    const savedPrompts = JSON.parse(localStorage.getItem('recentPrompts')) || [];
    
    const newImages = [image, ...savedImages.slice(0, 19)];
    const newPrompts = [prompt, ...new Set([...savedPrompts.slice(0, 9)])];
    
    localStorage.setItem('recentImages', JSON.stringify(newImages));
    localStorage.setItem('recentPrompts', JSON.stringify(newPrompts));
    
    setRecentImages(newImages);
    setRecentPrompts(newPrompts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios({
        method: 'post',
        url: `${API_HOST}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        data: {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
        },
      });

      const imageUrl = `data:image/png;base64,${response.data.artifacts[0].base64}`;
      setGeneratedImage(imageUrl);
      saveToLocalStorage({ prompt, imageUrl }, prompt);
    } catch (error) {
      setError(error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">AI Image Generator</h1>
          
          <form onSubmit={handleSubmit} className="mb-8">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-md hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 disabled:opacity-50 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
          </form>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {generatedImage && (
            <div className="mb-8">
              <img src={generatedImage} alt="Generated" className="w-full rounded-md shadow-lg" />
              <button
                onClick={handleDownload}
                className="mt-4 w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 px-4 rounded-md hover:from-green-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
              >
                Download Image
              </button>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Prompts</h2>
            <div className="flex flex-wrap gap-2">
              {recentPrompts.map((recentPrompt, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(recentPrompt)}
                  className="bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                >
                  {recentPrompt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Images</h2>
            <div className="grid grid-cols-2 gap-4">
              {recentImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img src={image.imageUrl} alt={image.prompt} className="w-full h-32 object-cover rounded-md transition duration-300 ease-in-out transform group-hover:scale-105" />
                  <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate group-hover:bg-opacity-75 transition duration-300 ease-in-out">
                    {image.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;