import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, User, CreateUserRequest, UpdateUserRequest } from '../services/user.service';
import { AuthService } from '../services/auth.service';

interface FormUser extends Partial<User> {
  password?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  showForm = false;
  isEdit = false;
  formUser: FormUser = {};
  editUserId: string | null = null;
  currentUser: any = null;
  showChangePasswordModal = false;
  adminPassword = { old: '', new: '', confirm: '' };
  adminInfo: User | null = null;
  showPassword: { [id: string]: boolean } = {};
  userToDelete: User | null = null;
  showPasswordField = false;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  toastMessage: string = '';
  showToast: boolean = false;
  toastError: boolean = false;
  isLoading = false;

  // For section selection (users/admin)
  selectedSection: string | null = null;

  constructor(
    private userService: UserService, 
    private authService: AuthService, 
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    // Redirect if not admin
    if (!this.currentUser || !this.currentUser.isAdmin) {
      this.router.navigate(['/home']);
    }
    // Load admin info immediately
    this.loadAdminInfo();
  }

  ngOnInit() {
    this.loadUsers();
    // Admin info already loaded in constructor
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        // Error loading users
        this.showError('Erreur lors du chargement des utilisateurs');
        this.isLoading = false;
      }
    });
  }

  loadAdminInfo() {
    // Fetch admin info from backend
    this.userService.getProfile().subscribe({
      next: (adminInfo) => {
        this.adminInfo = adminInfo;
      },
      error: (error) => {
        // Error loading admin info
        this.showError('Erreur lors du chargement des informations admin');
      }
    });
  }

  refresh() {
    this.loadUsers();
    this.cancel();
    this.showPassword = {};
  }

  openCreate() {
    this.showForm = true;
    this.isEdit = false;
    this.formUser = { fullname: '', phone: '' };
    this.editUserId = null;
  }

  openEdit(user: User) {
    this.showForm = true;
    this.isEdit = true;
    this.formUser = { ...user };
    this.editUserId = user.id;
  }

  save() {
    if (!this.formUser.username || !this.formUser.fullname || !this.formUser.email || (!this.isEdit && !this.formUser.password)) {
      this.showError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.formUser.email || '')) {
      this.showError('Veuillez saisir un email valide.');
      return;
    }

    // Phone is optional, but if provided, it must be valid
    if (this.formUser.phone && this.formUser.phone.trim() !== '') {
      const phoneRegex = /^\d{8,}$/;
      if (!phoneRegex.test(this.formUser.phone)) {
        this.showError('Le numéro de téléphone doit contenir au minimum 8 chiffres.');
        return;
      }
    }

    if (!this.isEdit && this.formUser.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(this.formUser.password)) {
        this.showError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.');
        return;
      }
    }

    if (this.isEdit && this.editUserId) {
      const updateData: UpdateUserRequest = {
        username: this.formUser.username,
        fullname: this.formUser.fullname,
        email: this.formUser.email,
        phone: this.formUser.phone
      };

      if (this.formUser.password) {
        updateData.password = this.formUser.password;
      }

      this.userService.updateUser(this.editUserId, updateData).subscribe({
        next: () => {
          this.showNotification('Compte utilisateur modifié !');
          this.refresh();
        },
        error: (error) => {
          this.showError(error.error?.message || 'Erreur lors de la modification');
        }
      });
    } else {
      const createData: CreateUserRequest = {
        username: this.formUser.username!,
        fullname: this.formUser.fullname!,
        email: this.formUser.email!,
        password: this.formUser.password!,
        phone: this.formUser.phone
      };

      this.userService.createUser(createData).subscribe({
        next: () => {
          this.showNotification('Compte utilisateur créé !');
          this.refresh();
        },
        error: (error) => {
          this.showError(error.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }

  delete(user: User) {
    this.confirmDelete(user);
  }

  cancel() {
    this.showForm = false;
    this.isEdit = false;
    this.formUser = {};
    this.editUserId = null;
    this.showPasswordField = false;
  }

  showNotification(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    this.toastError = false;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  showError(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    this.toastError = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  confirmDelete(user: User) {
    this.userToDelete = user;
  }

  cancelDelete() {
    this.userToDelete = null;
  }

  deleteConfirmed() {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          this.showNotification('Compte utilisateur supprimé !');
          this.refresh();
          this.userToDelete = null;
        },
        error: (error) => {
          this.showError(error.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  logout() {
    this.authService.logout();
  }

  selectSection(section: string) {
    this.selectedSection = section;
  }

  openChangePasswordModal() {
    this.showChangePasswordModal = true;
    this.adminPassword = { old: '', new: '', confirm: '' };
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
    this.adminPassword = { old: '', new: '', confirm: '' };
  }

  changeAdminPassword() {
    if (!this.adminPassword.old || !this.adminPassword.new || !this.adminPassword.confirm) {
      this.showError('Veuillez remplir tous les champs.');
      return;
    }

    if (this.adminPassword.new !== this.adminPassword.confirm) {
      this.showError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.adminPassword.new)) {
      this.showError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.');
      return;
    }

    // Use the new changePassword method that validates old password
    this.userService.changePassword(this.adminPassword.old, this.adminPassword.new).subscribe({
      next: () => {
        this.showNotification('Mot de passe modifié avec succès !');
        this.closeChangePasswordModal();
      },
      error: (error) => {
        this.showError(error.error?.message || 'Erreur lors de la modification du mot de passe');
      }
    });
  }
}
