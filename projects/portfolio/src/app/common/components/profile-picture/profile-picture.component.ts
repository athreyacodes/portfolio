import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-profile-picture',
    templateUrl: './profile-picture.component.html',
    styleUrls: ['./profile-picture.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ProfilePictureComponent {
  
  @Input() ImageSize: number = 50;
  @Input() DynamicHeight: boolean = false;
  ImageURL: string = window.location.pathname + 'assets/images/dp.jpg';


}
