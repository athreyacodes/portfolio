import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
    selector: '[dynamicImageHeight]',
    standalone: false
})
export class DynamicImageHeightDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateImageHeight();
  }

  ngAfterViewInit() {
    this.updateImageHeight();
  }

  private updateImageHeight() {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const image = this.el.nativeElement as HTMLImageElement;
    const aspectRatio = image.naturalWidth / image.naturalHeight;

    const newHeight1 = Math.round((screenHeight / 3));
    const newHeight2 = Math.round((screenWidth / 3));
    const newHeight = Math.max(180, Math.min(newHeight1, newHeight2));
    const newWidth = newHeight * aspectRatio;
    const marginRight = screenWidth > 1100 ? ("-" + (newHeight/3)) : 0;

    this.renderer.setStyle(image, 'height', `${newHeight}px`);
    this.renderer.setStyle(image, 'width', `${newWidth}px`);
    this.renderer.setStyle(image, 'margin-right', `${marginRight}px`);
  }
}
