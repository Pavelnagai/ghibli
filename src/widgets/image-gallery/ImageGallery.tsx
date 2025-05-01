import { useState, useEffect, useRef } from 'react';

interface ImageData {
  originalImageUrl: string;
  processedImageUrl: string;
  style: string;
  prompt: string;
}

export const ImageGallery = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загрузка списка изображений
  const fetchImages = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/images');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Загрузка нового изображения
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8080/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const newImage = await response.json();
      setImages(prev => [...prev, newImage]);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="container">
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          ref={fileInputRef}
          disabled={isLoading}
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>

      <div className="gallery">
        {images.map((image) => (
          <div key={image.originalImageUrl} className="image-card">
            {/* Используем подписанный URL напрямую */}
            <img 
              src={image.originalImageUrl} 
              alt={`Uploaded ${image.originalImageUrl}`}
              onError={(e) => {
                // Fallback на проксированный URL если прямой не работает
                (e.target as HTMLImageElement).src = image.originalImageUrl;
              }}
            />
            <p>{image.originalImageUrl}</p>
          </div>
        ))}
      </div>
    </div>
  );
};