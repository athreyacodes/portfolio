import { AfterViewInit, Component, ElementRef, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from '../../../common/services/common.service';
import { Subject, takeUntil } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { PageType } from '../../../common/objects/enums';
import * as Constants from '../../../common/objects/constants';

@Component({
    selector: 'app-intro-banner',
    templateUrl: './intro-banner.component.html',
    styleUrls: ['./intro-banner.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class IntroBannerComponent implements OnInit, OnDestroy {

  Constants = Constants;

  LeftBlockActive: boolean = true;
  RightBlockActive: boolean = false;
  AnimationsDisabled: boolean = true;

  Unsubscribe$ = new Subject<void>();

  AboutMeMode: boolean = false;

  get ExperienceInYears() {
    return this.CommonSrv.ExperienceInYears;
  }

  constructor(
    private CommonSrv: CommonService,
    private translate: TranslateService,
    private clipboard: Clipboard
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.Unsubscribe$.next();
    this.Unsubscribe$.complete();
  }

  ShowLeftBlock() {
    // if (this.AnimationsDisabled) {
    //   this.LeftBlockActive = false;
    //   this.RightBlockActive = false;
    // } else {
    //   this.LeftBlockActive = true;
    //   this.RightBlockActive = false;
    // }
    this.LeftBlockActive = true;
    this.RightBlockActive = false;
  }

  ShowRightBlock() {
    // if (this.AnimationsDisabled) {
    //   this.LeftBlockActive = false;
    //   this.RightBlockActive = false;
    // } else {
    //   this.LeftBlockActive = false;
    //   this.RightBlockActive = true;
    // }
    this.LeftBlockActive = false;
    this.RightBlockActive = true;
  }

  CopyEmail() {
    const email = this.translate.instant('contact_info.email');
    if (email) {
      this.clipboard.copy(email);
      this.CommonSrv.ShowSuccess(this.translate.instant('global.copied', { e: email }));
    }
  }

  GoToSkills() {
    this.CommonSrv.ScrollTo$.emit(PageType.Skills);
  }

  GoToExperience() {
    this.CommonSrv.ScrollTo$.emit(PageType.Experience);
  }

  GoToAbout() {
    // this.CommonSrv.ScrollTo$.emit(PageType.About);
    this.ShowLeftBlock();
    this.AboutMeMode = !this.AboutMeMode;
  }

  GetInTouch() {
    this.AboutMeMode = !this.AboutMeMode;
  }

  DownloadCV() {
    this.CommonSrv.DownloadCV();
  }
}