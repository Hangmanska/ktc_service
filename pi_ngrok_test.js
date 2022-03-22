
const ngrok = require('ngrok');
(async function() {
  const url = await ngrok.connect(8081);
  console.log(url);
})();