var record_send = $("#record-send")
$(function() {
    var INDEX = 0; 
    var voiceRecorder = new VoiceRecorder();
    $("#chat-submit").click(function(e) {
      e.preventDefault();
      var msg = $("#chat-input").val(); 
      if(msg.trim() == ''){
        if(record_send.text() == "mic")
        {
          record_send.text("stop")
          voiceRecorder.startRecording();
        }    
        else
        {
          voiceRecorder.stopRecording();
          record_send.text("mic");
        }    
      }
      else{
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
        setTimeout(function() {      
          generate_message(msg, 'user');  
        }, 1000)
        }
      
    })
    
    $("#chat-input").keyup(()=>{
        console.log(record_send.text(), $("#chat-input").val().trim())
        if( $("#chat-input").val().trim() == '')
            record_send.text("mic");
        else 
            record_send.text("send");
    })
    function generate_message(msg, type) {
      INDEX++;
      var str="";
      str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
      str += "          <span class=\"msg-avatar\">";
      str += "            <img src=\"https:\/\/image.crisp.im\/avatar\/operator\/196af8cc-f6ad-4ef7-afd1-c45d5231387c\/240\/?1483361727745\">";
      str += "          <\/span>";
      str += "          <div class=\"cm-msg-text\">";
      str += msg;
      str += "          <\/div>";
      str += "        <\/div>";
      $(".chat-logs").append(str);
      $("#cm-msg-"+INDEX).hide().fadeIn(300);
      if(type == 'self'){
       $("#chat-input").val(''); 
      }    
      $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight}, 1000);    
    }  
    
    function generate_button_message(msg, buttons){    
      /* Buttons should be object array 
        [
          {
            name: 'Existing User',
            value: 'existing'
          },
          {
            name: 'New User',
            value: 'new'
          }
        ]
      */
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
    }
    
    $(document).delegate(".chat-btn", "click", function() {
      var value = $(this).attr("chat-value");
      var name = $(this).html();
      $("#chat-input").attr("disabled", false);
      generate_message(name, 'self');
    })
    
    $("#chat-circle").click(function() {    
      $("#chat-circle").toggle('scale');
      $(".chat-box").toggle('scale');
    })
    
    $(".chat-box-toggle").click(function() {
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
      this.mediaRecorder.start()
    }
  
    handleError(error) {
      console.log("navigator.getUserMedia error: ", error)
    }
    
    onMediaRecorderDataAvailable(e) { this.chunks.push(e.data) }
    
    onMediaRecorderStop(e) { 
        const blob = new Blob(this.chunks, { 'type': 'audio/raw; codecs=opus' })
        fetch("/stt", {
      
          // Adding method type
          method: "POST",
            
          // Adding body or contents to send
          body: JSON.stringify({
              audioBytes : blob
          }),
            
          // Adding headers to the request
          headers: {
              "Content-type": "application/json; charset=UTF-8"
        }
      }).then(response => {
          response.text().then(response => {
            $("#chat-input").val(response)
            record_send.text("send");
          })     
        }) 
        /*var reader = new FileReader();
        reader.readAsDataURL(blob); 
        reader.onloadend = async function() {
            var base64data = reader.result; 
            
          }     
            //console.log(base64data);
        }*/
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