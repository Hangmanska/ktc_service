var http = require('http');
var sockjs = require('sockjs');

var utcp = require('Utility_tcp.js');
//var iChat = require('iChat_store.js');
var linq = require('linq.js');

// Clients list
var clients = {};


// Broadcast to all clients
function broadcast(message,room_id){
    // iterate through each client in clients object

   // console.log(message);





    for (var client in clients)
    {
      // send the message to that client
      if (clients[client].room == room_id)
      {
         clients[client].write(JSON.stringify(message));
         // clients[client].write(message);
      }

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

  }
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
        message: 'dtc_welcome',
        users: 'DTC',
        time: utcp.now(),
        usertype:'helpdesk'
    };

    // conn.write(JSON.stringify(send));
   // send_first(send);

  //console.log(conn.id);
  // on receive new data from client event
    conn.on('data', function (msg)
    {
      //console.log(msg);
        var json = JSON.parse(msg)
        conn.room = json.room;
        conn.user_type = json.usertype;

        broadcast(json, conn.room);

    /*
      switch (json.usertype)
      {
          case "helpdesk":
              {
                  if (conn.room > 0)
                  {
                      iChat.helpdesk_save(msg, function (res) {
                          if (res == 'oK') {
                            //  conn.room = json.room;
                              broadcast(json, conn.room);
                          }
                      });
                  }

              } break;
          case "user":
              {
                  iChat.user_save(msg, function (res)
                  {
                      if (res == 'oK')
                      {
                         // conn.room = json.room;
                          broadcast(json, conn.room);
                      }
                  });
              } break;

      }
    */
    
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
// server.listen(9999, '210.4.143.61');//'127.0.0.1');//

//Start Local
server.listen(9999, '127.0.0.1');//


//#region
    /* 
 echo.on('connection', function (conn) {

 
    debugger;
  // add this client to clients object
    clients[conn.id] = conn;
    connection_sond(conn);

    var send = {
        message: 'DTC Welcome',
        users: 'DTC',
        time: utcp.now(),
        usertype:'helpdesk'
    };

   // conn.write(JSON.stringify(send));

  //console.log(conn.id);
  // on receive new data from client event
    conn.on('data', function (msg)
    {
      //console.log(msg);
      var json = JSON.parse(msg)
        // {"room":"1","message":"dasdasad","username":"DTC-Enterprise","usertype":"helpdesk"}
   
 
      switch (json.usertype)
      {
          case "helpdesk":
              {
                  iChat.helpdesk_save(msg, function (res)
                  {
                      if (res == 'oK')
                      {
                          conn.room = json.room;
                          broadcast(json, conn.room);
                      }
                  });

              } break;
          case "user":
              {
                  iChat.user_save(msg, function (res)
                  {
                      if (res == 'oK')
                      {
                          conn.room = json.room;
                          broadcast(json, conn.room);
                      }
                  });
              } break;

      }

    
});

    // on connection close event
    conn.on('close', function() {
        delete clients[conn.id];
    });
  
});
    */

//#endregion