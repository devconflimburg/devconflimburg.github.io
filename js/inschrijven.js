//closeDate "20-03-2024"
//openDate"31-01-2024"

function inschrijvingGeopend(registrationManager){
    try{
        var openDate = moment(registrationManager.openDate, 'DD-MM-YYYY');
        var closeDate = moment(registrationManager.closeDate, 'DD-MM-YYYY');
        var check = new Date();
        return check >= openDate && check <= closeDate && registrationManager.registeredVisitors < registrationManager.maxVisitors;
    } catch {
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