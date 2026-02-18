
function toMinutes(time_str) {
    // Extract hours, minutes and seconds
    var parts = time_str.split(':');
    // compute  and return total seconds
    return parts[0] * 60 + parts[1]*1;
}

var lines = [];
function get_grid_lines(programma){
    try {
        var difference = Math.abs(toMinutes(programma["get"]["end"]) - toMinutes(programma["get"]["start"]));
        var target = new Date("1970-01-01T" + programma["get"]["start"]);
        console.log(target);
        lines = [];
        [...Array(Math.floor(difference/15)).keys()].forEach(x => {
            let time = target.toTimeString().split(":");
            lines.push(`${time[0]}:${time[1]}`);
            target = new Date(target.getTime() + 15*60000);
        });
    } catch {}
    return lines;
}

function  sort_program_items( a, b ) {
  if ( a.startTime < b.startTime ){
    return -1;
  }
  if ( a.startTime > b.startTime ){
    return 1;
  }
  return 0;
}

var rooms = ["Forum",
             "Social zone",
             "No-code-zone",
             "Scriptingroom",
             "Hackingdorm",
             "Theater",
             "Manege",
             "Graanschuur",
             "Kersentuin",
             "Dinger",
             "Heuvelland",
             "Mergelland",
             "Wormdal",
             "Maasdal"];
var talks = rooms.map(x => []);
var classes = ["one","two","three","four","five","one","two","three","four"]
function get_talks(programma){
    var prev = rooms.map(x => programma.get.start);
    console.log(programma.get.programItem);
    programma.get.programItem.sort( sort_program_items );
    programma.get.programItem.forEach(x => {
        try{
        let index = rooms.indexOf(x.room);
        let margin = Math.abs(toMinutes(x.startTime) - toMinutes(prev[index]));
        x.margin = Math.round(margin/15 * 100);
        x.class = classes[index];
        talks[index].push(x);
        prev[index] = x.endTime;
        } catch (error){
            console.error(error);
        }
    });
    talks = talks.filter(x => x.length != 0);
    return talks;
}

function get_rooms(programma){
    let used_rooms = [];
    programma.get.programItem.forEach(x => {
        used_rooms.push(x.room);
    });
    return rooms.filter(x => used_rooms.indexOf(x) != -1);
}
