import { api } from "./api";

export const getImages = async () => {
  const response = await api.get('/api/images')
  return response.data
}

export const uploadImage = async (image: File) => {
  const response = await api.post('/api/images', { image })
  return response.data
}

export const deleteImage = async (id: string) => {
  const response = await api.delete(`/api/images/${id}`)
  return response.data
}



