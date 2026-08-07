import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import * as Constants from '../../../common/objects/constants';
import { CommonService } from '../../services/common.service';

@Component({
    selector: 'app-menu-options',
    templateUrl: './menu-options.component.html',
    styleUrls: ['./menu-options.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MenuOptionsComponent {
  Constants = Constants;
  @Output() selected = new EventEmitter<any>();

  get SelectedLanguage() {
    return this.CommonSrv.SelectedLanguage;
  }

  get SelectedTheme() {
    return this.CommonSrv.SelectedTheme;
  }

  get ShowGoToTop() {
    return window.scrollY > 10;
  }

  constructor(
    private CommonSrv: CommonService
    ) {}

  close(choice: any, params?: any): void {
    this.selected.emit({ choice, params });
  }
}
