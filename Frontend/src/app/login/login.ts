import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest, ForgotPasswordRequest } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginData: LoginRequest = {
    username: '',
    password: '',
    rememberMe: false
  };

  forgotPasswordEmail: string = '';
  showForgotPassword: boolean = false;
  isLoggingIn = false;
  isProcessing = false;
  loginError: string | null = null;
  successMessage: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin() {
    if (!this.loginData.username || !this.loginData.password) {
      this.loginError = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoggingIn = true;
    this.loginError = null;
    this.successMessage = null;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoggingIn = false;
        // Redirect based on role
        const user = this.authService.getCurrentUser();
        if (user && user.isAdmin) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/userhome']);
        }
      },
      error: (error) => {
        this.isLoggingIn = false;
        this.loginError = error.error?.message || 'Échec de la connexion';
        // Login error
      }
    });
  }

  showForgotPasswordForm() {
    this.showForgotPassword = true;
    this.loginError = null;
    this.successMessage = null;
  }

  showLoginForm() {
    this.showForgotPassword = false;
    this.forgotPasswordEmail = '';
    this.loginError = null;
    this.successMessage = null;
  }

  onForgotPassword() {
    if (!this.forgotPasswordEmail) {
      this.loginError = 'Veuillez saisir votre adresse email';
      return;
    }

    this.isProcessing = true;
    this.loginError = null;
    this.successMessage = null;

    const request: ForgotPasswordRequest = {
      email: this.forgotPasswordEmail
    };

    this.authService.forgotPassword(request).subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.successMessage = 'Un lien de réinitialisation a été envoyé à votre adresse email';
        // Forgot password response
      },
      error: (error) => {
        this.isProcessing = false;
        this.loginError = error.error?.message || 'Échec de l\'envoi du lien de réinitialisation';
        // Forgot password error
      }
    });
  }
}
