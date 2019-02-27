import { Component, OnInit, Input } from "@angular/core";
import { DataService } from "../data.service";
import * as SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import { Observable } from "rxjs";
import * as $ from "jquery";
import { Router } from "@angular/router";
import {
  trigger,
  style,
  transition,
  animate,
  keyframes,
  query,
  stagger
} from "@angular/animations";
import { error } from "util";
import "rxjs/operators/map";
import * as alertify from "alertifyjs";
import { ConnectionService } from "ng-connection-service";

@Component({
  selector: "app-momo",
  templateUrl: "./momo.component.html",
  styleUrls: ["./momo.component.css"],
  animations: [
    trigger("listAnimation", [
      transition("* => *", [
        query(".in", style({ opacity: 0 })),
        query(
          ".in",
          stagger("300ms", [
            animate(
              "1.2s ease-in",
              keyframes([
                style({
                  opacity: 0,
                  transform: "translateY(-75PX)",
                  offset: 0
                }),
                style({
                  opacity: 0.5,
                  transform: "translateY(35PX)",
                  offset: 0.3
                }),
                style({ opacity: 1, transform: "translateY(0PX)", offset: 1 })
              ])
            )
          ])
        ),
        query(
          ".out",
          stagger("300ms", [
            animate(
              "1.2s ease-in",
              keyframes([
                style({ opacity: 1, transform: "translateY(0PX)", offset: 0 }),
                style({
                  opacity: 0.5,
                  transform: "translateY(35PX)",
                  offset: 0.3
                }),
                style({ opacity: 0, transform: "translateY(-75PX)", offset: 1 })
              ])
            )
          ])
        )
      ])
    ])
  ]
})
export class MomoComponent implements OnInit {
  private stompClient;
  public credentials: any;
  public order_id: string;
  public orderOk: any;
  public objOrder: any;
  public status: string = "ONLINE";
  public isConnected: boolean = true;

  constructor(
    private param: DataService,
    private router: Router,
    private connectionService: ConnectionService
  ) {
    this.connectionService.monitor().subscribe(isConnected => {
      this.isConnected = isConnected;
      if (this.isConnected) {
        this.status = "ONLINE";
      } else {
        this.status = "OFFLINE";
        alertify.alert(
          "HeHe.PAY",
          "network error,check your connection and try again."
        );
      }
      console.log(this.status);
    });
  }

  ngOnInit() {
    this.param.currentMessage.subscribe(response => {
      this.order_id = response;
      this.getCredentials();
    });
  }

  sendOrderIdStatus(order) {
    $("#failed").css("display", "none");
    $("#success").css("display", "none");
    window.location.href = "/api/get_order_status" + order;
  }

  getCredentials() {
    this.param.getparamCredential().subscribe(
      data => {
        this.credentials = data;
        this.listenerSocket(this.credentials);
      },
      error => {
        this.router.navigate(["404"]);
      }
    );
  }

  listenerSocket(params) {
    let userName = params.data.mq_user;
    let pass = params.data.mq_password;
    let host = params.data.mq_vhost;
    let url = params.data.ws_url;
    let queue = params.data.mq_queue + params.data.mq_secure_channel;
    let amount = params.data.mq_secure_amount;
    let currency = params.data.mq_secure_currency;
    let queue_ttl = params.data.mq_queue_ttl;

    if (queue_ttl == null || queue_ttl == "undefined") {
      queue_ttl = 2700000;
    }

    let ws = new WebSocket(url);

    this.stompClient = Stomp.over(ws);
    this.stompClient.debug = () => {};
    let that = this;
    this.stompClient.connect(
      userName,
      pass,
      function(frame) {
        that.stompClient.subscribe(
          queue,
          message => {
            if (message.body) {
              let data = message.body;
              let parsedBody = JSON.parse(data);
              let Status = parsedBody.Status;
              let status_code = parsedBody.StatusCode;

              this.objOrder =
                "/" +
                parsedBody.Status +
                "/" +
                amount +
                "/" +
                currency +
                "?status_text=" +
                parsedBody.Status +
                "&status_code=" +
                status_code;

              let transactionID = parsedBody.ExternalTransactionID;

              if (this.order_id != transactionID) {
                if (Status == "Processed") {
                  $("#failed").css("display", "none");
                  $("#processing").css("display", "none");
                  $("#success").fadeIn("slow");

                  $("#processing")
                    .removeClass("out")
                    .addClass("in");
                  $("#failed")
                    .addClass("out")
                    .removeClass("in");
                  $("#success")
                    .addClass("out")
                    .removeClass("in");
                  setTimeout(() => {
                    that.sendOrderIdStatus(this.objOrder);
                  }, 2000);
                } else if (Status == "Pending") {
                  $("#failed").css("display", "none");
                  $("#success").css("display", "none");
                  $("#processing").fadeIn("slow");

                  $("#processing")
                    .removeClass("out")
                    .addClass("in");
                  $("#failed")
                    .addClass("out")
                    .removeClass("in");
                  $("#success")
                    .addClass("out")
                    .removeClass("in");

                  let interval = setInterval(() => {
                    alertify.defaults.glossary.title = "HeHe Pay";
                    alertify.confirm(
                      "Please make sure you respond the popup in your phone or Dial *182*7# if it doesn't come up. If you don't wish to see this message again click 'Cancel'",
                      function() {
                        alertify.success(
                          "In case you get tired of the alert...click cancel next time."
                        );
                      },
                      function() {
                        alertify.error("No further alerts from now on.");
                        for (let i = 0; i < 10000; i++) {
                          window.clearInterval(i);
                        }
                      }
                    );
                  }, 120000);
                } else {
                  $("#processing").css("display", "none");
                  $("#success").css("display", "none");
                  $("#failed").fadeIn("slow");

                  $("#failed")
                    .removeClass("out")
                    .addClass("in");
                  $("#processing")
                    .addClass("out")
                    .removeClass("in");
                  $("#success")
                    .addClass("out")
                    .removeClass("in");
                  setTimeout(() => {
                    that.sendOrderIdStatus(this.objOrder);
                  }, 2000);
                }
              } else {
                console.log("THIS IS MESSAGE IS NOT FOR YOU!");
                message.body.nack();
              }
            }
          },
          { "x-expires": queue_ttl }
        );
      },
      function(error) {
        console.warn(error);
        alertify.alert(
          "HeHe.PAY",
          "connection error,click to refresh.",
          function() {
            alertify.success("reloading...");
            setTimeout(() => {
              location.reload();
            }, 2000);
          }
        );
      }
    );
  }
}
