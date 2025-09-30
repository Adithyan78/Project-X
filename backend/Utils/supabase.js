const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase project details
const SUPABASE_URL =  process.env.SUPABASE_URL;
const SUPABASE_KEY =  process.env.SUPABASE_SERVICE_ROLE_KEY ; // Backend only!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// /**
//  * Upload a file buffer to Supabase Storage and return a public URL
//  * @param {Object} file - multer file object
//  * @returns {string} public URL
//  */
async function uploadFile(file) {
  try {
    const fileName = `projects/${Date.now()}_${file.originalname}`;

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('projects')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;
    if (!uploadData) throw new Error('Supabase upload returned no data');

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('projects')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) throw new Error('Supabase returned empty public URL');

    console.log('Public URL:', publicUrl);
    return publicUrl;
  } catch (err) {
    console.error('Supabase upload failed:', err.message);
    return null;
  }
}
/**
 * Delete a file from Supabase Storage using its public URL
 * @param {string} fileUrl - public URL of the file
 */
async function deleteFile(fileUrl) {
  try {
    // Extract the file path in Supabase storage
    const urlParts = fileUrl.split('/');
    const fileName = urlParts.slice(-1)[0]; // last segment = filename with timestamp
    const { error } = await supabase.storage.from('projects').remove([`projects/${fileName}`]);

    if (error) console.error('Supabase delete error:', error.message);
    else console.log('Supabase file deleted:', fileName);
  } catch (err) {
    console.error('Supabase delete failed:', err.message);
  }
}
module.exports = { supabase, uploadFile, deleteFile };