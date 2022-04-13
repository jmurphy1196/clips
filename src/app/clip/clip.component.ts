import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import IClip from '../models/clip.model';
import { ClipService } from '../services/clip.service';
import videojs from 'video.js';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ClipComponent implements OnInit, AfterViewInit {
  id = '';
  clip?: IClip;
  player?: videojs.Player;
  @ViewChild('videoPlayer', { static: true }) videoPlayer:
    | ElementRef<HTMLVideoElement>
    | undefined;
  constructor(public route: ActivatedRoute, public clipService: ClipService) {}

  ngOnInit(): void {
    if (this.videoPlayer) {
      this.player = videojs(this.videoPlayer.nativeElement);
    }
    this.route.data.subscribe((data) => {
      this.clip = data['clip'] as IClip;

      this.player?.src({
        src: this.clip.url,
        type: 'video/mp4',
      });
    });
  }
  ngAfterViewInit(): void {}
}
