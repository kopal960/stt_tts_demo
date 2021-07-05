const speech = require("@google-cloud/speech")
let bodyParser = require('body-parser');
const fs = require('fs')
GOOGLE_APPLICATION_CREDENTIALS = "C:/Users/kopal/Downloads/careful-tracer-318513-54b98a2764e9.json";
//console.log(GOOGLE_APPLICATION_CREDENTIALS)
const http = require("http");
const express = require("express");
const { json } = require("body-parser");
const app = express()
const hostname = '127.0.0.1';
const port = 8000;

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

const client = new speech.SpeechClient({credentials : JSON.parse(fs.readFileSync(GOOGLE_APPLICATION_CREDENTIALS))});
app.post('/stt' , async (req , res) => {
  //console.log(client);
  //console.log(req.body.audioBytes)
  
  /*var reader = new FileReader();
        reader.readAsDataURL(req.body.audioBytes); 
        reader.onloadend = async function() {
            var base64data = reader.result; 
            
          }     
            //console.log(base64data);*/
  const audioBit = fs.readFileSync(req.body.audioBytes);
  console.log(audioBit , typeof(audioBit))
  const request = {
    audio : {
      'content' : audioBit
    } , 
    config : {
      encoding : "LINEAR16" ,
      sampleRateHertz : 16000,
      languageCode : 'en-US'
    }
  };
  console.log("sending request");
  //console.log(JSON.parse(JSON.parse(fs.readFileSync(GOOGLE_APPLICATION_CREDENTIALS))).client_email)
  try{const [response] = await client.recognize(request);
    console.log("Request successful");
    console.log(response)
    const transcription = response.results.map((result) => {
      result.alternatives[0].transcript}).join('. ');
    console.log(transcription)
    $("#chat-input").val(transcription);
    if(transcription.length > 0)
      record_send.text("send");
      res.send(transcription)}
  catch(e){
    console.log(e)
    res.send(e)
  }
  //res.send(req.body.audioBytes)
})
