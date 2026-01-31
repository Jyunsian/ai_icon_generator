import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  useWebWorker?: boolean;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidthOrHeight: 1024,
  maxSizeMB: 1,
  useWebWorker: true,
};

/**
 * Compress an image file to reduce payload size
 * Default: max 1024px dimension, max 1MB size
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const compressedFile = await imageCompression(file, mergedOptions);
    return compressedFile;
  } catch (error) {
    // If compression fails, return the original file
    console.error('Image compression failed, using original:', error);
    return file;
  }
}

/**
 * Convert a File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an image file and convert to base64
 * Returns both the data (without prefix) and the full preview URL
 */
export async function compressAndConvert(
  file: File,
  options: CompressionOptions = {}
): Promise<{ data: string; preview: string; mimeType: string }> {
  const compressedFile = await compressImage(file, options);
  const preview = await fileToBase64(compressedFile);
  const data = preview.split(',')[1];

  return {
    data,
    preview,
    mimeType: compressedFile.type || file.type,
  };
}

/**
 * Process multiple images in parallel
 */
export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<Array<{ data: string; preview: string; mimeType: string }>> {
  return Promise.all(files.map((file) => compressAndConvert(file, options)));
}
