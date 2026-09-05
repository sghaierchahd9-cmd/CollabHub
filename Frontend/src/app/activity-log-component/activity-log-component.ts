

import { Component, OnChanges, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ActivityService } from '../activity-service';
import { Activity } from '../Model/Activity';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActivityNotificationService } from '../activity-notification-service';


@Component({
  selector: 'app-activity-log-component',
  imports: [CommonModule],
  templateUrl: './activity-log-component.html',
  styleUrl: './activity-log-component.css',
})
export class ActivityLogComponent implements OnInit, OnChanges {
  @Input() projetId :number =0;
  activities: Activity[]=[];
  private sub?: Subscription;
  constructor(private activityService : ActivityService,private notifService :ActivityNotificationService){}
  chargerActivities(){
     this.activityService.getActivitiesParProjet(this.projetId).subscribe(
      (data)=>{
        this.activities=data.map(json=> Activity.fromjson(json));
        console.log("acts : ",this.activities);

      },
      (error)=>{console.log("une erreur est servenue");}
    )

  }
  ngOnInit(){
    this.chargerActivities();
    this.sub=this.notifService.refresh$.subscribe(()=> this.chargerActivities());

  }
  ngOnChanges(){
   this.chargerActivities();
  }
}
