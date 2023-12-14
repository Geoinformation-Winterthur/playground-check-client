import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { PlaygroundService } from 'src/services/playgrounds.service';
import { InspectionCriterion } from '../model/inspection-criterion';

@Component({
  selector: 'spk-inspection-criterion',
  templateUrl: './inspection-criterion.component.html',
  styleUrls: ['./inspection-criterion.component.css']
})
export class InspectionCriterionComponent implements OnInit {

  @Input() inspectionCriterion: InspectionCriterion = new InspectionCriterion();

  playgroundService: PlaygroundService;

  constructor(playgroundService: PlaygroundService) {
    this.playgroundService = playgroundService;
  }

  ngOnInit(): void {
  }

}


