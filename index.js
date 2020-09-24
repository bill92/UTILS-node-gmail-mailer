const express = require('express');const bodyParser = require('body-parser');const nodemailer = require('nodemailer');
const { google } = require("googleapis");
// Air quotes ".env" file
const keys = require('./config/keys');
const OAuth2 = google.auth.OAuth2;

const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());

// Pulling each value from the "env" object, not normally necessary obv
const { myEmail,
        googleClientId,
        googleClientSecret,
        googleRedirectURI,
        refreshToken } = keys;


// Set up oAuth 2 client
const myOAuth2Client = new OAuth2(
  googleClientId,
  googleClientSecret,
  googleRedirectURI
);

// Set refresh token
myOAuth2Client.setCredentials({
  refresh_token: refreshToken
});

// Get fresh access token
const myAccessToken = myOAuth2Client.getAccessToken();
// Configure mailer
const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: myEmail,
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    refreshToken: refreshToken,
    accessToken: myAccessToken
  }
});

// Routes, everything above would be in a file and export it to here
app.post('/send', (req, res) => {
  // Initialize the email to be sent
  const mailOptions = {
    from: myEmail,
    to: 'email@email.com',
    subject: 'Test mail subject',
    html: '<p>Test mail body</p>'
  };

  // Send the email
  transport.sendMail(mailOptions, (err, result) => {
    if(err){
      res.send(err)
    };
    // Dont forget to close the connection!
    transport.close();
    res.send({message: 'Email has been sent bud'})
  })

})

app.get('/', (req, res) => {
  res.send({ msg: 'hi' });
});

app.listen(PORT, (req, res) => {
  console.log('listening on port 3000');
});
