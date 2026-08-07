import { Injectable, EventEmitter, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject, throttle, throttleTime } from 'rxjs';
import { PageType, Theme } from '../objects/enums';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { LANGUAGE_LIST, THEMES_LIST } from '../objects/constants';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private renderer: Renderer2;
  ExperienceInYears: number | undefined;
  SelectedLanguage: any;
  SelectedTheme: Theme = Theme.Light;

  ScrollTracker$ = new Subject<number>();
  ScrollTo$ = new EventEmitter<PageType>();
  ActivePage: PageType = PageType.Banner;

  private ThemeUpdatedEvent$ = new Subject<Theme>();
  get ThemeUpdated$() {
    return this.ThemeUpdatedEvent$.asObservable();
  }

  constructor(
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private rendererFactory: RendererFactory2
  ) {
    this.ExperienceInYears = (new Date()).getFullYear() - 2015;
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  ShowSuccess(msg: string) {
    this.snackBar.open(msg, undefined, {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['accent-snack']
    });
  }

  UpdateLanguage(code: string) {
    this.SelectedLanguage = LANGUAGE_LIST.find(l => l.code === code) || LANGUAGE_LIST.find(l => l.code === 'en-gb');
    this.translate.use(code);
    this.ShowSuccess(this.translate.instant('global.language_updated', { l: this.SelectedLanguage.name }));
  }

  UpdateTheme(theme: Theme, HideMessage: boolean = false) {
    this.SelectedTheme = theme;
    THEMES_LIST.forEach(t => {
      if (this.SelectedTheme === t.id) {
        this.renderer.addClass(document.body, t.className);
      } else {
        this.renderer.removeClass(document.body, t.className);
      }
    });
    !HideMessage && this.ShowSuccess(this.translate.instant('global.theme_updated'));
    this.ThemeUpdatedEvent$.next(this.SelectedTheme);
  }

  DownloadCV() {
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', window.location.pathname + 'assets/files/CV.pdf');
    link.setAttribute('download', 'Athreya_CV.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
