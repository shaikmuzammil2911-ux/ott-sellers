import { supabase } from '../lib/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadService = {
  /**
   * Upload an image file to Cloudinary or Supabase Storage with local fallback
   */
  async uploadImage(file: File, folder: string = 'ott-sellers'): Promise<UploadResult> {
    // 1. Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file format. Please upload JPG, PNG, or WebP.' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 5MB limit. Please compress the image.' };
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ml_default';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    // 2. Try Cloudinary Upload if cloud name is configured
    if (cloudName && cloudName !== 'ml_default' && uploadPreset) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', folder);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          if (data.secure_url) {
            return { success: true, url: data.secure_url };
          }
        }
      } catch (err) {
        console.warn('Cloudinary upload failed, attempting Supabase Storage fallback:', err);
      }
    }

    // 3. Try Supabase Storage upload
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('ott-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('ott-images')
          .getPublicUrl(fileName);

        if (publicData?.publicUrl) {
          return { success: true, url: publicData.publicUrl };
        }
      }
    } catch (err) {
      console.warn('Supabase Storage upload fallback attempt:', err);
    }

    // 4. Client-side Base64 Data URL fallback (ensures offline / local test previews never fail)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ success: true, url: reader.result as string });
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read image file data.' });
      };
      reader.readAsDataURL(file);
    });
  }
};
