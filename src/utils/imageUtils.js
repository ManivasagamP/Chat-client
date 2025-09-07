/**
 * Utility functions for image processing and compression
 */

/**
 * Compress and resize an image file
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width in pixels (default: 400)
 * @param {number} maxHeight - Maximum height in pixels (default: 400)
 * @param {number} quality - Image quality 0-1 (default: 0.8)
 * @param {number} maxSizeKB - Maximum file size in KB (default: 200)
 * @returns {Promise<string>} - Base64 string of compressed image
 */
export const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8, maxSizeKB = 200) => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    // Validate file size (check original size first)
    const maxSizeBytes = maxSizeKB * 1024;
    if (file.size > maxSizeBytes * 2) { // Allow 2x buffer for compression
      reject(new Error(`Image too large. Maximum size allowed: ${maxSizeKB}KB`));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Try different quality levels if image is still too large
      let currentQuality = quality;
      const tryCompress = () => {
        const dataURL = canvas.toDataURL('image/jpeg', currentQuality);
        const sizeKB = (dataURL.length * 0.75) / 1024; // Approximate size calculation
        
        if (sizeKB <= maxSizeKB || currentQuality <= 0.1) {
          resolve(dataURL);
        } else {
          currentQuality -= 0.1;
          tryCompress();
        }
      };

      tryCompress();
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load the image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file before processing
 * @param {File} file - The file to validate
 * @param {number} maxSizeKB - Maximum size in KB (default: 500)
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file, maxSizeKB = 500) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = maxSizeKB * 1024;

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please select a JPEG, PNG, or WebP image.' };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File too large. Maximum size allowed: ${maxSizeKB}KB` };
  }

  return { valid: true };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
