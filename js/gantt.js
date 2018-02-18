// this file should be mostly the same for all of your gantt charts

w = window.svgwidth;
h = window.svgheight;

var svg = d3.selectAll(".svg")
  .append("svg")
  .attr("width", w)
  .attr("height", h)
  .attr("class", "svg");


if(window.overallperiod == "months"){
  var dateFormat = d3.time.format("%Y-%m-%d");
  var tageZurueck = 15;
}
else if (window.overallperiod == "one day") {
  var dateFormat = d3.time.format("%Y-%m-%d %H:%M");
  var tageZurueck = 0.02;
}

var timeScale = d3.time.scale().domain(
  [
    d3.min(window.taskArray, function(d) {return dateFormat.parse(d.startTime)-(24*60*60*1000) * tageZurueck;}),
    d3.max(window.taskArray, function(d) {return dateFormat.parse(d.endTime);})
  ]
).range([30,w-200]);


var categories = new Array();

for (var i = 0; i < window.taskArray.length; i++){
  categories.push(window.taskArray[i].type);
}

//console.log(JSON.stringify(categories, null, 4));

var catsUnfiltered = categories; //for vert labels

categories = checkUnique(categories);


makeGant(window.taskArray, w, h);

var title = svg.append("text")
  .text(window.ganttTitle)
  .attr("x", w/2)
  .attr("y", 25)
  .attr("text-anchor", "middle")
  .attr("font-size", 18)
  .attr("fill", "#000");



function makeGant(tasks, pageWidth, pageHeight){
  var barHeight = 20;
  var gap = barHeight + 4;
  var topPadding = 75;
  var sidePadding = 75;

  var colorScale = d3.scale.linear()
  .domain([0, categories.length - 1])
  .range(window.colorrange)
  .interpolate(d3.interpolateHcl);

  makeGrid(sidePadding, topPadding, pageWidth, pageHeight);
  drawRects(tasks, gap, topPadding, sidePadding, barHeight, colorScale, pageWidth, pageHeight);
  vertLabels(gap, topPadding, sidePadding, barHeight, colorScale);

}

var weekday = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function getReadableDate(s){
  var thedate = new Date(s);

  var dd = thedate.getDate();
  var mm = thedate.getMonth()+1; //January is 0!
  var yyyy = thedate.getFullYear();

  if(dd<10) {
      dd='0'+dd
  } 

  if(mm<10) {
      mm='0'+mm
  } 

  if (window.overallperiod == "months") {
    return dd+'.'+mm+'.'+yyyy;
  }
  else if(window.overallperiod == "one day"){
    var minute = thedate.getMinutes();
    var hour = thedate.getHours();

    if(minute<10) {
      minute='0'+minute
    } 

    if(hour<10) {
        hour='0'+hour
    } 

    return hour + ":" + minute;
  }
}

function getBusinessDatesCount(startDate, endDate) {
    var count = 0;
    var curDate = new Date(startDate);
    while (curDate <= new Date(endDate)) {
        var dayOfWeek = curDate.getDay();
        if(!((dayOfWeek == 6) || (dayOfWeek == 0)))
           count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
}

function drawRects(theArray, theGap, theTopPad, theSidePad, theBarHeight, theColorScale, w, h){

  var bigRects = svg.append("g")
    .selectAll("rect")
    .data(theArray)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function(d, i){
    return i*theGap + theTopPad - 2;
  })
  .attr("width", function(d){
    return w-theSidePad/2;
  })
  .attr("height", theGap)
  .attr("stroke", "none")
  .attr("fill", function(d){
    // Backgroundcolor of the whole row
    for (var i = 0; i < categories.length; i++){
      if (d.type == categories[i]){
        return d3.rgb(theColorScale(i));
      }
    }
  })
  .attr("opacity", 0.2);


  var rectangles = svg.append('g')
    .selectAll("rect")
    .data(theArray)
    .enter();


  var innerRects = rectangles.append("rect")
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("x", function(d){
    return timeScale(dateFormat.parse(d.startTime)) + theSidePad;
  })
  .attr("y", function(d, i){
    return i*theGap + theTopPad;
  })
  .attr("width", function(d){
    return (timeScale(dateFormat.parse(d.endTime))-timeScale(dateFormat.parse(d.startTime)));
  })
  .attr("height", theBarHeight)
  .attr("stroke", "none")
  .attr("fill", function(d){
    // Color of the task
    if (window.ganttstates){
      if (d.state != undefined){
        return d3.rgb(window.ganttstates[d.state]);
      }
      else{
        return d3.rgb(window.ganttstates["default"]);
      }
    }
    else{
      for (var i = 0; i < categories.length; i++){
        if (d.type == categories[i]){
          return d3.rgb(theColorScale(i));
        }
      }  
    }
  })
  .attr("opacity", function(d){
    if (d.relevance != undefined){
      return d.relevance;
    }
  });


  var rectText = rectangles.append("text")
  .text(function(d){
    return d.task;
  })
  .attr("x", function(d){
    return (timeScale(dateFormat.parse(d.endTime))-timeScale(dateFormat.parse(d.startTime)))/2 + timeScale(dateFormat.parse(d.startTime)) + theSidePad;
  })
  .attr("y", function(d, i){
    return i*theGap + 14+ theTopPad;
  })
  .attr("font-size", 11)
  .attr("text-anchor", "middle")
  .attr("text-height", theBarHeight)
  .attr("fill", "#000")
  .attr("opacity", function(d){
    if (d.relevance != undefined){
      return d.relevance;
    }
  }); // text color



  // Beschreibung mit Hover
  innerRects.on('mouseover', function(e) {
    var tag = "";

    start = d3.select(this).data()[0].startTime;
    end = d3.select(this).data()[0].endTime;

    tag = "<table>"
    //"<tr><td>Aufgabe:</td><td>" + d3.select(this).data()[0].task + "</td>" +
    //"<tr><td>Typ:</td><td>" + d3.select(this).data()[0].type + "</td>" +

    if(window.overallperiod == "months"){
      tag += "<tr><td>Start:</td><td>" + weekday[new Date(start).getDay()] + " " + getReadableDate(start) + "</td>" +
      "<tr><td>Ende:</td><td>" + weekday[new Date(end).getDay()] + " " + getReadableDate(end) + "</td>" // (~ " + getBusinessDatesCount(start, end) + " PT)
    }
    else if(window.overallperiod == "one day"){
      tag += "<tr><td>Zeit:</td><td>" + getReadableDate(start) + " - " + getReadableDate(end) + "</td>"
    }

    if (d3.select(this).data()[0].state != undefined){
      tag += "<tr><td>Status:</td><td>" + d3.select(this).data()[0].state + "</td>"
    }

    if (d3.select(this).data()[0].details != undefined){
      tag += "<tr><td valign='top'>Details:</td><td>" + d3.select(this).data()[0].details + "</td>"
    }

    tag += "</table>"

    var output = document.getElementById("tag");

    var x = (this.x.animVal.value + this.width.animVal.value/2 - 56) + "px";
    var y = this.y.animVal.value + 25 + "px";

    output.innerHTML = tag;
    output.style.top = y;
    output.style.left = x;
    output.style.display = "block";
  });

  // die Beschreibung verschwindet erst, wenn irgendwo geklickt wird
  document.body.addEventListener('click', function() {
    var output = document.getElementById("tag");
    output.style.display = "none";
  }, true);
}


function makeGrid(theSidePad, theTopPad, w, h){

  if(window.overallperiod == "months"){
    var xAxis = d3.svg.axis()
    .scale(timeScale)
    .orient('bottom')
    .ticks(d3.time.days, 10000)
    .tickSize(-h+theTopPad+20, 0, 0)
    .tickFormat(d3.time.format('%b %Y'));
  }
  else if (window.overallperiod == "one day") {
    var xAxis = d3.svg.axis()
    .scale(timeScale)
    .orient('bottom')
    .ticks(d3.time.days, 1)
    .tickSize(-h+theTopPad+20, 0, 0)
    .tickFormat(d3.time.format('%d. %b'));
  }

  var grid = svg.append('g')
  .attr('class', 'grid')
  .attr('transform', 'translate(' +theSidePad + ', ' + (h - 50) + ')')
  .call(xAxis)
  .selectAll("text")  
  .style("text-anchor", "middle")
  .attr("fill", "#000")
  .attr("stroke", "none")
  .attr("font-size", 10)
  .attr("dy", "1em");
}

function vertLabels(theGap, theTopPad, theSidePad, theBarHeight, theColorScale){
  var numOccurances = new Array();
  var prevGap = 0;

  for (var i = 0; i < categories.length; i++){
    numOccurances[i] = [categories[i], getCount(categories[i], catsUnfiltered)];
  }

  var axisText = svg.append("g") //without doing this, impossible to put grid lines behind text
  .selectAll("text")
  .data(numOccurances)
  .enter()
  .append("text")
  .text(function(d){
    return d[0];
  })
  .attr("x", 10)
  .attr("y", function(d, i){
    if (i > 0){
      for (var j = 0; j < i; j++){
        prevGap += numOccurances[i-1][1];
         // console.log(prevGap);
         return d[1]*theGap/2 + prevGap*theGap + theTopPad;
       }
     } else{
      return d[1]*theGap/2 + theTopPad;
    }
  })
  .attr("font-size", 11)
  .attr("text-anchor", "start")
  .attr("text-height", 14)
  .attr("fill", function(d){
    for (var i = 0; i < categories.length; i++){
      if (d[0] == categories[i]){
        //  console.log("true!");
        return d3.rgb(theColorScale(i)).darker();
      }
    }
  });
}

//from this stackexchange question: http://stackoverflow.com/questions/1890203/unique-for-arrays-in-javascript
function checkUnique(arr) {
  var hash = {}, result = [];
  for ( var i = 0, l = arr.length; i < l; ++i ) {
        if ( !hash.hasOwnProperty(arr[i]) ) { //it works with objects! in FF, at least
          hash[ arr[i] ] = true;
          result.push(arr[i]);
        }
      }
      return result;
    }

//from this stackexchange question: http://stackoverflow.com/questions/14227981/count-how-many-strings-in-an-array-have-duplicates-in-the-same-array
function getCounts(arr) {
    var i = arr.length, // var to loop over
        obj = {}; // obj to store results
    while (i) obj[arr[--i]] = (obj[arr[i]] || 0) + 1; // count occurrences
    return obj;
  }

// get specific from everything
function getCount(word, arr) {
  return getCounts(arr)[word] || 0;
}