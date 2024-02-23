const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();
const fs = require("fs");
const AWS = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');

const OpenAI = require("openai");
require('dotenv').config()
const openai = new OpenAI({ apiKey: process.env.API_KEY });


const port = 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);


mongoose.connect("mongodb+srv://lokesh:lokeshcz@cluster0.dsoakmx.mongodb.net/AudioRecoding?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const s3 = new AWS.S3({
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const recordSchema = new mongoose.Schema({
    filename: String
});

const Recording = mongoose.model('Recording', recordSchema);

const storage = multer.memoryStorage();


const upload = multer({ storage: storage });


app.post('/upload', upload.single('audio'), async (req, res) => {

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

        const voicerecording = new Recording({
            filename: filename
        });

        await voicerecording.save();

        res.json({ message: 'File uploaded successfully', location: uploadResult.Location });
    } catch (error) {
        console.error('Error', error);
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
ffmpeg.setFfmpegPath(ffmpegPath);

// Specify a writable directory for temporary files
// const tempDir = '/path/to/temp/dir'; // Update this with a writable directory
const tempDir =  '/tmp';; // Will create 'temp' in the same directory as index.js

app.get('/getTranscript/:filename', async (req, res) => {
    const filename = req.params.filename;
    try {
        const s3Params = {
            Bucket: 'cyclic-calm-cyan-rattlesnake-hose-ap-south-1',
            Key: filename,
        };

        const s3Object = await s3.getObject(s3Params).promise();

        // Create temporary directory if it doesn't exist
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempFilePath = `${tempDir}/temp_${filename}`;
        fs.writeFileSync(tempFilePath, s3Object.Body);

        const outputFilePath = `${tempDir}/converted_${filename}.wav`;
        await new Promise((resolve, reject) => {
            ffmpeg(tempFilePath)
                .toFormat('wav')
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .save(outputFilePath);
        });

        const audioStream = fs.createReadStream(outputFilePath);
        const transcription = await openai.audio.transcriptions.create({
            model: "whisper-1",
            file: audioStream,
            response_format: "text"
        });

        // Clean up temporary files
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(outputFilePath);

        res.send({ transcript: transcription });
    } catch (error) {
        console.error('Error fetching and transcribing audio:', error);
        res.status(500).send('Error fetching and transcribing audio.');
    }
});

app.get('/getAudio/:filename', async (req, res) => {
    const filename = req.params.filename;

    let data = await s3.getObject({
        Bucket: "cyclic-calm-cyan-rattlesnake-hose-ap-south-1",
        Key: `${filename}`,
    }).promise()

    let contentType = 'audio/mpeg';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    res.send(data.Body);

});

app.get('/getAllAudio', async (req, res) => {
    try {
        const params = {
            Bucket: 'cyclic-calm-cyan-rattlesnake-hose-ap-south-1',
        };
        const data = await s3.listObjectsV2(params).promise();

        const files = data.Contents.map(obj => obj.Key).filter(key => {
            return key.endsWith('.wav') || key.endsWith('.ogg');
        });

        res.json(files);
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Error fetching .');
    }
});

app.delete('/deleteAllObjects', async (req, res) => {
    try {
        const params = {
            Bucket: 'cyclic-calm-cyan-rattlesnake-hose-ap-south-1',
        };

        const userData = await s3.listObjectsV2(params).promise();

        const deleteParams = {
            Bucket: 'cyclic-calm-cyan-rattlesnake-hose-ap-south-1',
            Delete: { Objects: [] },
        };

        userData.Contents.forEach(voice => {
            deleteParams.Delete.Objects.push({ Key: voice.Key });
        });

        const deleteResult = await s3.deleteObjects(deleteParams).promise();

        res.json({ message: 'deleted successfully', deletedObjects: deleteResult.Deleted });
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Error S3.');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
