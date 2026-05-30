/* eslint-disable comma-dangle */
import { v2 as cloudinary } from 'cloudinary';
import multer, { StorageEngine } from 'multer';
import { Request } from 'express';
import { Readable } from 'stream';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Storage Engine personalizado para Cloudinary
 * Processa o buffer do ficheiro diretamente para a cloud
 */
class CloudinaryStorage implements StorageEngine {
  _handleFile(
    _req: Request,
    file: Express.Multer.File,
    cb: (error?: Error | null, info?: Partial<Express.Multer.File>) => void
  ): void {
    // Criar um stream de upload para o Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'restaurante-ghu/menu',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('❌ Erro no upload para Cloudinary:', error);
          return cb(error);
        }
        console.log('✅ Upload Cloudinary bem-sucedido:', result?.secure_url);
        cb(null, {
          path: result?.secure_url,
          filename: result?.public_id,
          size: result?.bytes,
        });
      }
    );

    // Usar file.stream em vez de file.buffer
    file.stream.pipe(uploadStream);
  }

  _removeFile(
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null) => void
  ): void {
    cb(null);
  }
}

// Storage do Multer para Cloudinary
const storage = new CloudinaryStorage();

// Middleware de upload
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de ficheiro não permitido. Use JPG, PNG, WebP ou GIF'));
    }
  },
});

// Utilitário para deletar imagem do Cloudinary
export const deleteCloudinaryImage = async (imageUrl: string): Promise<void> => {
  try {
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return;

    const afterUpload = urlParts.slice(uploadIndex + 2);
    const publicId = afterUpload.join('/').replace(/\.[^/.]+$/, '');

    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Imagem deletada do Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('❌ Erro ao deletar imagem do Cloudinary:', error);
  }
};

export default cloudinary;