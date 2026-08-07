import { Component, ElementRef, HostListener, OnInit, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { PageType } from '../../../common/objects/enums';

export const SKILLS_TEMPLATE_ID = 'SKILLS_TEMPLATE_ID';
export const EXPERIENCE_TEMPLATE_ID = 'EXPERIENCE_TEMPLATE_ID';
export const ABOUT_TEMPLATE_ID = 'ABOUT_TEMPLATE_ID';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {

  ScrollPosition: number = 0;
  Unsubscribe$ = new Subject<void>();

  SKILLS_TEMPLATE_ID = SKILLS_TEMPLATE_ID;
  EXPERIENCE_TEMPLATE_ID = EXPERIENCE_TEMPLATE_ID;
  ABOUT_TEMPLATE_ID = ABOUT_TEMPLATE_ID;

  SkillsData: any | undefined;
  ExpData: any | undefined;
  AboutData: any | undefined;

  @ViewChild(SKILLS_TEMPLATE_ID) SKILLS_TEMPLATE: ElementRef | undefined;
  @ViewChild(EXPERIENCE_TEMPLATE_ID) EXPERIENCE_TEMPLATE: ElementRef | undefined;
  @ViewChild(ABOUT_TEMPLATE_ID) ABOUT_TEMPLATE: ElementRef | undefined;

  constructor(private CommonSrv: CommonService) { }

  ngOnInit() {
    this.ScrollToTop();
    this.enableClickToScroll();
    // this.listenToScroll();
  }

  ngOnDestroy() {
    this.Unsubscribe$.next();
    this.Unsubscribe$.complete();
  }

  private ScrollTo(template: ElementRef | undefined) {
    if (template?.nativeElement) {
      template.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  private ScrollToTop() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  private IsVisible(elPos: any, maxHeight: any) {
    return ((elPos-10) >= 0) && (elPos <= maxHeight);
  }

  private listenToScroll() {
    this.CommonSrv.ScrollTracker$
      .pipe(takeUntil(this.Unsubscribe$))
      .subscribe(() => {
        this.SkillsData = this.SKILLS_TEMPLATE?.nativeElement.getBoundingClientRect();
        this.ExpData = this.EXPERIENCE_TEMPLATE?.nativeElement.getBoundingClientRect();
        // this.AboutData = this.ABOUT_TEMPLATE?.nativeElement.getBoundingClientRect();

        // Set ActivePage for nav crumbs active icon
        const PageVisibleHeight = 0 + (window.innerHeight / 3);
        if (this.IsVisible(window.scrollY || 0, PageVisibleHeight)) {
          this.CommonSrv.ActivePage = PageType.Banner;
        } else if (this.IsVisible(Math.abs(this.SkillsData?.y), PageVisibleHeight)) {
          this.CommonSrv.ActivePage = PageType.Skills;
        } else if (this.IsVisible(Math.abs(this.ExpData?.y), PageVisibleHeight)) {
          this.CommonSrv.ActivePage = PageType.Experience;
        } 
        // else if (this.IsVisible(this.AboutData?.y, PageVisibleHeight)) {
        //   this.CommonSrv.ActivePage = PageType.About;
        // }
      });

    this.CommonSrv.ScrollTracker$
      .pipe(debounceTime(100))
      .pipe(takeUntil(this.Unsubscribe$))
      .subscribe(() => {
        // Evaluate and scroll to the nearby page
        const CanScrollHeight = 0 + (window.innerHeight / 3);

        if (window.innerWidth < 551) {
          return;
        }

        if (this.IsVisible(Math.abs(this.SkillsData?.y), CanScrollHeight)) {
          this.ScrollTo(this.SKILLS_TEMPLATE);
        } else if (this.IsVisible(Math.abs(this.ExpData?.y), CanScrollHeight)) {
          this.ScrollTo(this.EXPERIENCE_TEMPLATE);
        } 
        // else if (this.IsVisible(this.AboutData?.y, CanScrollHeight)) {
        //   this.ScrollTo(this.ABOUT_TEMPLATE);
        // }
      });
  }

  private enableClickToScroll() {
    this.CommonSrv.ScrollTo$.pipe(takeUntil(this.Unsubscribe$)).subscribe(v => {
      switch (v) {
        case PageType.Banner: this.ScrollToTop(); break;
        case PageType.Skills: this.ScrollTo(this.SKILLS_TEMPLATE); break;
        case PageType.Experience: this.ScrollTo(this.EXPERIENCE_TEMPLATE); break;
        case PageType.About: this.ScrollTo(this.ABOUT_TEMPLATE); break;
        default: break;
      }
    });
  }
}
