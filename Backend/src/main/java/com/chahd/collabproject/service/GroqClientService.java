package com.chahd.collabproject.service;

import com.chahd.collabproject.DTO.GroqRequest;
import com.chahd.collabproject.DTO.GroqResponse;
import com.chahd.collabproject.Exceptions.ResumeIaIndisponibleException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@Slf4j
public class GroqClientService {
    private final RestTemplate restTemplate ;

    @Value("${groq.api.key}")
    private String apiKey;
    @Value("${groq.api.model}")
    private String apiModel;
    @Value("${groq.api.url}")
    private String apiUrl;
    public GroqClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String genererResume(String promptSysteme , String promptUtilisateur){
        GroqRequest requete = new GroqRequest(apiModel, List.of(
                new GroqRequest.Message("system", promptSysteme),
                new GroqRequest.Message("user", promptUtilisateur)
        ), 0.3 ,500);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        try {
            GroqResponse reponse = restTemplate.postForObject(
                    apiUrl,
                    new HttpEntity<>(requete, headers),
                    GroqResponse.class
            );

            if (reponse == null || reponse.choices().isEmpty()) {
                throw new ResumeIaIndisponibleException("Réponse vide du service IA");
            }
            return reponse.choices().get(0).message().content();

        } catch (HttpStatusCodeException e) {
            // Groq (comme toute API compatible OpenAI) renvoie le détail de l'erreur dans le corps JSON
            log.error("Erreur Groq [{}] : {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ResumeIaIndisponibleException("Le service de résumé IA est momentanément indisponible");

        }
        catch (RestClientException e) {

            throw new ResumeIaIndisponibleException("Le service de résumé IA est momentanément indisponible");
        }



    }
}
