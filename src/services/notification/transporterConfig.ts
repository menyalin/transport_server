export const transporterConfig = () => {
  if (process.env.NODE_ENV === 'production')
    return {
      host: 'smtp.mail.ru',
      port: 587,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    }
  else
    return {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.FAKE_MAIL_USER,
        pass: process.env.FAKE_MAIL_PASSWORD,
      },
    }
}
