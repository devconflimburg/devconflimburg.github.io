const call_to_action_title = "Tot volgend jaar!";
const call_to_action_text = `
Bedankt dat je aanwezig was op deze mooie dag. Wil je nog even terugblikken? <a href="https://www.youtube.com/watch?v=Pxfx115PSFI" target="_blank">Bekijk dan de aftermovie van 2023.</a>

We hopen dat je geïnspireerd bent en volgend jaar weer aanwezig bent. Om het volgende evenement nog interessanter voor je te maken, vragen we jullie zoals ieder jaar <a href="mailto:devconf@apg.nl">feedback</a>.

Wil je er volgend jaar zeker bij zijn, reserveer dan alvast woensdag 27 maart in je agenda! Alvast hartelijk bedankt voor je tijd en tot ziens.`;

const placeholder_values = {
    // Home header
    "editie_datum" : "27 MAART 2024",
    "home_video" : "/assets/devConf_2023.mp4",
    "home_video_youtube_link" : "https://www.youtube.com/watch?v=Pxfx115PSFI",

    // Home call for action
    "home_call_for_action_title" : call_to_action_title,
    "home_call_for_action_paragraph" : call_to_action_text,

    // Home inschrijving
    "home_inschrijving_open" : false
}

function get_variable(key){
    return placeholder_values[key];
}

// User pool configuratie
localStorage["aws-congnito-user-pool-id"] = "eu-north-1_zMQxeO3MU";
localStorage["aws-congnito-app-id"] = "34fis017c4qn4isutgo05tdngr";

// GraphQL API configuratie
const api_url = "https://npfew72uirgrln2tmhe6uljfeq.appsync-api.eu-north-1.amazonaws.com/graphql";
const api_ws = "wss://npfew72uirgrln2tmhe6uljfeq.appsync-realtime-api.eu-north-1.amazonaws.com/graphql";
const api_key = "da2-6muoejg5efaxtdnwg5h5f3x4lu";

// vimesh-ui configuratie
$vui.config = {
    namespace: 'ui'
}
$vui.config.importMap = {
    "*": '/components/${path}${component}.html'
}