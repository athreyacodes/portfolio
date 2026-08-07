import { OnInit, Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from './common/services/common.service';
import { LANGUAGE_LIST } from './common/objects/constants';
import { Theme } from './common/objects/enums';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBR5iRrmWuaPenY2mo0iO80llbqC7pfARA",
  authDomain: "portfolio-230b7.firebaseapp.com",
  projectId: "portfolio-230b7",
  storageBucket: "portfolio-230b7.appspot.com",
  messagingSenderId: "232620578629",
  appId: "1:232620578629:web:1557bef9d9ec4e4192902c",
  measurementId: "G-7YQTYR5N07"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'portfolio';
  constructor(
    private translate: TranslateService,
    private CommonSrv: CommonService
  ) {
    translate.setDefaultLang('en-gb');
    translate.use('en-gb');
  }

  ngOnInit() {    
    this.CommonSrv.SelectedLanguage = LANGUAGE_LIST.find(l => l.code === this.translate.currentLang);
    this.CommonSrv.UpdateTheme(Theme.Light, true)
  }
  
  // @HostListener('window:resize', ['$event'])
  // UpdateSmallScreen() {
  //   this.CommonSrv.OnScreenResize();
  // }
}
