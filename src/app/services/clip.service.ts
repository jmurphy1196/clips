import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import IClip from '../models/clip.model';
import {
  of,
  switchMap,
  map,
  BehaviorSubject,
  combineLatest,
  Observable,
} from 'rxjs';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollection: AngularFirestoreCollection<IClip>;
  pageClips: IClip[] = [];
  pendingReq = false;
  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = db.collection('clips');
  }

  createClip(clip: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(clip);
  }
  getClip(id: string) {
    return this.clipsCollection.doc(id).get();
  }
  async getClips() {
    if (this.pendingReq) return;
    this.pendingReq = true;
    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);
    const { length } = this.pageClips;
    if (length) {
      const lastDocID = this.pageClips[length - 1].docId;
      const lastDoc = await this.clipsCollection
        .doc(lastDocID)
        .get()
        .toPromise();

      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    snapshot.forEach((doc) => {
      this.pageClips.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    this.pendingReq = false;
  }
  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap(([user, sort]) => {
        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc');
        return query.get();
      }),
      map((snapshot) => {
        return (snapshot as QuerySnapshot<IClip>).docs;
      })
    );
  }
  updateClip(clipDocId: string, title: string) {
    return this.clipsCollection.doc(clipDocId).update({ title });
  }
  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFilename}`
    );
    try {
      await this.clipsCollection.doc(clip.docId).delete();
      await clipRef.delete();
      await screenshotRef.delete();
    } catch (err) {
      console.log(err);
    }
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection
      .doc(route.params['id'])
      .get()
      .pipe(
        map((snapshot) => {
          const data = snapshot.data();
          if (!data) {
            this.router.navigate(['/']);
            return null;
          }
          return data;
        })
      );
  }
}
