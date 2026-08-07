import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-header-menu-icon',
    templateUrl: './header-menu-icon.component.html',
    styleUrls: ['./header-menu-icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HeaderMenuIconComponent {

  @Input() IsMenuOpen: boolean = false;
  @Output() ToggleMenu = new EventEmitter<any>();

}
