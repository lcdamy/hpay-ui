import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { trigger,style,transition,animate,keyframes,query,stagger } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
          trigger('renderHome',[
            transition('* => *',[
              query('.custom', style({opacity:0,transform:'translateY(-40px)'})),
              query('.custom', stagger('500ms',[
                animate('800ms 1.2s ease-out',style({opacity:1,transform:'translateY(0)'}))
              ]))
            ])
          ])
          
        ]
})
export class HomeComponent implements OnInit {

  urlpramasresponse:any;
  order_id:string;

  constructor(private param:DataService,private router:Router) { 
    
  }

  ngOnInit() { 
    this.param.currentMessage.
    subscribe(response => 
      this.order_id = response   
    );
    this.getParams();
  }

  getParams(){
    this.param.getUrlMethod()
    .subscribe(response => {
      this.urlpramasresponse = response;
      if(this.urlpramasresponse.status === "success"){   
        this.param.changeMessage(this.urlpramasresponse.data.secure_channel);
        switch(this.urlpramasresponse.data.secure_payment){
          case 'momo-mtn':
          this.router.navigate(['momo-mtn']);
          break;
          default:
          this.router.navigate(['404']);
        }
      }else{
        this.router.navigate(['404']);
      }
    },error =>{
      this.router.navigate(['404']);
    }
    );    
  }


  

}
