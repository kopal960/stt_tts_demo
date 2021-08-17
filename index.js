const speech = require("@google-cloud/speech")
const text = require("@google-cloud/text-to-speech")
const fs = require('fs')
const http = require("http");
const express = require("express");
const { json } = require("body-parser");
const util = require('util')

const app = express()
const hostname = '127.0.0.1';
const port = 3000;
GOOGLE_APPLICATION_CREDENTIALS = JSON.parse(fs.readFileSync("C:/Users/kopal/Downloads/careful-tracer-318513-54b98a2764e9.json"));

//Create HTTP server and listen on port 3000 for requests
const server = http.createServer(app);
app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(json({ extended: false }));

//listen for request on port 3000, and as a callback function have the port listened on logged
app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

app.get('/' , (req,res)=>{
    res.render("index.ejs");
})

const stt_client = new speech.SpeechClient({credentials :GOOGLE_APPLICATION_CREDENTIALS });
const tts_client = new text.TextToSpeechClient({credentials : GOOGLE_APPLICATION_CREDENTIALS})

app.post('/stt' , async (req , res) => {
  console.log(req.body.audioBytes)
  const request = {
    audio : {
      'content' : req.body.audioBytes
    } , 
    config : {
      encoding : "LINEAR48" ,
      //sampleRateHertz : 48000,
      languageCode : 'en-US'
    }
  };
  console.log("sending request");
  try{
    const [response] = await stt_client.recognize(request); 
    //response = "hello"
    console.log("Request successful");
    console.log(response)
    const transcription = response.results.map((result) => {
      console.log(result.alternatives[0].transcript);
      return result.alternatives[0].transcript} ).join(". ");
    console.log(transcription)
    res.send(transcription)}
  catch(e){
    console.log(e)
    res.send()
  }
})

app.post('/tts' , async(req , res)=>{
  console.log(req.body.text);
  const request = {
    input: {text: req.body.text},
    voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
    audioConfig: {audioEncoding: 'MP3'},
  };
  try{
    const [response] = await tts_client.synthesizeSpeech(request); 
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('static/output.mp3', response.audioContent, 'binary');
    console.log('Audio content written to file: output.mp3');
    res.send("Successful");
  }
  catch(e){
    res.send(e);
  }
})