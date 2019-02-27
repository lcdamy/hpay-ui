// Use SockJS
Stomp.WebSocketClass = SockJS;
var ws = new WebSocket('wss://amqp.hehe.rw:15671/ws');

var decTest = Aejis ;

// Connection parameters
var mq_username = "hilaire",
  mq_password = "SnickHil@23",
  mq_vhost = "/",
  mq_url = 'http://xmpp.hehe.rw:15674/stomp',

  // The queue we will read. The /topic/ queues are temporary
  // queues that will be created when the client connects, and
  // removed when the client disconnects. They will receive
  // all messages published in the "amq.topic" exchange, with the
  // given routing key, in this case "mymessages"
  mq_queue = "/queue/whs_";
  mq_exchange = "/exchange/hehe-exchange/hehe-queue"; //check if the queue isnt necessary

// This is where we print incoming messages
var daID;

//common
var my_link_failure,my_link_success,my_status,my_error;
var processing,failed, success;

// This will be called upon successful connection
                                                                                                                  

function on_connect() {
    //output.innerHTML += 'Please wait while we process your payment<br />';
    console.log(client);
    //var headers = {ack:'client'};
    var subscription = client.subscribe(mq_queue, on_message);//,headers);
   // console.log(subscription); console.log('DAT WAS THE SUBS');
}
  
  // This will be called upon a connection error
function on_connect_error(error) {
  processing.innerHTML += 'Connection failed! Please refresh this page.<br />';
  console.log(error.headers);
}

function leave(urL) {
  window.location = urL;
}
  
  
  // This will be called upon arrival of a message
function on_message(m) {
  console.log('message received');
  console.log(m);

  decTest.descrypt("@DMM_HEHE_ENCRYP_KEY$!",m.body) //returns a promise
  .then(function(decrypted) {
      console.log("DECRYPTED ", decrypted);

      var parsedBody = JSON.parse(decrypted);

      console.log(parsedBody); console.log("that was the parsed body");

      var statusCode = parsedBody.StatusCode;
      var daStatus = parsedBody.Status;
      var reqAdd = '&order_status='+daStatus;
      var daLink = parsedBody.CallBackURL + reqAdd ;
      var transactionID = parsedBody.ExternalTransactionID ;
      //console.log(daLink);
      
      var urrl ='<a href='+daLink+'>Click here</a>';

      //output.innerHTML+='Your payment status is '+daStatus + '<br/>';
      //output.innerHTML +='Please follow this '+urrl+ ' to complete your order';

      //should check that the message is intended to this client at this point.
      // transactionID is the same as daID 
      //if it is the case then show the proper response
      //else just nack() the message again
      console.log("just to confirm the values....");
      console.log("daId is "+ daID + " while the transactionID is "+ transactionID+ " with the link being "+ daLink);
      if(daID == transactionID){
        if(daStatus =='Processed'){
          processing.className += ' hidden';
          success.classList.remove('hidden');
          
          my_link_success.innerHTML = '';//urrsl;

           //m.ack();

          //unsubscribe to delete the queue--most likely?
          //subscription.unsubscribe(); 

          setTimeout(() => {
            console.log("about to redirect");
            location.href = daLink;
          }, 1000);

        }
        else if(daStatus=='Failed'||statusCode==1||statusCode==2||statusCode==3||statusCode==4||statusCode==5||statusCode==6||statusCode==7){
          processing.className+=' hidden';
          failed.classList.remove('hidden');
          my_link_failure.innerHTML = '';//urrl;

           //m.ack();

          //unsubscribe to delete the queue--most like
          //subscription.unsubscribe(); 

          setTimeout(() => {
            console.log("about to redirect");
            location.href = daLink;
          }, 1000);
    
        }
        else{
          console.log('got an unkown status--pending most like--check!');
          success.className+=' hidden';
          failed.className+=' hidden';
          processing.classList.remove('hidden');
        
        }

      }else{

          console.log('THIS IS MESSAGE IS NOT FOR THIS CLIENT!');
        // success.className+=' hidden';
          //failed.className+=' hidden';
          //processing.classList.remove('hidden');
    
          m.nack(); //reput in the queue as this is not is not for this client    
        
      }

    },function(error) {
      console.error("Failed to decrypt!", error);
      m.nack(); //reput it the the queue
    });

}


// Create a client
var client = Stomp.over(ws);
//var client = Stomp.client(ws);

window.onload = function () {
  // Fetch output panel
  //output = document.getElementById("output");
  success = document.getElementById("success");
  failed = document.getElementById("failed");
  processing = document.getElementById("processing");
  my_link_failure = document.getElementById("my_url_failure");
  my_link_success = document.getElementById("my_url_success");


  queryParams = new URLSearchParams( location.search);
  if(queryParams.has('id')){
     console.log('it has it '+queryParams.get('id'));
     daID =queryParams.get('id');
  }else{
    console.log('no Id was passed in.'); //here should show the user that there is nothing to see..
    
    setTimeout(() => {
      alert("Nothing to see here..redirecting");
      location.href = "https://www.wherehouseshipping.com/";
    }, 1000);
    daID = '';
  }

  //set the actual queue to listen to
  mq_queue +=daID ; 

  //output.className+= 'bringDown';

  //hide the others
  success.className+=' hidden';
  failed.className +=' hidden';

  // Connect
  client.connect(
    mq_username,
    mq_password,
    on_connect,
    on_connect_error
  );
 }
 //disable to go back while being on waiting page
 history.pushState(null, null, location.href);
    window.onpopstate = function () {
        history.go(1);
    };