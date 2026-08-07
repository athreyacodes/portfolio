import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { SKILLS_TEMPLATE_ID } from '../home/home.component';
import { ILLUSTRATIONS_BASE_PATH, LANGUAGE_LIST, THEMES_LIST } from '../../../common/objects/constants';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../common/services/common.service';
import { OnSameUrlNavigation } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PageType, Theme } from '../../../common/objects/enums';
import { SkillCarouselComponent } from '../../../common/components/skill-carousel/skill-carousel.component';

@Component({
    selector: 'app-skills',
    templateUrl: './skills.component.html',
    styleUrls: ['./skills.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SkillsComponent implements OnInit, OnDestroy {
  languageList = LANGUAGE_LIST;
  imagePath: string;
  unsubscribe$ = new Subject<void>();
  themes = THEMES_LIST;

  MoreSkillsMode = false;

  @ViewChild(SkillCarouselComponent) carouselComponent : SkillCarouselComponent;
  
  get SelectedTheme() {
    return this.CommonSrv.SelectedTheme;
  }

  get ExperienceInYears() {
    return this.CommonSrv.ExperienceInYears;
  }

  get SelectedLanguage() {
    return this.CommonSrv.SelectedLanguage;
  }

  constructor(private translate: TranslateService, private CommonSrv: CommonService) {
    this.updateImagePath();
  }
  ngOnInit() {
    this.CommonSrv.ThemeUpdated$.pipe(takeUntil(this.unsubscribe$)).subscribe(v => {
      this.updateImagePath();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  changeLanguage(language: any) {
    if (language?.code !== this.SelectedLanguage?.code) {
      this.CommonSrv.UpdateLanguage(language?.code || 'en-gb');
    }
  }

  changeTheme(theme: Theme | undefined) {
    if (theme !== this.SelectedTheme) {
      this.CommonSrv.UpdateTheme(theme || Theme.Light);
    }
  }

  GoToExperience() {
    this.CommonSrv.ScrollTo$.emit(PageType.Experience);
  }

  MoreAboutSkills(v?: boolean | undefined) {
    this.MoreSkillsMode = v === undefined ? !this.MoreSkillsMode : v;
    if (this.carouselComponent) {
      if (this.MoreSkillsMode) {
        this.carouselComponent.Content = 1; 
        this.carouselComponent.Start();
      } else {
        this.carouselComponent.Stop();
      }
    }
  }

  private updateImagePath() {
    const folderName = this.themes.find(f => f.id === this.SelectedTheme)?.folder || "theme-light";
    this.imagePath = ILLUSTRATIONS_BASE_PATH + folderName + "/";
  }
}
