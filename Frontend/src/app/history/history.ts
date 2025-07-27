import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Annotation } from '../annotation/annotation';
import { Rapport } from '../rapport/rapport';

@Component({
  selector: 'app-history',
  imports: [CommonModule,Annotation,Rapport],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History implements OnInit {
  currentUser: User | null = null;
  goBackEvent: any;
   constructor(
  private router: Router,
  private authService: AuthService
) {
  this.currentUser = this.authService.getCurrentUser();
}
  logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
}


 goToManualHistory() {
    this.selectHistory('manual');
  }

  goToIAHistory() {
    this.selectHistory('ia');
  }
 
  goBack() {
    this.router.navigate(['/userhome']);
  }

 selectedHistory: 'manual' | 'ia' | null = null;

ngOnInit() {
  // Set default selection to manual annotations
  this.selectedHistory = 'manual';
}

selectHistory(type: 'manual' | 'ia') {
  this.selectedHistory = type;
}
}
