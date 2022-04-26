const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
module.exports = class Email {
  constructor(user, resetcode) {
    this.to = user.email;
    this.username = user.name.split(" ")[0];
    this.resetcode = resetcode;
    this.from = `${process.env.EMAIL_FROM}`;
  }
  newTransport() {
    // if (process.env.NODE_ENV === "production") {
    //     return 1;
    // }
    console.log("hiii");

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_MAILER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    //  USING MAILTRAP

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
        resetcode: this.resetcode,
        subject,
      }
    );
    console.log(this.to);
    const mailOptions = {
      from: "dejurenode@gmail.com",
      to: this.to,
      subject: "Reset Password",
      html,
      text: htmlToText.fromString(html),
      //   html:
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("Welcome", "Welcome to the starschat!");
  }
  async sendPassword() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
