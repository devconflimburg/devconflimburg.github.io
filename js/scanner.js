var ticketId = "";
var scanned = false;

const qrScanner = new QrScanner(
    document.getElementById("scanner-preview"),
    result => {
        console.log(result);
        ticketId = result.data;
        if (ticketId.startsWith("devconf-ticket:")){
            on("Checking Ticket","#666666");
            qrScanner.stop();
            send_mutation("redeem-ticket",{ticketId: ticketId});
            scanned = true;
        }
    },
    {
        highlightScanRegion:true,
        highlightCodeOutline:true
    }
);

function on(message,color) {
  document.getElementById("overlay").style["background-color"] = color;
  document.getElementById("message").innerHTML = message;
  document.getElementById("overlay").style.display = "block";
}

function delayedOff(delay=3000) {
  if (scanned){
    location.reload();
  }
  setTimeout(function(){
    qrScanner.start();
    document.getElementById("overlay").style.display = "none";
    document.getElementById("message").innerHTML = "";
    document.getElementById("visitor").innerHTML = "";
  },delay);
}

const custom_query = `query MyQuery($ticketId_equals: String = "") {
    Visitor {
      filter(ticketId_equals: $ticketId_equals) {
        resultset {
          firstName
          lastName
        }
      }
    }
  }`;

function getUser(ticketId){
 (async () => {
              const data = await Draftsman.query(custom_query,{
                  ticketId_equals : ticketId
            });
              console.log(data)
              let visitor = data.Visitor.filter.resultset[0];
              document.getElementById("visitor").innerHTML = `${visitor.firstName} ${visitor.lastName}`;
            })()
}

function on_trace(log_message){
    let message = log_message.detail;
    if (message.status == "error"){
        on(message.message,"#B85450");
        getUser(ticketId)
    }
    if (message.status == "success"){
        on("Valid Ticket!","#82B366");
        getUser(ticketId)
    }
}

if (!sessionStorage.getItem("scanner")){
    on("Ticket Scanner","#666666");
    sessionStorage["scanner"] = "true";
} else {
    delayedOff(0);
}
