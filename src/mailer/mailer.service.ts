import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  constructor(private readonly prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: 587,
      secure: false,

      auth: {
        user: process.env.ADMINEMAIL,
        pass: process.env.PASSWORDADMIN,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log('SMTP USER:', process.env.ADMINEMAIL);
    console.log('SMTP PASSWORD:', process.env.PASSWORDADMIN);
  }

  async sendMailAfterRegistration(email: string) {
    const emailUser = await this.prisma.user.findUnique({
      where: { email: email },
    });
    if (!emailUser) {
      throw new Error(`Nothing email ${email} in db`);
    }
    const info: SentMessageInfo = await this.transporter.sendMail({
      from: process.env.ADMINEMAIL, // sender address
      to: emailUser.email, // list of receivers
      subject: 'Inscription Confirmée✔', // Subject line
      text: `Bonjour ${emailUser.email}, votre inscription a bien été prise en compte.`,
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #496DDB;">Bienvenue sur Smart Invoice 👋</h2>
        <p>Bonjour <strong>${emailUser.email}</strong>,</p>
        <p>Nous vous confirmons que votre inscription a été prise en compte avec succès.</p>
        <p>Vous pouvez désormais vous connecter à votre compte et commencer à gérer vos devis et factures simplement.</p>
        <a href="https://smart-invoice.example.com/login" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #EE8434; color: white; text-decoration: none; border-radius: 4px;">
          Se connecter
        </a>
        <p style="margin-top: 30px; font-size: 0.9em; color: #888;">Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer ce message.</p>
      </div>
    `,
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  }

  async newPassword(email: string) {
    const emailUser = await this.prisma.user.findUnique({
      where: { email: email },
    });
    if (!emailUser) {
      throw new Error(`Nothing email ${email} in db`);
    }
    const info: SentMessageInfo = await this.transporter.sendMail({
      from: process.env.ADMINEMAIL, // sender address
      to: emailUser.email, // list of receivers
      subject: 'Confirmation Mot de Passe Confirmée✔', // Subject line
      text: `Bonjour ${emailUser.email}, votre modification a bien été prise en compte.`,
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #496DDB;">Bienvenue sur Smart Invoice 👋</h2>
      <p>Bonjour <strong>${emailUser.email}</strong>,</p>
      <p>Nous vous confirmons que votre modification du mot de passe a été prise en compte avec succès.</p>
      <p>Vous pouvez désormais vous reconnecter à votre compte.</p>
      <a href="https://smart-invoice.example.com/login" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #EE8434; color: white; text-decoration: none; border-radius: 4px;">
        Se connecter
      </a>
      <p style="margin-top: 30px; font-size: 0.9em; color: #888;">Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer ce message.</p>
    </div>
  `,
    });

    console.log('Message sent: %s', info.messageId);
  }
}
