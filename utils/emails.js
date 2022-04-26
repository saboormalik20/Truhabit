var smtpTransport = require("nodemailer-smtp-transport");
const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
module.exports = class Email {
  constructor(email, orderId, username, time, products) {
    this.to = email;
    this.username = username;
    this.orderId = orderId;
    this.time = time;
    this.from = `${process.env.EMAIL_FROM}`;
    this.products = products;
  }
  newTransport() {
    // if (process.env.NODE_ENV === "production") {
    //     return 1;
    // }a
    console.log("hiii");

    return nodemailer.createTransport(
      smtpTransport({
        host: "smtp.gmail.com",
        secureConnection: false,
        port: 465,
        secure: true,
        requiresAuth: true,
        domains: ["gmail.com", "googlemail.com"],
        auth: {
          user: process.env.EMAIL_MAILER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })
    );

    //  USING MAILTRAPaa

    // return nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });
  }
  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        username: this.username,
        orderId: this.orderId,
        time: this.time,
        to: this.to,
        products: this.products,
        subject,
      }
    );
    console.log(this.to);
    const mailOptions = {
      from: "rebalancea@gmail.com",
      to: this.to,
      subject: "Rebalance Order",
      html,
      text: htmlToText.fromString(html),
      //   html:
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.sends("welcome", "Welcome to the natours family!");
  }
  async sendPassword() {
    await this.send(
      "sendOTPS",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
  async sendPasswordUser() {
    await this.send(
      "sendOTPSUSER",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
