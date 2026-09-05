package com.chahd.collabproject.Controller;

import com.chahd.collabproject.DTO.ActivityLogDTO;
import com.chahd.collabproject.entity.ActivityLog;
import com.chahd.collabproject.repository.ActivityLogRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/activities")
public class ActivityLogController {
    private final ActivityLogRepository activityLogRepository;
    public ActivityLogController(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }
    @GetMapping("/projet/{id}")
    public List<ActivityLogDTO> findByProjetId(@PathVariable int id) {
        List<ActivityLog> acts= this.activityLogRepository.findTop5ByProjetIdOrderByDateEvenementDesc(id);
        List<ActivityLogDTO> dtos = new ArrayList<>();
        ActivityLogDTO activityLogDTO=new ActivityLogDTO();
        for (ActivityLog act : acts) {
            dtos.add(activityLogDTO.toDTO(act));
        }
        return dtos;

    }

}
