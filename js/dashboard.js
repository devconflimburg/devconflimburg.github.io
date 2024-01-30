google.charts.load('current', {packages: ['corechart', 'bar']});

const room_colors = {
     "Forum":"#a4cbf2",
     "No-code-zone":"#a4a4f2",
     "Scriptingroom":"#f2a4a4",
     "Hackingdorm":"#f2f2a4"
};

var registrationData = null;
var ticketStates = null;
var breakoutData = null;

function draw_dashboard(){
    prepare_registration();
    prepare_ticket_state();
    prepare_breakouts();
}

function prepare_breakouts(){
    let breakouts = Alpine.store("breakouts").get.programItem.filter(x => x.breakout);
    let data_set = {};
    let rooms = [];
    breakouts.forEach(talk => {
        if (rooms.indexOf(talk.room) === -1){
            rooms.push(talk.room);
        }
    });
    breakouts.forEach(talk =>{
        if (!(talk.session in data_set)){
            data_set[talk.session] = {}
        }
        data_set[talk.session][talk.room] = talk;
    });

    let tickets = Alpine.store("tickets").filter.resultset;
    let visitors = {};
    tickets.forEach(ticket => {
        ticket.breakouts.split(",").forEach(id => {
            if (id in visitors){
                visitors[id] += 1;
            } else {
                visitors[id] = 1;
            }
        });
    });
    let prepared_data = [["Talk","Visitors",{ role: 'style' }]];
    for (let i = 0; i < Object.keys(data_set).length; i++){
        rooms.forEach(room => {
            let talk = data_set[i+1][room];
            prepared_data.push([
                `${talk.title} - ${talk.speaker} - ${talk.room}`,
                visitors[talk.id] ? visitors[talk.id] : 0,
                room_colors[talk.room],
            ]);
        });
    }
    breakoutData = google.visualization.arrayToDataTable(prepared_data);
    google.charts.setOnLoadCallback(draw_breakouts);
}

function prepare_ticket_state(){
    let tickets = Alpine.store("tickets").filter.resultset;
    let manager = Alpine.store("manager").RegistrationManager.get;
    let data_set = {
        available: manager.maxVisitors,
        registered: 0,
        verified: 0,
        redeemed: 0
    };
    tickets.forEach(ticket => {
        if (ticket.redeemed){
            data_set.redeemed += 1;
        } else if (ticket.verified){
            data_set.verified += 1;
        } else {
            data_set.registered += 1;
        }
        data_set.available -= 1;
    });
    let prepared_data = [['State','Tickets']];
    Object.entries(data_set).forEach(item => {
        prepared_data.push([item[0],item[1]]);
    });
    ticketStates = google.visualization.arrayToDataTable(prepared_data);
    google.charts.setOnLoadCallback(draw_ticket_states);
}

function prepare_registration(){
    let tickets = Alpine.store("tickets").filter.resultset;
    let data_set = {};
    tickets.forEach(ticket => {
        let registration_date = moment(ticket.createdAt * 1000).format("YYYY-MM-DD");
        if (registration_date in data_set){
            data_set[registration_date] += 1;
        } else {
            data_set[registration_date] = 1;
        }
    });
    let manager = Alpine.store("manager").RegistrationManager.get;
    let date_object = moment(manager.openDate,'DD-MM-YYYY');
    let prepared_data = [['Date','Registrations']];
    while (true) {
        let date = date_object.format("YYYY-MM-DD");
        if (date in data_set){
            prepared_data.push([
                date,
                data_set[date]
            ])
        } else {
            prepared_data.push([
                date,
                0
            ]);
        }
        if (date_object.format("DD-MM-YYYY") == manager.closeDate){
            break;
        }
        date_object.add(1, 'days');
    }
    registrationData = google.visualization.arrayToDataTable(prepared_data);
    google.charts.setOnLoadCallback(draw_registrations);
}

function draw_breakouts(){
    var options = {
        title: 'Breakout Sessions',
        hAxis: {
          title: 'Talk',
          viewWindow: {
            min: [7, 30, 0],
            max: [17, 30, 0]
          }
        }
      };

      var chart = new google.visualization.ColumnChart(document.getElementById('breakout_diagram'));
      chart.draw(breakoutData, options);
}

function draw_ticket_states(){
    var options = {
      title: 'Tickets',
      pieHole: 0.4,
    };

    var chart = new google.visualization.PieChart(document.getElementById('tickets'));
    chart.draw(ticketStates, options);
}

function draw_registrations() {
  var options = {
    title: 'Registrations',
    hAxis: {
      title: 'Date',
      viewWindow: {
        min: [7, 30, 0],
        max: [17, 30, 0]
      }
    }
  };

  var chart = new google.visualization.ColumnChart(document.getElementById('registrations'));
  chart.draw(registrationData, options);
}
