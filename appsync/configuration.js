window.__env = {
    graphqlEndpoint: api_url
}

localStorage["ApiExplorer:HeadersSectionIsOpen"] = false;
localStorage["ApiExplorer:EndpointSectionIsOpen"] = false;

function refresh_headers(){
    var headers = [
                     {
                        "key":"content-type",
                        "value":"application/json",
                        "isActive":true,
                        "isNewHeader":false,
                        "isDisabled":true
                     }
                  ];
    if (localStorage.token){
        headers.push({
         "key":"Authorization",
         "value":localStorage.token,
         "isActive":true,
         "isNewHeader":false,
         "isDisabled":false
      });
    } else {
        headers.push({
         "key":"x-api-key",
         "value":api_key,
         "isActive":true,
         "isNewHeader":false,
         "isDisabled":false
        });
    }
    localStorage.HASURA_CONSOLE_GRAPHIQL_HEADERS = JSON.stringify(headers);
}

refresh_headers();