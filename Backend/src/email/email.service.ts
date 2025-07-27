/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter for development (using Gmail or other SMTP)
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // or use your own SMTP settings
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, username: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@tactical-annotation.com',
      to: email,
      subject: 'Réinitialisation de mot de passe - Analyse Tactique Football',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Réinitialisation de mot de passe</h2>
          <p>Bonjour ${username},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour l'application d'analyse tactique football.</p>
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Réinitialiser le mot de passe
            </a>
          </div>
          <p><strong>Ce lien expirera dans 1 heure.</strong></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <p>Pour des raisons de sécurité, ne partagez jamais ce lien.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #64748b; font-size: 0.9rem;">
            Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, username: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@tactical-annotation.com',
      to: email,
      subject: 'Bienvenue - Analyse Tactique Football',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Bienvenue sur l'application d'analyse tactique football !</h2>
          <p>Bonjour ${username},</p>
          <p>Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter et commencer à analyser vos séquences vidéo.</p>
          <p>Fonctionnalités disponibles :</p>
          <ul>
            <li>Upload de vidéos</li>
            <li>Annotations tactiques</li>
            <li>Analyse IA automatique</li>
            <li>Historique des annotations</li>
          </ul>
          <p>Si vous avez des questions, n'hésitez pas à contacter l'équipe de support.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #64748b; font-size: 0.9rem;">
            Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      return false;
    }
  }
} 