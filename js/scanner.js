var ticketId = "";
var scanner_lock = false;
const redeem_ticket_command = `
mutation Redeem($ticketId: String = "") {
  Ticket{
    redeem(input: {ticketId: $ticketId}) {
       correlationId
    }
  }
}
`;

function redeem_ticket(ticketId){
    if (scanner_lock){return}
    scanner_lock = true;
    let cid = generateUUID();
    console.log(cid);
    let headers = {
        "Authorization": localStorage["token"],
        'correlation-id': cid,
    };

    var query_string = `subscription TrackAndTrace($correlationId: String = "") {
        onTrace(correlationId: $correlationId) {
          command
          event
          message
          status
          previous
          component
          timestamp
        }
      }`;
    trace_socket = Draftsman.subscribe(query_string,(data,errors) => {
        on_trace(data["onTrace"]);
    },variables={"correlationId":cid});

    executeGraphQLRequest(api_url, redeem_ticket_command, {ticketId:ticketId}, headers)
        .then((data) => {
            console.log('GraphQL response:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

const qrScanner = new QrScanner(
    document.getElementById("scanner-preview"),
    result => {
        ticketId = result.data;
        if (ticketId.startsWith("devconf-ticket:")){
            on("Checking Ticket","#666666");
            qrScanner.stop();
            PlayAlert("pop");
            redeem_ticket(ticketId);
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
  setTimeout(function(){
    scanner_lock = false;
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

function on_trace(message){
    if (message.status == "error"){
        on(message.message,"#B85450");
        PlayAlert("funk");
        getUser(ticketId);
    }
    if (message.status == "success"){
        on("Valid Ticket!","#82B366");
        PlayAlert("purr");
        getUser(ticketId);
    }
}

on("Ticket Scanner","#666666");


async function executeGraphQLRequest(url, query, variables, headers) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers, // Voeg custom headers toe
            },
            body: JSON.stringify({
                query: query,
                variables: variables,
            }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(`GraphQL error: ${JSON.stringify(responseData)}`);
        }

        return responseData.data; // Retourneer alleen de data-sectie van de respons
    } catch (error) {
        console.error('Error executing GraphQL request:', error);
        throw error;
    }
}
function generateUUID() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

const sounds = {
    bottle: ['http://i.cloudup.com/y29czRwU3R.m4a', 'http://i.cloudup.com/baNnhH1I7M.ogg'],
    funk: ['http://i.cloudup.com/KkfWRzYC77.m4a', 'http://i.cloudup.com/7SSbOm5XZS.ogg'],
    glass: ['http://i.cloudup.com/E021I9zUG3.m4a', 'http://i.cloudup.com/3gveeCqUD6.ogg'],
    morse: ['http://i.cloudup.com/h7r7MsF4q3.m4a', 'http://i.cloudup.com/b0EXCVaceT.ogg'],
    pop: ['http://i.cloudup.com/vTka9yOizT.m4a', 'http://i.cloudup.com/4TnDj0v9GE.ogg'],
    purr: ['http://i.cloudup.com/5HJSHCtOzZ.m4a', 'http://i.cloudup.com/YdDNGA0sj5.ogg'],
    submarine: ['http://i.cloudup.com/r4ZENSF0Hu.m4a', 'http://i.cloudup.com/2OPb5OYAI2.ogg'],
    tink: ['http://i.cloudup.com/nCtoNq3kJN.m4a', 'http://i.cloudup.com/SNi1RX8iwb.ogg'],
};

function PlayAlert(soundName = 'bottle') {
    // Gebruik "bottle" als het geluid niet bestaat
    const soundUrls = sounds[soundName] || sounds.bottle;

    // Selecteer het juiste bestandstype
    const playableFile = getPlayableFile(soundUrls);

    if (!playableFile) {
        console.error('Geen ondersteund audioformaat gevonden.');
        return;
    }

    // Speel het geselecteerde bestand af
    const audio = new Audio(playableFile);
    audio.play().catch((error) => {
        console.error(`Error playing sound "${soundName}":`, error);
    });
}

function getPlayableFile(urls) {
    const audio = document.createElement('audio');
    if (audio.canPlayType('audio/ogg').replace(/no/, '')) {
        return urls[1];
    }
    if (audio.canPlayType('audio/mp4').replace(/no/, '')) {
        return urls[0];
    }
    return null;
}
