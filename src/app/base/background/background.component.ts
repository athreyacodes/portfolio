import { Component } from '@angular/core';
import { BACKFROUND_IMAGE } from '../../constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-background',
  imports: [CommonModule],
  templateUrl: './background.component.html',
  styleUrl: './background.component.scss'
})
export class BackgroundComponent {
  bgStyle = {'background': 'url(' + BACKFROUND_IMAGE + ') 100px 250px'};
  bgStyle2 = 'url(' + BACKFROUND_IMAGE + ') 100px 250px';
}
