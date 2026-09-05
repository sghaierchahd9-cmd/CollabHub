import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Utilisateur } from '../Model/Utilisateur';
import { LoginService } from '../login-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { SideBarStateService } from '../side-bar-state-service';
import { AvatarComponent } from "../avatar-component/avatar-component";
@Component({
  selector: 'app-sidebar-component',
  imports: [RouterLink, RouterLinkActive, CommonModule, AvatarComponent],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css',
})
export class SidebarComponent {
   activeClass = "bg-[#3a7ca5] text-white font-['Inter',sans-serif] font-semibold text-sm text-left transition-colors duration-150";
   LoggedInUser: Utilisateur | null = null;
   @Output() deconnexionDemandee = new EventEmitter<void>();
  constructor(private loginService: LoginService,private router: Router ,public sidebarState: SideBarStateService) {
    this.LoggedInUser = this.loginService.loggedIUser;
  }
  

  


  demanderDeconnexion(): void {
    this.deconnexionDemandee.emit();
  }
}
