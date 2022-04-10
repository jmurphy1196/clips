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
import { of, switchMap, map, BehaviorSubject, combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>;
  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) {
    this.clipsCollection = db.collection('clips');
  }

  createClip(clip: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(clip);
  }
  getClip(id: string) {
    return this.clipsCollection.doc(id).get();
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
    try {
      await this.clipsCollection.doc(clip.docId).delete();
      clipRef.delete();
    } catch (err) {
      console.log(err);
    }
  }
}
