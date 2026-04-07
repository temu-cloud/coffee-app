import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'coffee-inventory',
          resource_type: 'image',
          transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Upload failed'))
          } else {
            resolve(result.secure_url)
          }
        }
      )
      .end(buffer)
  })
}
