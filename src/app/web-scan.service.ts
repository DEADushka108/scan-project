import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable, Observer, Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebScanService {
  ws: any;
  fileReader: FileReader = new FileReader();
  object: any;
  images: Subject<any>;
  wsUrl: string = 'ws://localhost:8181/';
  connectionSubject: Observable<MessageEvent>;

  constructor(private sanitizer: DomSanitizer) {

    this.initConnection();
  }

  public initConnection() {
    this.images = new Subject<any>();

    this.connectionSubject = this.wsCreate(this.wsUrl);

    if (typeof this.ws!== 'undefined' && this.ws.readyState !== 0 && this.ws.readyState !== 1) {
      this.connectionSubject = this.wsCreate(this.wsUrl);
    }

    this.ws.onmessage = (res: any) => {
      console.log('response data',res.data);
      const response = res.data;
      this.fileReader.onload = ((evt: any) => {
        const arr = evt.target.result;
        console.log('onmessage', arr);
        return this.images.next(arr);
      })
      this.fileReader.readAsArrayBuffer(response);
    };

    this.ws.onclose = e => console.log('client disconnected', e);
  }

  send(value: string) {
    this.ws.send(value);
  }

  closeConnection() {
    this.ws.close(1000, 'disconnect');
    this.ws = undefined;
  }

  private wsCreate(url) {
    this.ws = new WebSocket(url);
    const observable = new Observable((obs: Observer<any>) => {
      this.ws.onmessage = obs.next.bind(obs);
      this.ws.onerror = obs.error.bind(obs);
      this.ws.onclose = obs.complete.bind(obs);
      return this.ws.close.bind(this.ws);
    });

    const observer = new Subject();
    observer.subscribe({
      next: (data: object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        }
      }
    });
    observable.subscribe(observer);
    return observable;
  }
}
