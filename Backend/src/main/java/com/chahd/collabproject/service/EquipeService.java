package com.chahd.collabproject.service;

import com.chahd.collabproject.entity.Equipe;
import com.chahd.collabproject.entity.MembrePole;
import com.chahd.collabproject.repository.EquipeRepository;
import com.chahd.collabproject.repository.MembrePoleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipeService {
  private final EquipeRepository equipeRepository;
    private final MembrePoleRepository membrePoleRepository;

    public ResponseEntity<Void> deleteById(@PathVariable int id) {
      Equipe equipe= equipeRepository.findById(id).orElseThrow(()-> new EntityNotFoundException("equipe not found"));
      equipe.setDateSuppression(OffsetDateTime.now());
      equipeRepository.save(equipe);
       List<MembrePole> mp= membrePoleRepository.findByEquipeIdAndDateSuppressionIsNull(equipe.getId());
       for (MembrePole m : mp) {
           m.setDateSuppression(OffsetDateTime.now());
           membrePoleRepository.save(m);
       }
       return ResponseEntity.ok().build();


    }
}
