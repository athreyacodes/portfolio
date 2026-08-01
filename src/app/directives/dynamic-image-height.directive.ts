import { AfterViewInit, Directive, ElementRef, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: 'img[appDynamicImageHeight]',
  standalone: true
})
export class DynamicImageHeightDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLImageElement>);
  private readonly platformId = inject(PLATFORM_ID);

  @HostListener('window:resize')
  onResize(): void {
    this.updateImageHeight();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const image = this.el.nativeElement;
    if (image.complete) {
      this.updateImageHeight();
    } else {
      image.addEventListener('load', () => this.updateImageHeight(), { once: true });
    }
  }

  private updateImageHeight(): void {
    const image = this.el.nativeElement;
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const aspectRatio = image.naturalWidth / image.naturalHeight || 1;

    const newHeight1 = Math.round(screenHeight / 3);
    const newHeight2 = Math.round(screenWidth / 3);
    const newHeight = Math.max(180, Math.min(newHeight1, newHeight2));
    const newWidth = newHeight * aspectRatio;
    const marginRight = screenWidth > 1100 ? `-${Math.round(newHeight / 3)}px` : '0';

    image.style.height = `${newHeight}px`;
    image.style.width = `${newWidth}px`;
    image.style.marginRight = marginRight;
  }
}
