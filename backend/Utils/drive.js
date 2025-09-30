const { google } = require('googleapis');
const { Readable } = require('stream');  // <-- add this line

const auth = new google.auth.GoogleAuth({
  keyFile: './firebase/serviceAccountKey.json', // path to your JSON
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

const folderId = '1COZl-TZWw7e1PtLF6RHzkcYIxcDTbTKQ';

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null); // signals end of stream
  return stream;
}// your shared Drive folder ID

async function uploadFile(file) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        parents: [folderId]
      },
      media: {
        mimeType: file.mimetype,
        body: bufferToStream(file.buffer)  // <-- use the function here
      },
      fields: 'id'
    });

    const fileId = response.data.id;

    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' }
    });

    return `https://drive.google.com/uc?id=${fileId}&export=download`;
  } catch (err) {
    console.error('Drive upload failed:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { uploadFile };
