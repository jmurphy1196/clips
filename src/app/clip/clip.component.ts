import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import IClip from '../models/clip.model';
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss'],
})
export class ClipComponent implements OnInit {
  id = '';
  clip: IClip | null = null;
  created_at: Date | null = null;
  constructor(public route: ActivatedRoute, public clipService: ClipService) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.clipService.getClip(this.id).subscribe((clip) => {
        this.clip = clip.data() ?? null;
        //@ts-ignore
        this.created_at = new Date(this.clip?.timestamp.seconds * 1000);
      });
    });
  }
}
