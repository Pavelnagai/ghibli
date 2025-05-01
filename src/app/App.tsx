import './App.css'
import { useMe } from '../shared/hooks/useMe'
import { useTelegram } from '../shared/hooks/useTelegram'
import { useState, useRef, useEffect } from 'react'
import { useTopSafeArea } from '../shared/hooks/useTopSafeArea'

interface ProcessedImage {
  id: string
  url: string
  processedImageUrl: string
}

export enum ImageStyle {
  GHIBLI = 'ghibli',
  PIXAR = 'pixar',
  DISNEY = 'disney',
  ANIME = 'anime',
  WATERCOLOR = 'watercolor',
  OIL_PAINTING = 'oil_painting',
  PIXEL_ART = 'pixel_art'
}

export const App = () => {
  useMe()
  useTelegram()
  const { topSafeAreaOffset } = useTopSafeArea(40)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(ImageStyle.GHIBLI)
  const fileInputRef = useRef<HTMLInputElement>(null)

  console.log(processedImages, 'processedImages')

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleProcessImage = async () => {
    if (!selectedImage) return

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedImage)
      formData.append('style', selectedStyle)

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      const response = await fetch(apiUrl + '/api/images', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to process image')
      }

      const processedImage = await response.json()

      setProcessedImages(prev => [...prev, {
        ...processedImage,
      }])
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setSelectedImage(null)
      setIsProcessing(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  useEffect(() => {
    const fetchImages = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      try {
        const response = await fetch(apiUrl + '/api/images')
        if (!response.ok) {
          throw new Error('Failed to fetch images')
        }
        const images: ProcessedImage[] = await response.json()
        setProcessedImages(images)
      } catch (error) {
        console.error('Error fetching images:', error)
      }
    }
    fetchImages()
  }, [])

  console.log(processedImages, 'processedImages')

  return (
    <div className="container" style={{ paddingTop: topSafeAreaOffset }}>
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          ref={fileInputRef}
          disabled={isProcessing}
          className="file-input"
        />
        <div className="style-selector">
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value as ImageStyle)}
            className="style-select"
            disabled={isProcessing}
          >
            {Object.values(ImageStyle).map((style) => (
              <option key={style} value={style}>
                {style.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleProcessImage}
          disabled={!selectedImage || isProcessing}
          className="process-button"
        >
          {isProcessing ? 'Processing...' : 'Process Image'}
        </button>
      </div>

      {isProcessing && (
        <div className="skeleton-container">
          <div className="skeleton-image"></div>
          <div className="skeleton-text"></div>
        </div>
      )}

      <div className="gallery">
        {[...processedImages].reverse().map((image: ProcessedImage)  => (
          <div key={image.id} className="gallery-item">
            <div className="image-container">
              <img src={`http://localhost:9000${image.url}`} alt="Processed" className="gallery-image" />
              <img src={`http://localhost:9000${image.processedImageUrl}`} alt="Processed" className="gallery-image" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
