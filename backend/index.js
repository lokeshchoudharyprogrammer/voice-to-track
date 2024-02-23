const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();
const fs = require("fs");
const AWS = require('aws-sdk');
const { Readable } = require('stream');

const OpenAI = require("openai");
require('dotenv').config()
const directoryPath = path.join(__dirname, 'uploads');
const port = 5000;
const openai = new OpenAI({ apiKey: process.env.API_KEY });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
mongoose.connect('mongodb+srv://lokesh:lokeshcz@cluster0.dsoakmx.mongodb.net/AudioRecoding?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const s3 = new AWS.S3({
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});


console.log(process.env.API_KEY)
const recordingSchema = new mongoose.Schema({
    filename: String
});

const Recording = mongoose.model('Recording', recordingSchema);

const storage = multer.memoryStorage();


const upload = multer({ storage: storage });


app.post('/upload', upload.single('audio'), async (req, res) => {
    console.log(req.file)
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }
        const filename = file.originalname || file.filename;
        const params = {
            Bucket: 'cyclic-calm-cyan-rattlesnake-hose-ap-south-1',
            Key: `${Date.now() + filename}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const uploadResult = await s3.upload(params).promise();

        const recording = new Recording({
            filename: filename
        });

        await recording.save();

        res.json({ message: 'File uploaded successfully', location: uploadResult.Location });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file.');
    }
});

app.get('/getRecording', async (req, res) => {
    try {
        const recordings = await Recording.find({});
        res.json(recordings);
    } catch (error) {
        res.status(500).send('Error fetching recordings.');
    }
});


// app.get('/getTranscript/:filename', async (req, res) => {
//     const filename = req.params.filename;

//     try {
//         let my_file = await s3.getObject({
//             Bucket: "cyclic-calm-cyan-rattlesnake-hose-ap-south-1",
//             Key: `uploads/${filename}`,
//         }).promise()

//         // Set content type based on file extension or your specific requirement
//         let contentType = 'audio/mpeg'; // For example, assuming it's an audio file

//         // Set headers for the response
//         res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//         res.setHeader('Content-Type', contentType);

//         // Stream the file back as the response
//         res.send(my_file.Body);

//         console.log(my_file)
//     } catch (error) {
//         console.error('Error fetching transcript:', error);
//         res.status(500).send('Error fetching transcript.');
//     }
// });

app.get('/getTranscript/:filename', async (req, res) => {
    const filename = req.params.filename;
    console.log(filename)
    try {
        const params = {
            Bucket: 'cyclic-calm-cyan-rattlesnake-hose-ap-south-1',
            Key: filename,
        };

        // Get the file from S3
        const data = await s3.getObject(params).promise();

        // Create a Readable stream from the file buffer
        const audioStream = new Readable();
        audioStream.push(data.Body);
        audioStream.push(null); // Indicates the end of the stream

        // Set content type based on file extension or your specific requirement
        const contentType = 'audio/mpeg'; // For example, assuming it's an audio file

        // Set headers for the response
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);

        // Pipe the audio stream to the response
        audioStream.pipe(res);

        // Now perform translation using OpenAI
        const translation = await openai.audio.translations.create({
            file: audioStream, // Use the audio stream directly
            model: "whisper-1",
        });

        // You can send the translation as well if needed
        res.send({ translation: translation.text });

    } catch (error) {
        console.error('Error fetching and streaming audio:', error);
        res.status(500).send('Error fetching and streaming audio.');
    }
});


app.get('/getAudio/:filename', async (req, res) => {
    const filename = req.params.filename;
    console.log(filename)
    let my_file = await s3.getObject({
        Bucket: "cyclic-calm-cyan-rattlesnake-hose-ap-south-1",
        Key: `${filename}`,
    }).promise()

    // Set content type based on file extension or your specific requirement
    let contentType = 'audio/mpeg'; // For example, assuming it's an audio file

    // Set headers for the response
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);

    // Stream the file back as the response
    res.send(my_file.Body);

    console.log(my_file)
});

app.get('/getAllAudio', async (req, res) => {
    try {
        const params = {
            Bucket: 'cyclic-calm-cyan-rattlesnake-hose-ap-south-1', // Replace with your S3 bucket name
        };

        // List objects in the bucket
        const data = await s3.listObjectsV2(params).promise();

        // Extract the audio file keys from the response
        const audioFiles = data.Contents.map(obj => obj.Key).filter(key => {
            // Filter to include only audio files (you may adjust this logic)
            return key.endsWith('.wav') || key.endsWith('.ogg');
        });

        res.json(audioFiles);
    } catch (error) {
        console.error('Error fetching audio files from S3:', error);
        res.status(500).send('Error fetching audio files from S3.');
    }
});

app.delete('/deleteAllObjects', async (req, res) => {
    try {
        const params = {
            Bucket: 'cyclic-calm-cyan-rattlesnake-hose-ap-south-1', // Replace with your S3 bucket name
        };

        // List objects in the bucket
        const data = await s3.listObjectsV2(params).promise();

        // Prepare params for deleting multiple objects
        const deleteParams = {
            Bucket: 'cyclic-calm-cyan-rattlesnake-hose-ap-south-1', // Replace with your S3 bucket name
            Delete: { Objects: [] },
        };

        // Add keys of all objects to deleteParams
        data.Contents.forEach(obj => {
            deleteParams.Delete.Objects.push({ Key: obj.Key });
        });

        // Delete all objects from the bucket
        const deleteResult = await s3.deleteObjects(deleteParams).promise();

        res.json({ message: 'All objects deleted successfully', deletedObjects: deleteResult.Deleted });
    } catch (error) {
        console.error('Error deleting objects from S3:', error);
        res.status(500).send('Error deleting objects from S3.');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
