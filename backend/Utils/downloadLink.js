const { supabase } = require('./supabase'); // import your supabase client

async function generateTempLink(filePath) {
    // filePath should look like "projects/17275028123_myfile.zip"
    const { data, error } = await supabase
        .storage
        .from('projects')  // your Supabase bucket name
        .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
}

module.exports = { generateTempLink };
