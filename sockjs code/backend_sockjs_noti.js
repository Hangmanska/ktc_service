var http = require('http');
var sockjs = require('sockjs');


var utcp = require('Utility_tcp.js');
var linq = require('linq.js');
var port_sock = 9004
// Clients list
var clients = {};


// Broadcast to all clients
function broadcast(message, room_id)
{
    // iterate through each client in clients object

   // console.log(message);
    debugger;
 

    for (var client in clients)
    {
        // send the message to that client
        if (clients[client].room == room_id) {
            clients[client].write(JSON.stringify(message));
            // clients[client].write(message);
        }
    }

/*
      if (clients[client].room != room_id && clients[client].user_type == 'helpdesk')
      {
          var send_alert = {
              message: message.message,
              users: message.username,
              time: utcp.now(),
              usertype: 'user_alert'
          };
          clients[client].write(JSON.stringify(send_alert));
      }
*/
   

}
//debugger;
// create sockjs server
var echo = sockjs.createServer();





// on new connection event
echo.on('connection', function (conn) {

 
   debugger;
  // add this client to clients object
    clients[conn.id] = conn;


    var send = {
        message: 'ktc_welcome',
        users: 'demo',
        time: utcp.now(),
        username: 'test'
    };

 

    // conn.write(JSON.stringify(send));
   // send_first(send);

  //console.log(conn.id);
  // on receive new data from client event
    conn.on('data', function (msg)
    {
        //console.log(msg);
        debugger;
        var json = JSON.parse(msg)
        conn.room = json.room;
        conn.username = json.username;

        broadcast(json, conn.room);

    
  });

  // on connection close event
    conn.on('close', function() {
    delete clients[conn.id];
  });
  
});



// Create an http server
var server = http.createServer();

// Integrate SockJS and listen on /echo
echo.installHandlers(server, { prefix: '/chat' });


// Start server
// server.listen(9004, '61.91.14.253');

//Start Local
    //server.listen(9004, '127.0.0.1');//
server.listen(port_sock);

exports.broadcast = broadcast;

    //http://www.gilesthomas.com/2013/02/a-super-simple-chat-app-with-angularjs-sockjs-and-node-js/
    //http://codesquire.com/post/NodeSockAngularChat
    //https://truongtx.me/2014/06/07/simple-chat-application-using-sockjs