import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

import { Observable, map, delay, pipe, filter, switchMap, of } from 'rxjs';
import { IUser } from '../models/user.model';
import { ActivatedRoute, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  private redirect = false;
  public isAuthenticated$: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usersCollection = this.db.collection('users');
    this.isAuthenticated$ = auth.user.pipe(map((user) => !!user));
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));
    this.router.events
      .pipe(
        filter((e) => {
          return e instanceof NavigationEnd;
        }),
        map((e) => this.route.firstChild),
        switchMap((route) => route?.data ?? of({}))
      )
      .subscribe((data) => {
        this.redirect = data['authOnly'] ?? false;
      });
  }

  public async creatUser(userRegistrationData: IUser) {
    const { name, password, email, phoneNumber, age } = userRegistrationData;
    if (!password) {
      throw new Error('Password not provided');
    }
    const userCred = await this.auth.createUserWithEmailAndPassword(
      email,
      password
    );
    if (!userCred.user) {
      throw new Error('User cannot be found');
    }
    await this.usersCollection.doc(userCred.user.uid).set({
      name,
      email,
      age,
      phoneNumber,
    });
    await userCred.user.updateProfile({ displayName: name });
  }
  public async logout($e?: Event) {
    if ($e) $e.preventDefault();
    try {
      await this.auth.signOut();
      if (this.redirect) await this.router.navigateByUrl('/', {});
    } catch (e) {
      console.log(e);
    }
  }
}
