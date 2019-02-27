import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
 })
export class LandingComponent implements OnInit {
 
 public route: string;

  constructor(public url: LocationStrategy,private router:Router) {

  }
  ngOnInit() {
   let parameter:string;
   parameter = this.url.path();
    if(this.router.url+this.url.path().split("/")[1]=="/home" || (parameter.includes('?') && parameter.split('/')[1].startsWith('?'))){
      this.router.navigate(['home']);
    } 
   }

}
