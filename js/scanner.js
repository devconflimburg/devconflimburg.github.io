
const qrScanner = new QrScanner(
    document.getElementById("scanner-preview"),
    result => console.log('decoded qr code:', result),
    { /* your options or returnDetailedScanResult: true if you're not specifying any other options */ },
);

//const qrScanner = new QrScanner(
//    document.getElementById("scanner-preview"),
//    result => {
//        var data = result.data;
//        if (data.startsWith("devconf_")){
//            on("Checking Ticket","#666666");
//            qrScanner.stop();
////            const token = data.replace("devconf_","");
////            Draftsman.mutation(mutation_query,(data,errors) => {
////                const cid = data.Ticket.scan.correlationId;
////                trace(token,cid);
////            },
////            variables={"input" : {
////                ticketId: token
////            }},
////            anonymous=false);
////            getUser(token);
//        }
//    },
//    {
//        highlightScanRegion:true,
//        highlightCodeOutline:true
//    }
//);

function on(message,color) {
  document.getElementById("overlay").style["background-color"] = color;
  document.getElementById("message").innerHTML = message;
  document.getElementById("overlay").style.display = "block";
}

function delayedOff(delay=3000) {
  setTimeout(function(){
    qrScanner.start();
    document.getElementById("overlay").style.display = "none";
    document.getElementById("message").innerHTML = "";
    document.getElementById("visitor").innerHTML = "";
  },delay);
}

on("Ticket Scanner","#666666");