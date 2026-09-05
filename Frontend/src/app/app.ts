import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login-component/login-component';
import { SidebarComponent } from "./sidebar-component/sidebar-component";
import { TachesComponent } from "./taches-component/taches-component";
import { ProjetCartComponent } from "./projet-cart-component/projet-cart-component";
import { ProjetComponent } from "./projet-component/projet-component"; 
import { FormAjoutProjet } from './form-ajout-projet/form-ajout-projet';
import { LoginService } from './login-service';
import { NotificationListComponent } from "./notification-list-component/notification-list-component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Collabplateforme');
  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.loginService.reconnecterSiToken();
  }
}
