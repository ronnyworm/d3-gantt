// different for each of your gantt charts

/* Example for a task when you chose "one day" for overallperiod (see below)
  {
    task: "Einstieg CSS",
    type: "Lernen und Anwenden",
    startTime: "2015-12-08 10:45",
    endTime: "2015-12-08 12:00",
    details: "Some more Text" + "<ul style='padding-left:1.5em'>"+
    "<li>Test (inline, style oben, extra Datei)</li>"+
    "<li>Attributes (color, background-color, font-size; font-style, ...)</li>"+
    "<li><a href='http://google.com'>Link1</a></li>"+
    "<li><a href='http://google.com'>Link2</a></li>"+
    "</ul>"
  }*/

window.taskArray = [
  {
    task: "The Task 1",
    type: "A",
    startTime: "2015-11-13",
    endTime: "2016-01-18"
  },

  {
    task: "The Task 122",
    type: "A",
    startTime: "2016-01-18",
    endTime: "2016-05-16"
  },
  {
    task: "The Task 1234",
    type: "B",
    startTime: "2016-04-23",
    endTime: "2016-04-30",
    details: "Yo"
  },

  {
    task: "The Task 1235",
    type: "C",
    relevance: 0.3,
    startTime: "2016-04-30",
    endTime: "2016-05-15",
    details: "Example"
  }
];

// bisher möglich:
// one day; months
window.overallperiod = "months";




var win = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = win.innerWidth || e.clientWidth || g.clientWidth,
    y = win.innerHeight|| e.clientHeight|| g.clientHeight;

window.svgwidth = x;
// this formula is not done yet, unfortunately but works relatively well
window.svgheight = 150 + taskArray.length * 27;
window.colorrange = ["#ff0", "#0f0"]; // http://www.rapidtables.com/web/color/RGB_Color.htm
window.ganttTitle = "My nice Gantt";


// optional
//window.ganttstates = {};
//window.ganttstates["default"] = "#afa";
//window.ganttstates["verspätet"] = "#FFA500";
//window.ganttstates["neu"] = "#ff0";
//window.ganttstates["weggefallen"] = "#fff";
// http://www.rapidtables.com/web/color/RGB_Color.htm