import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { WebScanService } from './web-scan.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public images: Array<any> = new Array();

  constructor(
    public webScanService: WebScanService,
    private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.webScanService.images.subscribe(res => {
      // const imgUrl = this.getSanitizeUrl(URL.createObjectURL(res));
      this.images.push(res);
      console.log(this.images);
    })
  }

  getImgUrl(arrayBuffer: ArrayBuffer) {
    let typedArray = new Uint8Array(arrayBuffer);
    const stringChar = typedArray.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, '');
    let base64String = btoa(stringChar);
    return this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + base64String);
  }

  // ngOnDestroy() {
  //   this.webScanService.images.unsubscribe();
  // }

  scanImage() {
    this.webScanService.send('1100');
  }
}
