import { Component } from '@angular/core';
import { BackgroundComponent } from "./base/background/background.component";

@Component({
  selector: 'app-root',
  imports: [BackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'portfolio';
}
