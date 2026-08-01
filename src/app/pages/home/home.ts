import { Component } from '@angular/core';
import { IntroBanner } from '../../components/intro-banner/intro-banner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IntroBanner],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {}
