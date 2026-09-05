import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import {DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { TacheService } from '../tache-service';
import { CartTacheComponent } from '../cart-tache-component/cart-tache-component';
import { CommonModule } from '@angular/common';
import { Tache, StatutTache } from '../Model/tache';
import { Utilisateur } from '../Model/Utilisateur';

interface Colonne {
  statut: StatutTache;
  label: string;
  taches: Tache[];
}

@Component({
  selector: 'app-kanban-component',
  imports: [CartTacheComponent,DragDropModule,CommonModule],
  templateUrl: './kanban-component.html',
  styleUrl: './kanban-component.css',
})

export class KanbanComponent implements OnChanges {
    colonnes: Colonne[] = [
    { statut: 'A_FAIRE', label: 'À faire', taches: [] },
    { statut: 'EN_COURS', label: 'En cours', taches: [] },
    { statut: 'TERMINEE', label: 'Terminée', taches: [] },
    { statut: 'BLOQUEE', label: 'Bloquée', taches: [] },
  ];

  statusDotStyles: Record<string, string> = {
    'A_FAIRE': 'bg-slate-300',
    'EN_COURS': 'bg-blue-500',
    'TERMINEE': 'bg-green-500',
    'BLOQUEE': 'bg-red-400',
  };
  @Output() drop = new EventEmitter<boolean>()
  @Input() taches :Tache[]=[];
  @Output() modifier = new EventEmitter<Tache>();
  @Output() tauxAvancement = new EventEmitter<Tache>();
  @Output() detailTache =  new EventEmitter<Tache>();
  @Input() connectedUser: Utilisateur | null = null;
  @Output() selectedTache= new EventEmitter<Tache>();
  @Output() piecesJointes = new EventEmitter<Tache>();
  @Input() afficheIcone =false ;
  @Output() voirInfos =new EventEmitter<Tache>();
  get idsColonnes(): string[] {
    return this.colonnes.map(c => c.statut);
  }

  constructor(private tacheService: TacheService) {}

  ngOnInit(): void {
    
      this.repartir(this.taches);
   
  }
ngOnChanges(changes: SimpleChanges): void {
    if (changes['taches']) {
      this.repartir(this.taches);
    }
  }
  private repartir(taches: Tache[]): void {
    for (const colonne of this.colonnes) {
      colonne.taches = taches.filter(t => t.statut === colonne.statut);
    }
  }

  onDrop(event: CdkDragDrop<Tache[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const tacheDeplacee = event.container.data[event.currentIndex];
    const nouvelleColonne = this.colonnes.find(c => c.taches === event.container.data);
    if (!nouvelleColonne) return;

    const ancienStatut = tacheDeplacee.statut;
    tacheDeplacee.statut = nouvelleColonne.statut;

    this.tacheService.changerStatut(tacheDeplacee.id, nouvelleColonne.statut).subscribe({
      next: () => {
       this.drop.emit(true);
      },
      error: () => {
        // rollback visuel si l'appel échoue
        tacheDeplacee.statut = ancienStatut;
        transferArrayItem(
          event.container.data,
          event.previousContainer.data,
          event.currentIndex,
          event.previousIndex
        );
      }
    });
  }
  

peutDeplacer(tache: Tache): boolean {
  if (!this.connectedUser) return false;

  const estAdminOuChef = this.connectedUser.role === 'ADMINISTRATEUR'
    || this.connectedUser.role === 'CHEF_PROJET';

  if (estAdminOuChef) return true;

  // collaborateur : uniquement s'il est responsable de la tâche
  return tache.collaborateurs?.some(c => c.id === this.connectedUser!.id) ?? false;
}
selectTache(tache:Tache){
  this.selectedTache.emit();
}
}

