import { Component ,signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar-component/sidebar-component';

import { LoginService } from '../login-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SideBarStateService } from '../side-bar-state-service';
import { estTokenExpire } from '../auth.guard';
@Component({
  selector: 'app-layout-component',
  imports: [RouterOutlet, SidebarComponent,CommonModule],
  templateUrl: './layout-component.html',
  styleUrl: './layout-component.css',
})
export class LayoutComponent {
  showLogoutConfirm = signal(false);

  constructor(
    private loginService: LoginService,
    private router: Router,
    public sidebarState: SideBarStateService
  ) {}

  annulerDeconnexion(): void {
    this.showLogoutConfirm.set(false);
  }

  confirmerDeconnexion(): void {
    this.loginService.logout();
    this.showLogoutConfirm.set(false);
    this.router.navigate(['/login'], { replaceUrl: true });
  }
  private pageshowHandler = (event: PageTransitionEvent) => {
    if (event.persisted) {
      const token = this.loginService.token;
      if (!token || estTokenExpire(token)) {
        window.location.replace('/login');
      }
    }
  };

  ngOnInit(): void {
    window.addEventListener('pageshow', this.pageshowHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('pageshow', this.pageshowHandler);
  }
}
