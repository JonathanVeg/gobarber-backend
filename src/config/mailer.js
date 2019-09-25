const MailerConfig = {
  secure: false,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'Jonathan Silva <noreply@gobarber.com>',
  },
};

export default MailerConfig;
