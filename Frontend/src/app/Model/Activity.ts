export class Activity {
      initiales!: string ;
      texte!:string;
     badge!:string;
     LocalDateTime!:string;

     public static fromjson(json:any){
        return  Object.assign(new Activity(), json);
     }
}
