/**
 * Email helper using nodemailer.
 * Reads EMAIL_SERVER (SMTP connection string) and EMAIL_FROM from env.
 *
 * EMAIL_SERVER format: smtp://user:pass@host:port
 *
 * Run `npm install nodemailer @types/nodemailer` before using.
 */
import nodemailer from 'nodemailer'

interface SendMailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  const transport = nodemailer.createTransport(process.env.EMAIL_SERVER as string)

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html ?? options.text,
  })
}
