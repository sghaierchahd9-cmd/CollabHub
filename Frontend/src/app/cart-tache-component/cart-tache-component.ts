import { tap } from 'rxjs';
import { LoginService } from './../login-service';
import { UtilisateurService } from './../utilisateur-service';
import { Component, Input,Output, HostListener } from '@angular/core';
import { Tache } from '../Model/tache';
import { Utilisateur } from '../Model/Utilisateur'; 
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-tache-component',
  imports: [NgFor,CommonModule],
  templateUrl: './cart-tache-component.html',
  styleUrl: './cart-tache-component.css',
})
export class CartTacheComponent {
  @Input() tache : Tache=new Tache() ;
  @Input() afficheIcone =false;
  responsables : Utilisateur[]=[];
  estResponsable =false;
  connectedUser :Utilisateur|null;
  // dans le component
  priorityDB : Record<string, string>={
    'HAUTE': 'Haute',
    'MOYENNE': 'Moyenne',
    'Basse'  : 'Basse'

  };
 @Output() modifier = new EventEmitter<Tache>();
 @Output() mettreAJourAvancement =new EventEmitter<Tache>();
 @Output() ouvrirPiecesJointes = new EventEmitter<Tache>();

@Output() ouvrirDetail = new EventEmitter<Tache>();

@Output() voirInfos = new EventEmitter<Tache>();
   menuOuvert = false;


  constructor(private UtilisateurService: UtilisateurService, private loginservice :LoginService,private router :Router ){
    this.connectedUser=this.loginservice.loggedIUser;
    
  }

  priorityStyles: Record<string, string> = {
    'Haute': 'bg-orange-50 text-orange-700 border-orange-200',
    'Moyenne': 'bg-amber-50 text-[#D9C43F] border-amber-200',
    'Basse': 'bg-green-50 text-green-700 border-green-200'
  };
  ngOnInit(){
    this.getResponsable();
  }
public getResponsable() {
    this.UtilisateurService.getResponsablesTaches(this.tache.id).subscribe(
      (data) => {this.responsables= data.map(json => Utilisateur.fromJson(json));
      
      const userConnecteId = this.loginservice.loggedIUser?.id;
      this.estResponsable = this.responsables.some(r => r.id === userConnecteId);

      },
      (error)=> {console.log("une erreur est servenue")}
    )
  }
 toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOuvert = !this.menuOuvert;
  }

ouvrirModification() {
  this.menuOuvert = false;
  this.modifier.emit(this.tache);
}
 @HostListener('document:click')
  fermerMenu(): void {
    this.menuOuvert = false;
  }
  onMettreAJourAvancement(): void {
  this.menuOuvert = false;
  this.mettreAJourAvancement.emit(this.tache);
}
onVoirDetail(){
  this.voirInfos.emit(this.tache)
}
}
