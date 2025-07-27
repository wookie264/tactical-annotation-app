import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, User, UpdateUserRequest } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  formUser: UpdateUserRequest = {};
  isEditing = false;
  isLoading = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  showMessage = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.formUser = { ...user };
        this.isLoading = false;
      },
      error: (error) => {
        // Error loading profile
        this.showMessage = true;
        this.message = 'Erreur lors du chargement du profil';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }

  startEditing() {
    this.isEditing = true;
    this.formUser = { ...this.currentUser };
  }

  cancelEditing() {
    this.isEditing = false;
    this.formUser = { ...this.currentUser };
  }

  saveProfile() {
    if (!this.formUser.username || !this.formUser.fullname || !this.formUser.email) {
      this.showMessage = true;
      this.message = 'Veuillez remplir tous les champs obligatoires';
      this.messageType = 'error';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.formUser.email || '')) {
      this.showMessage = true;
      this.message = 'Veuillez saisir un email valide';
      this.messageType = 'error';
      return;
    }

    // Phone is optional, but if provided, it must be valid
    if (this.formUser.phone && this.formUser.phone.trim() !== '') {
      const phoneRegex = /^\d{8,}$/;
      if (!phoneRegex.test(this.formUser.phone)) {
        this.showMessage = true;
        this.message = 'Le numéro de téléphone doit contenir au minimum 8 chiffres';
        this.messageType = 'error';
        return;
      }
    }

    this.isLoading = true;
    this.userService.updateProfile(this.formUser).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.isEditing = false;
        this.isLoading = false;
        this.showMessage = true;
        this.message = 'Profil mis à jour avec succès';
        this.messageType = 'success';
        
        // Update auth service with new user info
        this.authService.updateCurrentUser({
          ...updatedUser,
          isAdmin: this.currentUser?.isAdmin || false
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.showMessage = true;
        this.message = error.error?.message || 'Erreur lors de la mise à jour du profil';
        this.messageType = 'error';
      }
    });
  }

  changePassword() {
    if (!this.formUser.password) {
      this.showMessage = true;
      this.message = 'Veuillez saisir un nouveau mot de passe';
      this.messageType = 'error';
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.formUser.password)) {
      this.showMessage = true;
      this.message = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre';
      this.messageType = 'error';
      return;
    }

    this.isLoading = true;
    const updateData: UpdateUserRequest = { password: this.formUser.password };
    
    this.userService.updateProfile(updateData).subscribe({
      next: () => {
        this.isLoading = false;
        this.formUser.password = '';
        this.showMessage = true;
        this.message = 'Mot de passe modifié avec succès';
        this.messageType = 'success';
      },
      error: (error) => {
        this.isLoading = false;
        this.showMessage = true;
        this.message = error.error?.message || 'Erreur lors de la modification du mot de passe';
        this.messageType = 'error';
      }
    });
  }

  goBack() {
    this.router.navigate(['/userhome']);
  }

  logout() {
    this.authService.logout();
  }
} 