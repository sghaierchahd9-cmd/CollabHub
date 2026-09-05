import { Utilisateur } from "./Utilisateur";

export interface LoginResponse {
  token: string;
  user: any;
}