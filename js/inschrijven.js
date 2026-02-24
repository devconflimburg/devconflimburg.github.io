
function inschrijvingGeopend(registrationManager){
    try{
        var openDate = moment(registrationManager.openDate, 'DD-MM-YYYY');
        var closeDate = moment(registrationManager.closeDate, 'DD-MM-YYYY');
        var check = new Date();
        return check >= openDate && check <= closeDate && registrationManager.registeredVisitors < registrationManager.maxVisitors;
    } catch(err) {
        return false;
    }
}

function closedReason(registrationManager){
    try{
        var openDate = moment(registrationManager.openDate, 'DD-MM-YYYY');
        var closeDate = moment(registrationManager.closeDate, 'DD-MM-YYYY');
        var check = new Date();
        if (check < openDate){
            return "Inschrijving opent " + openDate.from(check);
        } else if (check > closeDate){
            return "Inschrijving gesloten"
        } else if (registrationManager.registeredVisitors >= registrationManager.maxVisitors){
            return "Geen seats beschikbaar, indien er annuleringen zijn worden deze opnieuw beschikbaar gesteld. Houd de website in de gaten.";
        }
    } catch {
        return "";
    }
}
function getCloseText(registrationManager){
    return moment(registrationManager.closeDate, 'DD-MM-YYYY').add(1,'days').fromNow()
}

function get_breakouts(program){
    let breakouts = {};
    program.forEach(item =>{
        if (item.session == 0)
            return;
        if (!(item.session in breakouts))
            breakouts[item.session] = [];
        breakouts[item.session].push(item);
    });
    return breakouts;
}

function open_registration_window(){
    let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${screen.width * 0.5},height=${screen.height * 0.5},left=10,top=10`;
    open('/inschrijf-terminal', 'inschrijf-terminal', params);
}

/// Terminal flow
var flow = ["firstName","lastName","email","attendingLunch","dietaryNotes","attendingAfterEventDrinks","subscribeToNewsletter","allowSharingWithRecruiters"]
var breakouts = {};
var current_state = "";
var form = {};
var submitted = false;

function start_registration(edition){
    write_log("Welkom bij de aanmelding voor devConf " + edition.year);
    write_log("Het event vindt plaats op woensdag " + moment(edition.date,'DD-MM-YYYY').format("YYYY-MM-DD"));
    write_log("&nbsp;");
    write_log("Gedurende deze registratie vragen we ook om een voorkeur op te geven voor de breakoutsessies, dit is niet bindend. We gebruiken deze data enkel als input voor de zaalindeling.")
    write_log("&nbsp;");
    write_log("Door het commando ‘reset’ uit te voeren kun je alle ingevoerde data verwijderen zonder te registreren.")
    write_log("Ben je al aangemeld, maar ben je de email kwijt? Voer dan het commando ‘resend email’ uit.");
    write_log("&nbsp;");
    breakouts = get_breakouts(edition.program.programItem);
    form.year = edition.year;
    form.breakouts = [];
    for (let i = 0; i < Object.keys(breakouts).length; i++){
        flow.push("breakout-" + (i+1))
    }
    flow.push("submit");
    next_command();
    setInterval(function(){
        if (document.hasFocus()) {
          document.getElementById("input-element").focus();
        }
    },1000);
    document.getElementById("console").addEventListener("click", function(){
        document.getElementById("input-element").focus();
    });

    // Onderstaande functie is uit het GUI assist framework, deze wordt automatisch uitgevoerd.
    // 31-01-2024 hadden we wat instabiliteit bij het laden van de mutaties, dit hebben we gemitigeerd
    // door de mutaties op een vergelijkbare manier op de pagina te laden als de queries.
    //
    // De fout is echter niet reproduceerbaar omdat het een timings-issue is tussen het laden van scripts/resources
    // en de uitvoer van scripts.
    //
    // We roepen hieronder de register_mutations functie opnieuw aan als additionele mitigerende maatregel.
    setTimeout(register_mutations,1000);
}

function next_command(){
    if (flow.length == 0){
        return;
    }
    current_state = flow.shift();
    if (current_state == "firstName"){
        command.instruction = "Voer je voornaam in";
    } else if (current_state == "lastName"){
       command.instruction = "Voer je achternaam in";
    } else if (current_state == "email"){
       command.instruction = "Voer je e-mailadres in";
    } else if (current_state == "attendingLunch"){
        command.instruction = "Ben je aanwezig tijdens de lunch? [Y/n]";
    } else if (current_state == "dietaryNotes"){
        if (!form["attendingLunch"]){
            form["dietaryNotes"] = "";
            next_command();
        } else {
            command.instruction = "Kunt u aangeven of er dieetbeperkingen zijn waarmee we rekening kunnen houden?";
        }
    } else if (current_state == "attendingAfterEventDrinks") {
        command.instruction = "Ben je aanwezig tijdens de netwerk borrel? [y/N]";
    } else if (current_state == "subscribeToNewsletter") {
        command.instruction = "<br>Wil je toegevoegd worden aan onze distributielijst?";
        command.instruction += "<br>We gebruiken deze lijst voor het uitzenden van de <i>Call for Speakers</i> en de aankondiging van een nieuwe editie.";
        command.instruction += "<br>We bewaren je gegevens 2,5 jaar, daarna worden ze automatisch verwijderd, tenzij je je opnieuw aanmeldt.";
        command.instruction += "<br>Aanmelden voor de distributielijst? [y/N]";
    } else if (current_state == "allowSharingWithRecruiters"){
        command.instruction = "<br>devConf is gesponsord door APG, maar een initiatief van APG IT-medewerkers. Work@APG houdt je op de hoogte van carrièremogelijkheden bij APG.";
        command.instruction += "<br>Geef je toestemming om je e-mailadres te delen met Work@APG? [y/N]";
    } else if (current_state.startsWith("breakout")){
       let session = parseInt(current_state.replace("breakout-",""));
       write_log("<br>Breakout sessie " + session);
       breakouts[session].forEach((breakout,index) => {
        if (breakout.id == "2026-13"){
            //TODO:HACK mini sessies hardcoded
            write_log(index + ") Kennis; macht, risico of cultuur / Developer productivity / Database backups zijn geen archivering");
        } else {
            write_log(index + ") " + breakout.title);
        }
       });
       command.instruction = "Selecteer een van de breakout sessies [0-" + (breakouts[session].length-1) + "]";
    } else if (current_state == "submit"){
        command.instruction = "<br>Door je in te schrijven ga je akkoord met onze <a href='/algemene-voorwaarden' target='_blank'>algemene voorwaarden</a>."
        command.instruction += "<br>⚠️ Op DevConf delen we goodies uit, maar let op: <strong>op = op!</strong> We hebben een beperkte voorraad om verspilling te voorkomen en onze milieu-impact zo laag mogelijk te houden."
        command.instruction += "<br>Is bovenstaande informatie correct? [ja/reset]"
    } else if (current_state == "resend"){
        send_mutation("lost-email-command",form);
    }
}

function enter_command(element){
    console.log(current_state);
    if (element.innerText.trim().toLowerCase() == "reset"){
        location.reload();
    }
    if (element.innerText.trim().toLowerCase() == "resend email"){
       flow = ["email","resend"];
       current_state = "";
    }
    if (current_state == "email"){
        element.innerText = element.innerText.trim().toLowerCase();
        if (!/^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$/.test(element.innerText)){
            element.innerText = "";
            write_log("<i style='color:red;'>The provided email address does not match the required pattern: <a style='color:#00d2ff;' href='https://regexr.com/3e48o' target='_blank'>^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$</a></i>")
            throw "invalid input";
        }
    }
    if (current_state == "submit"){
        console.log(element.innerText.trim().toLowerCase(),submitted);
        if (element.innerText.trim().toLowerCase() != "ja"){
            write_log(command.instruction + "> <span style='color: white;'>" + element.innerText + "</span>");
            write_log("<i style='color:red;'>Kies ja of reset!</i>")
            element.innerText = "";
            element.focus();
            return;
        }
        if (!submitted){
            setTimeout(function(){
                write_log("<br>We gaan je ticket aanmaken, een moment...");
            },1);
            send_mutation("register",form);
            submitted = true;
        }
    }
    else if (!current_state.startsWith("breakout")){
        form[current_state] = element.innerText.trim();
    } else {
        let session = parseInt(current_state.replace("breakout-",""));
        let index = parseInt(element.innerText);
        if (!breakouts[session][index]){
            let options = breakouts[session].length - 1;
            write_log(command.instruction + "> <span style='color: white;'>" + element.innerText + "</span>");
            write_log("<i style='color:red;'>Please select a value between 0-" + options +"</i>")
            element.innerText = "";
        }
        form.breakouts.push({
            id: breakouts[session][index].id
        });

        if (["2026-7","2026-14"].includes(breakouts[session][index].id)){
            //TODO:HACK dubbel slot, skip next
            flow.shift();
        } else if (breakouts[session][index].id == "2026-13"){
            //TODO:HACK mini sessies hardcoded
            form.breakouts.push({
                id: "2026-15"
            });
            form.breakouts.push({
                id: "2026-16"
            });
        }
    }

    if (current_state == "attendingLunch"){
        form[current_state] = element.innerText.trim().toLowerCase() != "n";
        element.innerText = form[current_state] ? "y" : "n";
    }
    if (["attendingAfterEventDrinks","subscribeToNewsletter","allowSharingWithRecruiters"].includes(current_state)){
        form[current_state] = element.innerText.trim().toLowerCase() == "y";
        element.innerText = form[current_state] ? "y" : "n";
    }
    write_log(command.instruction + "> <span style='color: white;'>" + element.innerText + "</span>");
    element.innerText = "";
    command.instruction = "";
    console.log(form);
    next_command();
    element.focus();
}

function append_tracelog(log_message){
    console.log(log_message);
    let message = log_message.detail;
    let line = `${message.command ? message.command : message.event} ${message.status} ${message.message}`;
    if (message.status == "error"){
        line = `<i style="color:red">${line}</i>`
    }
    write_log(line);
    if(message.command == "SendTicketVerification-Notifier" && message.status == "success"){
        setTimeout(function(){
            write_log(`Er is een verificatie-e-mail gestuurd naar <i>${form.email}</i>. Klik op de link in de e-mail om je inschrijving te voltooien.`);
            write_log(`Geen e-mail ontvangen? Controleer je spamfolder. Nog steeds niets? <a href="mailto:info@devconf.nl">Neem contact op</a>.`);
            write_log(`<h2 style="color: red;">Let op: je inschrijving is pas voltooid na e-mailverificatie. Zonder bevestiging wordt je registratie over 2 weken automatisch geannuleerd.</h2>`);
        }, 1000);
    }
}

function write_log(message){
    logs.push(message);
    let element = document.getElementById("console");
    element.scrollTo(0, element.scrollHeight);
    element.scrollTop = element.scrollHeight;
    setTimeout(function(){
    element.scrollTop = element.scrollHeight;
    },100);
}

var logs = [];
var command = {instruction: ""};
document.addEventListener('alpine:init', async () => {
    logs = Alpine.reactive(logs);
    command = Alpine.reactive(command);
    Alpine.data('session', () => ({
        logs: logs,
        command: command
    }));
    setTimeout(function(){
        Draftsman.contains_teleports = false;
        Draftsman.disable_cache_for_page();
    },1);
});
