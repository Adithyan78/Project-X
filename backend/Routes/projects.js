const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');

const { db } = require('../firebase'); // Firestore
const { uploadFile, deleteFile } = require('../Utils/supabase');
const { cloudinary } = require('../Utils/cloudinary');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route   POST /projects/add
 * @desc    Add a new project
 */
router.post('/add', upload.fields([{ name: 'file' }, { name: 'thumbnail' }]), async (req, res) => {
  try {
    const { name, price, type, description } = req.body;
    const file = req.files['file']?.[0];
    const thumbnail = req.files['thumbnail']?.[0];

    if (!file || !name || !price || !thumbnail) {
      return res.status(400).json({ error: 'Missing required fields or files' });
    }

    // Upload project file to Supabase
    const fileUrl = await uploadFile(file);
    if (!fileUrl) return res.status(500).json({ error: 'Supabase upload failed' });

    // Upload thumbnail to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'project-thumbnails' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      streamifier.createReadStream(thumbnail.buffer).pipe(stream);
    });
    const thumbnailUrl = uploadResult.secure_url;

    // Prepare Firestore document
    const projectData = {
      name,
      price: Number(price),
      type: type || '',
      description: description || '',
      fileUrl,
      thumbnailUrl,
      createdAt: new Date()
    };

    const docRef = await db.collection('projects').add(projectData);

    res.json({ message: 'Project added', id: docRef.id, fileUrl, thumbnailUrl });
  } catch (err) {
    console.error('Error adding project:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /projects
 * @desc    Fetch all projects
 */
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('projects').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) return res.json([]);

    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /projects/:id
 * @desc    Fetch single project by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectRef = db.collection('projects').doc(id);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ id: projectDoc.id, ...projectDoc.data() });
  } catch (err) {
    console.error('Error fetching project by ID:', err.message);
    res.status(500).json({ error: err.message });
  }
});


/**
 * @route   PUT /projects/:id
 * @desc    Update project (metadata / file / thumbnail)
 */
router.put('/:id', upload.fields([{ name: 'file' }, { name: 'thumbnail' }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, type, description } = req.body;
    const projectRef = db.collection('projects').doc(id);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) return res.status(404).json({ error: 'Project not found' });

    const projectData = projectDoc.data();

    // Update file if provided
    let fileUrl = projectData.fileUrl;
    if (req.files['file']?.[0]) {
      await deleteFile(fileUrl); // delete old file
      fileUrl = await uploadFile(req.files['file'][0]);
    }

    // Update thumbnail if provided
    let thumbnailUrl = projectData.thumbnailUrl;
    if (req.files['thumbnail']?.[0]) {
      if (projectData.thumbnailUrl) {
        const publicId = projectData.thumbnailUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`project-thumbnails/${publicId}`);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'project-thumbnails' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        streamifier.createReadStream(req.files['thumbnail'][0].buffer).pipe(stream);
      });
      thumbnailUrl = uploadResult.secure_url;
    }

    // Prepare updated data
    const updatedData = {
      name: name || projectData.name,
      price: price ? Number(price) : projectData.price,
      type: type || projectData.type,
      description: description || projectData.description,
      fileUrl,
      thumbnailUrl,
      updatedAt: new Date()
    };

    await projectRef.update(updatedData);
    res.json({ message: 'Project updated', updatedData });
  } catch (err) {
    console.error('Error updating project:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   DELETE /projects/:id
 * @desc    Delete a project
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectRef = db.collection('projects').doc(id);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) return res.status(404).json({ error: 'Project not found' });

    const projectData = projectDoc.data();

    // Delete Supabase file
    if (projectData.fileUrl) await deleteFile(projectData.fileUrl);

    // Delete Cloudinary thumbnail
    if (projectData.thumbnailUrl) {
      const publicId = projectData.thumbnailUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`project-thumbnails/${publicId}`);
    }

    // Delete Firestore document
    await projectRef.delete();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Error deleting project:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
