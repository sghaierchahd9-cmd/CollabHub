import { Component, EventEmitter, Output } from '@angular/core';
import { Input } from '@angular/core';
import {CommonModule} from '@angular/common';
import { NotificationBellComponent } from "../notification-bell-component/notification-bell-component";
import { SideBarStateService } from '../side-bar-state-service';

@Component({
  selector: 'app-header-component',
  imports: [CommonModule, NotificationBellComponent],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent {
  @Input() title: string ='';
  @Input() subtitle: string = '';
  @Input() actionButtonText: string = '';
  @Output() clickedbutton = new EventEmitter<boolean>() ;
  @Input()  ajout=false;
  @Input() modifier=false;
  onActionButtonClick(){
    this.clickedbutton.emit(true) ;
  }
 constructor(public sidebarState: SideBarStateService) {}
}
