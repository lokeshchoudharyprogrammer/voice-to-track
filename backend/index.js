const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();
const fs = require("fs");
const OpenAI = require("openai");
require('dotenv').config()
const directoryPath = path.join(__dirname, 'uploads');
const port = 5000;
const openai = new OpenAI({ apiKey: process.env.API_KEY});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
mongoose.connect('mongodb+srv://lokesh:lokeshcz@cluster0.dsoakmx.mongodb.net/AudioRecoding?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});



console.log(process.env.API_KEY)
const recordingSchema = new mongoose.Schema({
    filename: String
});

const Recording = mongoose.model('Recording', recordingSchema);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000 * 1024 * 1024 } // 1000MB limit
});

app.post('/upload', upload.single('audio'), async (req, res) => {
    console.log(req.file)
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const recording = new Recording({
        filename: req.file.filename
    });

    try {
        await recording.save();
        res.send('File uploaded!');
    } catch (error) {
        res.status(500).send('Error saving recording to database.');
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



app.get('/getTranscript/:filename', async (req, res) => {

    const filename = req.params.filename;
    console.log(filename)
    try {
        const translation = await openai.audio.translations.create({
            file: fs.createReadStream(`./uploads/${filename}`),
            model: "whisper-1",
        });

        res.send({ translation: translation.text });
    } catch (error) {
        res.send('Error:');
    }
})


app.get('/getAudio/:filename', async (req, res) => {
    const filename = req.params.filename;


    res.sendFile(path.join(__dirname, 'uploads', filename));

});

app.get('/getAllAudio', async (req, res) => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        const audioFiles = files.filter(file => {
            // Filter to include only audio files (you may adjust this logic)
            return file.endsWith('.wav') || file.endsWith('.ogg');
        });

        res.json(audioFiles);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
