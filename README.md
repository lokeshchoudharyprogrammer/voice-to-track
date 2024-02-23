# voice-to-track

Sure, here is a markdown (.md) file containing the entire project code:

# Audio Transcription Project

This project is an example of a Node.js server that allows users to upload audio files, transcribe them using OpenAI's API, and retrieve the transcriptions.

## Prerequisites

Make sure you have the following installed:

- Node.js
- MongoDb
- Express.js
- Openai
- Aws-sdk
- ffmpeg (for audio conversion)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/lokeshchoudharyprogrammer/voice-to-track.git
   cd audio-transcription-project
   cd backend
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following:

   ```
   OPENAI_API_KEY=your_openai_api_key
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=your_aws_region
   ```

4. Run the server:
   ```bash
     nodemon index.js
   ```
4. Run the frontend:
   ```bash
     npm run start
   ```

## Dependencies

- `express`: Web framework for Node.js
- `multer`: Middleware for handling file uploads
- `aws-sdk`: AWS SDK for interacting with S3
- `openai`: OpenAI API wrapper for Node.js
- `dotenv`: Load environment variables from a `.env` file
- `ffmpeg-static`: Static ffmpeg binaries for easy installation

## API Endpoints

### POST /upload

- Description: Uploads an audio file to the server.
- Request Body: Form-data with a field named `audio` containing the audio file.
- Response: JSON object with a message and the location of the uploaded file.

### GET /getTranscript/:filename

- Description: Retrieves the transcript of an uploaded audio file.
- Parameters:
  - `filename`: The filename of the audio file.
- Response: JSON object with the transcript text.

### GET /getAllAudio

- Description: Retrieves a list of all uploaded audio files.
- Response: JSON array of filenames.

## Example Usage

1. Upload an audio file:

   ```bash
   curl -X POST -F "audio=@path/to/audiofile.mp3" http://localhost:5000/upload
   ```

2. Get transcript for an audio file:

   ```bash
   curl http://localhost:5000/getTranscript/filename.mp3
   ```

3. Get a list of all uploaded audio files:
   ```bash
   curl http://localhost:5000/getAllAudio
   ```

## Notes

- Ensure `ffmpeg` is installed on your system and the path is correctly set in the `.env` file (`FFMPEG_PATH`).
- Adjust the AWS S3 bucket name and region in the `.env` file (`AWS_BUCKET_NAME`, `AWS_REGION`).
- Replace `your_openai_api_key` with your actual OpenAI API key.
- This is a basic example and may require further configuration and error handling for production use.
