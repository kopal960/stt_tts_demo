var record_send = $("#record-send")
$(function () {
  var INDEX = 0;
  var voiceRecorder = new VoiceRecorder();
  $("#chat-submit").click(function (e) {
    e.preventDefault();
    var msg = $("#chat-input").val();
    if (msg.trim() == '') {
      if (record_send.text() == "mic") {
        record_send.text("stop")
        voiceRecorder.startRecording();
      }
      else {
        voiceRecorder.stopRecording();
        record_send.text("mic");
      }
    }
    else {
      generate_message(msg, 'self');
      var buttons = [
        {
          name: 'Existing User',
          value: 'existing'
        },
        {
          name: 'New User',
          value: 'new'
        }
      ];
      setTimeout(function () {
        generate_message(msg, 'user');
      }, 1000)
    }

  })

  $("#chat-input").keyup(() => {
    console.log(record_send.text(), $("#chat-input").val().trim())
    if ($("#chat-input").val().trim() == '')
      record_send.text("mic");
    else
      record_send.text("send");
  })
  window.playSound = function() {
    document.getElementById('newMessage').play();
  } 

  function generate_message(msg, type) {
    INDEX++;
    console.log(INDEX)
    var div = document.createElement("div")
    div.className = "chat-msg " + type;
    var str = "";
    str += "          <div id='cm-msg-" + INDEX + "' class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    if (type == 'user') { str += "<i class=\"material-icons speak\" id='speak-" + INDEX + "'>volume_up<\/i></button>" }
    div.innerHTML = str;
    div.addEventListener("click", speak)
    $(".chat-logs").append(div);
    $("#cm-msg-" + INDEX).hide().fadeIn(300);
    if (type == 'self') {
      $("#chat-input").val('');
    }
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
  }

  async function speak(e) {
    msg = e.target.id;
    msg_id = msg[msg.length - 1];
    var text = $("#cm-msg-" + msg_id).text();
    console.log(e.target.id, msg_id, text);
    fetch("/tts", {
      // Adding method type
      method: "POST",

      // Adding body or contents to send
      body: JSON.stringify({ text }),

      // Adding headers to the request
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then(response => {
        console.log("playing audio");
        var sound = document.createElement('audio');
        sound.setAttribute("src", "output.mp3");
        sound.id = "newMessage";
        sound.setAttribute('autoplay', 'true');
        document.body.appendChild(sound);
      })
  }

  /*$(".speak").click(function(e){
    //console.log("click");
    msg = e.target.id;
    msg_id= msg[msg.length-1];
    console.log($("#cm-msg-"+msg_id).text());
    fetch("/tts" , (e)=>{

    })
  })*/
  /*function generate_button_message(msg, buttons){    
    INDEX++;
    var btn_obj = buttons.map(function(button) {
       return  "              <li class=\"button\"><a href=\"javascript:;\" class=\"btn btn-primary chat-btn\" chat-value=\""+button.value+"\">"+button.name+"<\/a><\/li>";
    }).join('');
    var str="";
    str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg user\">";
    str += "          <span class=\"msg-avatar\">";
    str += "            <img src=\"https:\/\/image.crisp.im\/avatar\/operator\/196af8cc-f6ad-4ef7-afd1-c45d5231387c\/240\/?1483361727745\">";
    str += "          <\/span>";
    str += "          <div class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    str += "          <div class=\"cm-msg-button\">";
    str += "            <ul>";   
    str += btn_obj;
    str += "            <\/ul>";
    str += "          <\/div>";
    str += "        <\/div>";
    $(".chat-logs").append(str);
    $("#cm-msg-"+INDEX).hide().fadeIn(300);   
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight}, 1000);
    $("#chat-input").attr("disabled", true);
  }*/

  $(document).delegate(".chat-btn", "click", function () {
    var value = $(this).attr("chat-value");
    var name = $(this).html();
    $("#chat-input").attr("disabled", false);
    generate_message(name, 'self');
  })

  $("#chat-circle").click(function () {
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
  })

  $(".chat-box-toggle").click(function () {
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
  })

})

class VoiceRecorder {
  constructor() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("getUserMedia supported")
    } else {
      console.log("getUserMedia is not supported on your browser!")
    }

    this.mediaRecorder
    this.stream
    this.chunks = []
    this.isRecording = false

    this.recorderRef //= document.querySelector("#recorder")
    this.playerRef //= document.querySelector("#player")
    //this.startRef //= document.querySelector("#start")
    //this.stopRef //= document.querySelector("#stop")


    this.constraints = {
      audio: true,
      video: false
    }

  }

  handleSuccess(stream) {
    this.stream = stream
    this.stream.oninactive = () => {
      console.log("Stream ended!")
    };
    //this.recorderRef.srcObject = this.stream
    this.mediaRecorder = new MediaRecorder(this.stream)
    console.log(this.mediaRecorder)
    this.mediaRecorder.ondataavailable = this.onMediaRecorderDataAvailable.bind(this)
    this.mediaRecorder.onstop = this.onMediaRecorderStop.bind(this)
    //this.recorderRef.play()
    this.mediaRecorder.start(5000)
  }

  handleError(error) {
    console.log("navigator.getUserMedia error: ", error)
  }

  onMediaRecorderDataAvailable(e) { 
    this.chunks.push(e.data) 
  }

  onMediaRecorderStop(e) {
    const blob = new Blob(this.chunks, { 'type': 'audio/raw; codecs=opus' })
    var reader = new FileReader();
    let base64data;
    reader.readAsDataURL(blob);
    reader.onloadend = async function () {
      let text = reader.result
      base64data = text.substring(text.indexOf(',')+1);
      console.log(base64data);
      fetch("/stt", {

        // Adding method type
        method: "POST",
  
        // Adding body or contents to send
        body: JSON.stringify({
          audioBytes: base64data
        }),
  
        // Adding headers to the request
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
      .then(response => {
          response.text().then(response => {
            $("#chat-input").val(response)
            record_send.text("send");
          })
        })
    }
  }

  startRecording() {
    if (this.isRecording) return
    this.isRecording = true
    //this.startRef.innerHTML = 'Recording...'
    //this.playerRef.src = ''
    navigator.mediaDevices
      .getUserMedia(this.constraints)
      .then(this.handleSuccess.bind(this))
      .catch(this.handleError.bind(this))
  }

  stopRecording() {
    if (!this.isRecording) return
    this.isRecording = false
    //this.startRef.innerHTML = 'Record'
    //this.recorderRef.pause()
    this.mediaRecorder.stop()
  }

}

window.voiceRecorder = new VoiceRecorder()