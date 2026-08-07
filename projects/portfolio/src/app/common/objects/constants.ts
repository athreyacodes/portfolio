import { LanguageCode, PageType, Theme } from "./enums";

export const BANNER_ICON = 'home';
export const DOWNLOAD_CV_ICON = 'download';
export const SKILLS_ICON = 'verified';
export const EXP_ICON = 'work';
export const ABOUT_ICON = 'face_retouching_natural';
export const SMS_ICON = 'sms';
export const MAIL_ICON = 'mail';
export const THEME_ICON = 'dark_mode';
export const LANG_ICON = 'translate';

export const NAV_ITEMS = [
  { PageType: PageType.Banner, Icon: BANNER_ICON, Name: 'banner', Active: true, localePath: 'header.nav_items.banner', Description: '' },
  { PageType: PageType.Skills, Icon: SKILLS_ICON, Name: 'skills', Active: false, localePath: 'header.nav_items.skills', Description: '' },
  { PageType: PageType.Experience, Icon: EXP_ICON, Name: 'experience', Active: false, localePath: 'header.nav_items.experience', Description: '' },
  // { PageType: PageType.About, Icon: ABOUT_ICON, Name: 'about', Active: false, localePath: 'header.nav_items.about', Description: '' }
];


export const LANGUAGE_LIST = [
  {
    code: LanguageCode.English,
    name: "EN"
  },
  {
    code: LanguageCode.Spanish,
    name: "ES"
  },
  {
    code: LanguageCode.French,
    name: "FR"
  }
];

export const ILLUSTRATIONS_BASE_PATH: string = window.location.pathname + "assets/images/illustrations/";
export const THEMES_LIST = [
  { id: Theme.Light, name: 'theme.light.label',longName: 'theme.light.long_label', folder: 'theme-light', className: 'theme-light'},
  { id: Theme.Dark, name: 'theme.dark.label' ,longName: 'theme.dark.long_label', folder: 'theme-dark', className: 'theme-dark'}
];