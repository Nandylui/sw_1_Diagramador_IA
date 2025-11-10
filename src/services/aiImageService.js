// src/services/aiImageService.js
import axios from "axios";

export const analyzeDiagramImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post("http://localhost:5000/api/diagram-image", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return response.data;
};
