import { Utilisateur } from "./Utilisateur";

export class Equipe {
    id! :  number ;
    nom !:string ;
    description! : string ;
    dateSupression! :string ;
    dateCreation! : string ;
    members: Utilisateur[]=[] ;

  
    static fromJson(json: any): Equipe {
    const equipe = new Equipe();
    equipe.id = json.id;
    equipe.nom =json.nom;
    equipe.description=json.description;
    equipe.dateCreation =json.dateCreation;
    equipe.dateSupression=json.dateSuppression;
    return equipe ;
    
  }





   




}