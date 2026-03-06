/**
 * Cloudinary Unsigned Upload Utility
 * This allows uploading files directly from the frontend.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dtpelsmic';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default1';

export async function uploadToCloudinary(file, resourceType = 'auto') {
    console.log('=== Cloudinary Upload Debug ===');
    console.log('Cloud Name:', CLOUD_NAME);
    console.log('Upload Preset:', UPLOAD_PRESET);
    console.log('Resource Type:', resourceType);
    console.log('File:', file?.name, file?.type, file?.size);

    if (!CLOUD_NAME || CLOUD_NAME === 'your_cloud_name') {
        throw new Error('Cloudinary Cloud Name тохируулаагүй байна (.env шалгана уу)');
    }
    if (!UPLOAD_PRESET || UPLOAD_PRESET === 'your_unsigned_preset') {
        throw new Error('Cloudinary Upload Preset тохируулаагүй байна (.env шалгана уу)');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
    console.log('Upload URL:', url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary Error Response:', JSON.stringify(errorData));
            throw new Error(errorData.error?.message || 'Cloudinary upload failed');
        }

        const data = await response.json();
        return {
            url: data.secure_url,
            public_id: data.public_id,
            format: data.format,
            bytes: data.bytes
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}
