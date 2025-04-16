import { baseUrl } from '../environment/environment';
import { toast } from 'react-toastify';

/**
 * Uploads a file to the server
 * @param {File} file - The file to upload
 * @param {string} token - The user's authentication token
 * @returns {Promise<{fileUrl: string, public_id: string}>} - The uploaded file URL and public ID
 */
export const uploadFile = async (file, token) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${baseUrl}files/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const responseData = await response.json();
    return {
      fileUrl: responseData.fileUrl,
      public_id: responseData.public_id
    };
  } catch (error) {
    console.error(`Error uploading file: ${error.message}`);
    toast.error(`Error uploading file: ${error.message}`);
    throw error;
  }
}; 