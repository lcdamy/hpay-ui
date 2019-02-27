import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Params } from './params';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';

let headers = new HttpHeaders({

 });
let httpOptions = { headers: headers };

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private urlrabitcredentials = '/api/get_rabbit_credentials';
  private urlparms = '/api/get_url_params';
  // private urlorderstatus = '/api/get_order_status';

  private messageSource = new BehaviorSubject<string>("default message");

  currentMessage = this.messageSource.asObservable();
  
  constructor(private http:HttpClient){ }

  getparamCredential () {
    return this.http.get<Params[]>(this.urlrabitcredentials);
  }

  getUrlMethod () {
    return this.http.get<Params[]>(this.urlparms);
  }

  // postOrder (order) {
  //   return this.http.post<Params[]>(this.urlorderstatus,{data : order},httpOptions);
  // }

  changeMessage(message: string){
    this.messageSource.next(message)
   }

}
