import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalIds, ModalService } from 'src/app/services/modal.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  videoOrder = '1';
  clips: IClip[] = [];
  activeClip: IClip | null = null;
  sort$: BehaviorSubject<string>;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    public modalService: ModalService
  ) {
    this.sort$ = new BehaviorSubject(this.videoOrder);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params['sort'] === '2' ? params['sort'] : '1';
      this.sort$.next(this.videoOrder);
    });

    this.clipService.getUserClips(this.sort$).subscribe((docs) => {
      this.clips = [];
      docs.forEach((doc) => {
        this.clips.push({
          docId: doc.id,
          ...doc.data(),
        });
      });
    });
  }
  sort(e: Event) {
    const { value } = e?.target as HTMLSelectElement;
    this.router.navigate([], {
      queryParams: {
        sort: value,
      },
      relativeTo: this.route,
    });
  }
  openModal($event: Event, clip: IClip) {
    $event.preventDefault();
    this.activeClip = clip;
    this.modalService.toggleModal(ModalIds.editClipModal);
  }
  update($event: IClip) {
    const clipInd = this.clips.findIndex((el) => el.uid === $event.uid);
    this.clips[clipInd] = $event;
  }
  async deleteClip($event: Event, clip: IClip) {
    $event.preventDefault();
    try {
      this.clipService.deleteClip(clip);
      const clipInd = this.clips.findIndex((c) => c.docId === clip.docId);
      this.clips.splice(clipInd, 1);
    } catch (err) {
      console.log(err);
    }
  }
  async copyToClipboard($event: MouseEvent, docId: string | undefined) {
    $event.preventDefault();
    if (!docId) return;

    const url = `${location.origin}/clip/${docId}`;

    await navigator.clipboard.writeText(url);
    alert('Link copied!');
  }
}
