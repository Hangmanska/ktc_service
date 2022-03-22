
var nodemailer = require('nodemailer');

function test(_from,_to,_subject,_measage)
{

    
var transporter = nodemailer.createTransport({
    service: 'gmail',
   // host: 'smtp.gmail.com',
  //  port: 587,
    auth: {
      user: 'crmplanb@planbmedia.co.th',//'saksphosri@gmail.com',
      pass:'ifarwrhmdlvtcape'
      //  pass: 'yysrxfjgbzririla'
    }
  });

  var mailOptions = {
    from: _from,
    to: _to,
    subject: _subject,
    text: _measage
  };

  //transporter.verify().then(console.log).catch(console.error);
    
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}


test('saksphosri@gmail.com','saksphosri@gmail.com','Sending Email via Node.js','test_send mail')