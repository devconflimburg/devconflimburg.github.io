const verify_ticket_command = `
mutation Verify($ticketId: String = "", $control: String = "") {
  Ticket{
    verify(input: {ticketId: $ticketId,control: $control}) {
       correlationId
    }
  }
}
`;

function verify_ticket(){
    let cid = generateUUID();
    console.log(cid);
    let headers = {
        "x-api-key": api_key,
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

    executeGraphQLRequest(api_url, verify_ticket_command, {
            ticketId: Draftsman.fetch_query_parameter('id'),
            control: Draftsman.fetch_query_parameter('control')
        }, headers)
        .then((data) => {
            console.log('GraphQL response:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

document.addEventListener('alpine:init', () => {
    verify_ticket();
});

function on_trace(message){
    console.log(message)
    if (message.status == "error"){
        document.getElementById("message").innerHTML = `Something went wrong, please contact info@devconf.nl<hr>${message.message}`;
    }
    if (message.status == "success"){
        location.href = '/?geslaagd=true'
    }
}


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

