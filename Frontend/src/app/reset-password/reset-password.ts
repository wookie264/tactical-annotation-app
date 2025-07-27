import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, ResetPasswordRequest } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetData: ResetPasswordRequest = {
    token: '',
    newPassword: '',
    confirmPassword: ''
  };

  isProcessing = false;
  error: string | null = null;
  successMessage: string | null = null;
  token: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get token from URL query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.resetData.token = this.token;
      } else {
        this.error = 'Token de réinitialisation manquant ou invalide';
      }
    });
  }

  onResetPassword() {
    if (!this.resetData.newPassword || !this.resetData.confirmPassword) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.resetData.newPassword !== this.resetData.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.resetData.newPassword)) {
      this.error = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre';
      return;
    }

    this.isProcessing = true;
    this.error = null;
    this.successMessage = null;

    const request: ResetPasswordRequest = {
      token: this.resetData.token,
      newPassword: this.resetData.newPassword
    };

    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.successMessage = 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isProcessing = false;
        this.error = error.error?.message || 'Erreur lors de la réinitialisation du mot de passe';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
} 