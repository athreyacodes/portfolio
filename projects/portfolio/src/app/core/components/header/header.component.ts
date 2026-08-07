import { Component, HostListener, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subject, debounceTime, delay, takeUntil } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { NavItem } from '../../../common/objects/classes';
import * as Constants from '../../../common/objects/constants';
import { TranslateService } from '@ngx-translate/core';
import { PageType } from '../../../common/objects/enums';

import { MenuOptionsComponent } from '../../../common/components/menu-options/menu-options.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {

  IsMenuOpen: boolean = false;
  ScrollPosition: number = 0;
  NavItems: NavItem[];
  Unsubscribe$ = new Subject<void>();
  Constants = Constants;
  ShowOptions: boolean = false;
  LoadOptions: boolean = false;

  get ActivePage() {
    return this.CommonSrv.ActivePage;
  }

  constructor(
    private CommonSrv: CommonService,
    private translate: TranslateService
  ) {
    Constants.NAV_ITEMS.forEach(item => {
      item.Description = this.translate.instant(item.localePath);
    });
    this.NavItems = Constants.NAV_ITEMS;
  }

  @HostListener('window:scroll', ['$event']) onScrollEvent(event: any) {
    this.ScrollPosition = window.scrollY;
    this.CommonSrv.ScrollTracker$.next(this.ScrollPosition);
  }

  ngOnInit() {
    this.CommonSrv.ScrollTracker$
      .pipe(takeUntil(this.Unsubscribe$))
      .subscribe(() => {
        this.NavItems.forEach(item => {
          item.Active = item.PageType === this.CommonSrv.ActivePage;
        });
      });


  }

  ngOnDestroy() {
    this.Unsubscribe$.next();
    this.Unsubscribe$.complete();
  }

  ToggleMenu() {
    this.IsMenuOpen = !this.IsMenuOpen;
  }

  GoTo(pageType: PageType) {
    this.CommonSrv.ScrollTo$.emit(pageType);
  }

  ToggleOptions() {
    this.LoadOptions = true;
    setTimeout(() => {
      this.ShowOptions = true;
    }, 10); 
  }

  OptionSelected(result: any) {
    console.log(result);
    switch (result.choice) {
      case 1: this.CommonSrv.DownloadCV(); break;
      case 2: this.GoTo(PageType.Skills); break;
      case 3: this.GoTo(PageType.Experience); break;
      case 4: this.CommonSrv.UpdateLanguage(result.params); break;
      case 5: this.CommonSrv.UpdateTheme(result.params); break;
      case 6: this.GoTo(PageType.Banner); break;
      default: break;
    }
    this.ShowOptions = false;
    setTimeout(() => {
      this.LoadOptions = false;
    }, 400);    
  }
}
