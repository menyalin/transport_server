import nodemailer from 'nodemailer'

class NotificationService {
  constructor() {
    this.transport = {
      host: 'smtp.mail.ru',
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    }

    this.transporter = nodemailer.createTransport(this.transport)
  }

  async sendRestorePasswordLink({ email, token }) {
    const link = process.env.CLIENT_URL + '/auth/restore_password/' + token
    const message = {
      from: 's4log notification<no-reply@s4log.ru>',
      to: email,
      subject: 'Восстановления пароля',

      html: `
      <h2>s4log</h2>
      <p>Для восстановления пароля перейдите по <a target="_blank" href="${link}">ссылке</a></p>
      <br/>
      <small>Ссылка действительна 30 минут</small>
      `,
    }

    await this.transporter.sendMail(message)
  }
}

export default new NotificationService()
