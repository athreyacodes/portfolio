import { Component } from '@angular/core';
import { IntroComponent } from './intro/intro';

@Component({
  selector: 'app-home',
  imports: [IntroComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {}
