/**
 * cropImage.js
 * Utility to extract a cropped and rotated image Blob from a source image using the HTML5 Canvas API.
 */

export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Extracts a cropped image as a Blob using pixel coordinates.
 * 
 * @param {string} imageSrc - Object URL or data URL of source image
 * @param {Object} pixelCrop - { x, y, width, height } in source pixel dimensions
 * @param {number} rotation - Rotation in degrees (0, 90, 180, 270)
 * @param {string} outputType - MIME type ('image/jpeg' or 'image/png')
 * @param {number} quality - Compression quality (0 to 1)
 * @returns {Promise<Blob>}
 */
export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  outputType = 'image/jpeg',
  quality = 0.92
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  // Set canvas size to match the rotated bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Center drawing context
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw image
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('Canvas 2D context for cropped image is not available');
  }

  // Set cropped canvas dimensions
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw cropped slice
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas crop export failed'));
          return;
        }
        resolve(blob);
      },
      outputType,
      quality
    );
  });
}
