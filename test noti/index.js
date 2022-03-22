// Create a connection to http://localhost:9999/echo
var sock = new SockJS('http://61.91.14.253:9003/chat');
//var sock = new SockJS('http://61.91.14.253:9018/chat');
//var sock = new SockJS('http://localhost:9018/chat');

// Open the connection
sock.onopen = function() {
  console.log('open');
  //var room_id = 'db_10001';//req.id;
   var message_json = {
       "room": "db_10001"
      , "message_response": 'test'
    }
    sock.send(JSON.stringify(message_json));

};

// On connection close
sock.onclose = function() {
  console.log('close');
};

// On receive message from server
sock.onmessage = function(e) {
  // Get the content
  var content = JSON.parse(e.data);

  $('#chat-content').val(JSON.stringify(content));
  // Append the text to text area (using jQuery)
  /*
  $('#chat-content').val(function(i, text){
    return text + 'User ' + content.username + ': ' + content.message + '\n';
  });
  */
  
};

// Function for sending the message to server
function sendMessage(){
  // Get the content from the textbox
  var message = $('#message').val();
  var username = $('#username').val();

  // The object to send
  var send = {
    message: message,
    username: username
  };

  // Send it now
  sock.send(JSON.stringify(send));
}
