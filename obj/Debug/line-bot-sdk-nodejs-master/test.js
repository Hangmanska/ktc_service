
var LineBot = require('line-bot-sdk');

var client = LineBot.client({
    channelID: '1471523535',//'YOUR_CHANNEL_ID',
    channelSecret: 'e45f5c1fb4f207ba0cee1aece98bf33c',//'YOUR_CHANNEL_SECRET',
    channelMID: 'u72d07f59fa40a09c0646e88c8673cb76'//'YOUR_CHANNEL_MID'
});

client.sendText('u72d07f59fa40a09c0646e88c8673cb76', 'Message');