import { Component, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { ABOUT_TEMPLATE_ID } from '../home/home.component';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AboutComponent {
}
