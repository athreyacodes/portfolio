import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './core/components/header/header.component';
import { ProfilePictureComponent } from './common/components/profile-picture/profile-picture.component';
import { HomeComponent } from './core/components/home/home.component';
import { PageNotFoundComponent } from './common/components/page-not-found/page-not-found.component';
import { MaterialModule } from './common/modules/material/material.module';
import { HeaderMenuIconComponent } from './common/components/header-menu-icon/header-menu-icon.component';
import { IntroBannerComponent } from './core/components/intro-banner/intro-banner.component';
import { SkillsComponent } from './core/components/skills/skills.component';
import { ExperienceComponent } from './core/components/experience/experience.component';
import { AboutComponent } from './core/components/about/about.component';
import { BackgroundComponent } from './common/components/background/background.component';
import { DynamicImageHeightDirective } from './common/diretive/dynamic-image-height.directive';
import { SkillCarouselComponent } from './common/components/skill-carousel/skill-carousel.component';
import { LinkedinComponent } from './common/icons/linkedin/linkedin.component';
import { GithubIconComponent } from './common/icons/github-icon/github-icon.component';
import { MenuOptionsComponent } from './common/components/menu-options/menu-options.component';
import { environment } from '../environments/environment';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.i18nBaseUrl, '.json');
}

@NgModule({ declarations: [
        AppComponent,
        HeaderComponent,
        ProfilePictureComponent,
        HomeComponent,
        PageNotFoundComponent,
        HeaderMenuIconComponent,
        IntroBannerComponent,
        SkillsComponent,
        ExperienceComponent,
        AboutComponent,
        BackgroundComponent,
        DynamicImageHeightDirective,
        SkillCarouselComponent,
        LinkedinComponent,
        GithubIconComponent,
        MenuOptionsComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            },
            defaultLanguage: 'en-gb'
        })], providers: [provideHttpClient(withXhr(), withInterceptorsFromDi())] })
export class AppModule { }
