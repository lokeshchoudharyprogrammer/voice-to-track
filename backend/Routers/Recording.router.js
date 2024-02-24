
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const OpenAI = require("openai");
const path = require('path');
const fs=require("fs")
const RecordingModel = require('../model/Recording.model');
require('dotenv').config()
const openai = new OpenAI({ apiKey: process.env.API_KEY });

const AWS = require('aws-sdk');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const recordingRouter = express.Router()




const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
recordingRouter.use('/uploads', express.static(path.join(__dirname, 'uploads')));



const s3 = new AWS.S3({
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});



recordingRouter.post('/upload', upload.single('audio'), async (req, res) => {

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

        const voicerecording = new RecordingModel({
            filename: filename
        });

        await voicerecording.save();

        res.json({ message: 'File uploaded successfully', location: uploadResult.Location });
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Error uploading file.');
    }
});

recordingRouter.get('/getRecording', async (req, res) => {
    try {
        const recordings = await RecordingModel.find({});
        res.json(recordings);
    } catch (error) {
        res.status(500).send('Error fetching recordings.');
    }
});
ffmpeg.setFfmpegPath(ffmpegPath);

const tempDir = '/tmp';

recordingRouter.get('/getTranscript/:filename', async (req, res) => {
    const filename = req.params.filename;
    try {
        const s3Params = {
            Bucket: 'cyclic-calm-cyan-rattlesnake-hose-ap-south-1',
            Key: filename,
        };

        const s3Object = await s3.getObject(s3Params).promise();


        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempfiles = `${tempDir}/temp_${filename}`;
        fs.writeFileSync(tempfiles, s3Object.Body);

        const new_output_file = `${tempDir}/converted_${filename}.wav`;
        await new Promise((resolve, reject) => {
            ffmpeg(tempfiles)
                .toFormat('wav')
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .save(new_output_file);
        });

        const audioStream = fs.createReadStream(new_output_file);
        const transcription = await openai.audio.transcriptions.create({
            model: "whisper-1",
            file: audioStream,
            response_format: "text"
        });

        fs.unlinkSync(tempfiles);
        fs.unlinkSync(new_output_file);

        res.send({ transcript: transcription });
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Errortranscribing audio.');
    }
});

recordingRouter.get('/getAudio/:filename', async (req, res) => {
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

recordingRouter.get('/getAllAudio', async (req, res) => {
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

recordingRouter.delete('/deleteAllObjects', async (req, res) => {
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

module.exports = recordingRouter 