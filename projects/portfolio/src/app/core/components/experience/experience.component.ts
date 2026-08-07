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
    selector: 'app-experience',
    templateUrl: './experience.component.html',
    styleUrls: ['./experience.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ExperienceComponent {
  unsubscribe$ = new Subject<void>();

  DetailsMode: boolean = false;
  Details: any;

  get basePath() {
    return window.location.pathname;
  }

  get SelectedTheme() {
    return this.CommonSrv.SelectedTheme;
  }

  get isDarkTheme() {
    return this.CommonSrv.SelectedTheme === Theme.Dark;
  }
  constructor(private translate: TranslateService, private CommonSrv: CommonService) {

  }
  ngOnInit() {
  }

  GoToDetails(data: any) {
    this.Details = data;
    this.DetailsMode = true;
  }

  GoToList() {
    this.Details = null;
    this.DetailsMode = false;
  }


}
