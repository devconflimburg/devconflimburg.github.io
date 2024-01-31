
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
            return "Geen seats beschikbaar";
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
var flow = ["firstName","lastName","email"]
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
    } else if (current_state.startsWith("breakout")){
       let session = parseInt(current_state.replace("breakout-",""));
       write_log("Breakout sessie " + session);
       breakouts[session].forEach((breakout,index) => {
        write_log(index + ") " + breakout.title);
       });
       command.instruction = "Selecteer een van de breakout sessies [0-" + (breakouts[session].length-1) + "]";
    } else if (current_state == "submit"){
        command.instruction = "Is bovenstaande informatie correct? [ja/reset]"
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
    }
    if (current_state == "submit"){
        console.log(element.innerText.trim().toLowerCase(),submitted);
        if (element.innerText.trim().toLowerCase() != "ja"){
            throw "invalid input";
        }
        if (!submitted){
            setTimeout(function(){
                write_log("We gaan je ticket aanmaken, een moment...");
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
            write_log(command.instruction + "> " + element.innerText);
            write_log("<i style='color:red;'>Please select a value between 0-" + options +"</i>")
            element.innerText = "";
        }
        form.breakouts.push({
            id: breakouts[session][index].id
        });
    }
    write_log(command.instruction + "> " + element.innerText);
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
            write_log(`Er is een verificatie e-mail naar <i>${form.email}</i> gestuurd, gebruik de link om de inschrijving af te ronden.`);
        },1000);
    }
}

function write_log(message){
    logs.push(message);
    let element = document.getElementById("console");
    element.scrollTo(0, element.scrollHeight);
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