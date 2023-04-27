
import axios from 'axios';
import FormData from 'form-data';
import { withFileUpload } from 'next-multiparty';
import { createReadStream } from 'fs';


export const config = {
  api: {
    bodyParser: false,
  },
};

export default withFileUpload(async (req, res) => {
  console.log('Whisper.ts start -----');

  try {
    // Check if the file is attached to the request

    /*     if (!req.file || !req.file.buffer) {
      res.status(400).send('No file provided.');
      return;
    } */

    const file = req.file;
    //console.log('------- req.file', req.file);
    //console.log('------- req.body', req.body);
    console.log('------- req.file.filepath', req.file?.filepath);
    if (!file) {
      res.status(400).send('No file uploaded');
      return;
    }

    // Create a FormData instance and append the MP3 file
    const formData = new FormData();
    formData.append('file', createReadStream(file.filepath), 'audio.wav');
    formData.append('model', 'whisper-1');

    // Set up the necessary API headers
    const headers = {
      'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    };

    console.log('formData', formData);

    // Make a POST request to the Whisper API
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      { headers }
    );

    console.log('response', response.data);

    // Send the response from the API to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error(`Error sending MP3 to Whisper API: ${error}`);
    res.status(500).send('Error sending MP3 to Whisper API.');
  }
});
