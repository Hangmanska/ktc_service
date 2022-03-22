

var ngrok = require('ngrok-daemon')

ngrok.start(8080) // Port
  .then(function(tunnel) {
      console.log(tunnel)
    // Tunnel has three propeties:
    // - url - URL to the started tunnel
    // - pid - process id of ngrok (PID)
    // - log - path to ngrok log in temporary directory
  })
  .catch(function(er) {
      console.log(er);
    // Failed to start ngrok on given port (eg ngrok is not installed)
  })

  //https://github.com/kossnocorp/ngrok-daemon