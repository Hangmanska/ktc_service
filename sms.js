

var text = require('textbelt');

text.send('66855679014', 'A sample text message!', 'intl', function (err) {
    if (err) {
        console.log(err);
    }
});