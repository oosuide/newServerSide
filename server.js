const express = require("express");
const app = express();
const request = require("request");
const nodemailer = require("nodemailer");
// const config = require("./config/config");
const isEmpty = require("./is-empty");
const getCountryCode = require("./getCountryCode");

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

let transporter = nodemailer.createTransport({
  // host: config.Host,
  // port: config.Port,
  // secure: false,
  // auth: {
  //   user: config.USER,
  //   pass: config.PASSWORD
  // },
  // tls: {
  //   rejectUnauthorized: false
  // }
  // host: "weaver.whogohost.com",
  // port: 26,
  host: process.env.HOST,
  port: process.env.SMTPPORT,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take messages", success);
  }
});

app.get("/", (req, res) => {
  res.json({
    countries: getCountryCode.countries
  });
});

app.post("/subscribe", (req, res) => {
  if (
    req.body.recaptcha === undefined ||
    req.body.recaptcha === "" ||
    req.body.recaptch === null
  ) {
    return res.status(400).json({
      success: false,
      msg: "Please select Captcha"
    });
  }
  // secret key

  //verify URL
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${
    process.env.SECRET
  }&response=${req.body.recaptcha}&remoteip=${req.connection.remoteAddress}`;
  //make request to verify url

  request(verifyUrl, (err, response, body) => {
    body = JSON.parse(body);

    // if not successful;
    if (body.success !== undefined && !body.success) {
      return res.status(400).json({
        success: false,
        msg: "Failed Captcha Verification"
      });
    }
    // if successful;
    // res.json({
    //   success: true,
    //   msg: "Captcha Passed"
    // });

    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string"
    ) {
      return res.status(400).json({
        msg: "Entries must be string values"
      });
    }
    if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(email)) {
      return res.status(400).json({
        success: false,
        msg: `First Name Last Name and Email are required`
      });
    }

    let companyName = req.body.companyName || "Not Provided";
    let phoneNumber = req.body.phoneNumber || "Not Provided";
    // let countryCode = req.body.countryCode || "Not Provided";
    let comment = req.body.comment || "Not Provided";

    let content = `
    <div>
    <h1 style="font-size: 20px; color: #444;">A Message just came in from  ${firstName} ${lastName} < ${email}>:</h1>
    <h3>Company name: ${companyName}</h3>
    <h3>Phone Number: ${phoneNumber}</h3>
    <hr/>
    <h3>Here is the message:</h3>
   <h4 style="font-family: 'ubuntu'">${comment}</h4> 
    </div>
`;

    let mail = {
      from: `${firstName} ${lastName} <${process.env.USER}>`,
      to: "domainsales@anthill.net",
      subject: `New message on your website ${firstName} ${lastName}`,
      html: content
    };

    transporter.sendMail(mail, (err, data) => {
      console.log(data);
      if (err) {
        return res.status(400).json({
          msg: "Message not sent",
          success: false
        });
      }

      return res.json({
        success: true,
        msg: "Message Sent"
      });
    });
  });
});
// app.use(express.static("../build"));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "..", "build", "index.html"));
// });

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
