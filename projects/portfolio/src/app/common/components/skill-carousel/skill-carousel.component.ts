import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { ILLUSTRATIONS_BASE_PATH, THEMES_LIST } from '../../objects/constants';
import { Subject, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-skill-carousel',
    templateUrl: './skill-carousel.component.html',
    styleUrls: ['./skill-carousel.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SkillCarouselComponent implements OnInit, OnDestroy {

  imagePath: string;
  themes = THEMES_LIST;
  Content: number = 1;
  EnableAutoPlay: boolean = true;
  TimerInProgress: boolean = false;
  Progress = 100;
  Timer$: any;
  StopTimer$ = new Subject<void>();

  get SelectedTheme() {
    return this.CommonSrv.SelectedTheme;
  }

  get ExperienceInYears() {
    return this.CommonSrv.ExperienceInYears;
  }

  constructor(private CommonSrv: CommonService) {
    this.updateImagePath();
  }

  ngOnInit() {
    this.CommonSrv.ThemeUpdated$.subscribe(v => {
      this.updateImagePath();
    });

    this.Timer$ = timer(0, 100);
  }

  ngOnDestroy() {
    this.Stop();
    this.StopTimer$.complete();
  }

  GoTo(n: number) {
    this.Content = n;
    this.Stop();
  }

  Start() {
    this.Progress = 0;
    this.TimerInProgress = true;
    this.StartTimer();
  }

  Stop() {
    this.TimerInProgress = false;
    this.StopTimer$.next();
    this.Progress = 100;
  }

  private StartTimer() {
    this.Timer$.pipe(takeUntil(this.StopTimer$)).subscribe((v: any) => {
        if (this.Progress >= 100) {
          this.MoveToNextSlide();
        } else {
          this.Progress = v || 0;
        }
    });
  }

  private MoveToNextSlide() {
    this.Stop();
    this.Progress = 0;
    this.Content = this.Content === 3 ? 1 : (this.Content + 1);
    this.Start();
  }

  private updateImagePath() {
    const folderName = this.themes.find(f => f.id === this.SelectedTheme)?.folder || "theme-light";
    this.imagePath = ILLUSTRATIONS_BASE_PATH + folderName + "/";
  }

  
}
