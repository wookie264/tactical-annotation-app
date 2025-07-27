import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { AuthGuard } from './guards/auth.guard';
import { AdminComponent } from './admin/admin';
import { Userhome } from './userhome/userhome';
import { VideoComponent } from './video/video';
import { History } from './history/history';
import { UserProfileComponent } from './user-profile/user-profile';
import { ResetPasswordComponent } from './reset-password/reset-password';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'home', component: Home, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent },
  { path: 'userhome', component: Userhome , canActivate: [AuthGuard]},
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard]},
  { path: 'auto-annotation', component: VideoComponent , canActivate: [AuthGuard]},
  { path: 'history', component: History , canActivate: [AuthGuard]}
];
