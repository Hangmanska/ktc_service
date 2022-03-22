
/*
var sys = require('sys');
var net = require('net');
var mqtt = require('mqtt');

var io  = require('socket.io').listen(5001);
var client = mqtt.createClient(1883, '127.0.0.1');

client.options.reconnectPeriod = 0;

client.on('message', function(topic, message) {
  console.log(message);
  sys.puts(topic+'='+message);
  io.sockets.in(topic).emit('mqtt',{'topic': String(topic), 'payload':String(message)});
});

io.sockets.on('connection', function (socket) {
  socket.on('subscribe', function (data) {
    console.log('Subscribing to '+data.topic);
    socket.join(data.topic);
    client.subscribe(data.topic);
  });
});


var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost:1883')
 
client.on('connect', function () {
  client.subscribe('XDK/Test')
  client.publish('XDK/Test', 'Hello mqtt')
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})


*/

console.log('start mqtt ');


var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://test.mosquitto.org')
 
client.on('connect', function () {
  client.subscribe('presence')
  client.publish('presence', 'Hello mqtt')
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
 // client.end()
})