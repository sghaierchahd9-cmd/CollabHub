package com.chahd.collabproject.DTO;

public class LoginRequest {
    private String email;
    private String motDePasse;




    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getMotDePasse() {
        return motDePasse;
    }
    public void setMotDePasse(String password) {
        this.motDePasse = password;
    }
}
