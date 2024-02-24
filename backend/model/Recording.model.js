const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    filename: String
});

const RecordingModel = mongoose.model('Recording', recordSchema);



module.exports= RecordingModel