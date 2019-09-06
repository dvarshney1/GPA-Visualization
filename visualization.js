
// Using jQuery, read our data and call visualize(...) only once the page is ready:
$(function() {
  d3.csv("cs_data_instructor.csv").then(function(data) {
    // Write the data to the console for debugging:
    console.log(data);

    // Call our visualize function:
    visualize(data);
  });
});


  var visualize = function(data) {

  // Boilerplate:
  var margin = { top: 50, right: 50, bottom: 50, left: 100 },

  width = 1200 - margin.left - margin.right,
  height = 2250 - margin.top - margin.bottom;

  var svg = d3.select("#chart")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .style("width", width + margin.left + margin.right)
              .style("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Visualization Code:

  // Semesters:
  // Spring 2010, Fall 2010, Spring 2011, Fall 2011, Fall 2012, Spring 2013, Fall 2013, Spring 2014, Fall 2014, Spring 2015, Fall 2015, Spring 2016, Fall 2016, Spring 2017, Fall 2017, Spring 2018, Fall 2018
  // Also, add a first entry placeholder.

  semesters = [" ", "Spring 2010", "Fall 2010", "Spring 2011", "Fall 2011", "Fall 2012", "Spring 2013", "Fall 2013", "Spring 2014", "Fall 2014", "Spring 2015", "Fall 2015", "Spring 2016", "Fall 2016", "Spring 2017", "Fall 2017", "Spring 2018", "Fall 2018"];

  // Manually, calculate x-axis coordinates (for use with scaleOrdinal()).
  x_coordinates = []
  for (var i = 0; i <= width; i += (width/(semesters.length))) {
          x_coordinates.push(i);
  }

  // Scale for Top Axis:
  var scaleTop = d3.scaleOrdinal()
                   .domain(semesters)
                   .range(x_coordinates);

  // Axis for the Top:
  var axisVariableTop = d3.axisTop()
                          .tickValues(semesters)
                          .scale(scaleTop);

  // Let's obtain all unique course numbers, store it in a list called courses.


  data_copy = [] // Copy of data without 2012-sp data -> very few data points for this semester

  data.forEach(function (d) {

          if (d.YearTerm != "2012-sp") {
                  data_copy.push(d);
          }
  });

  var lookup = {};
  var items = data_copy;
  var courses = []; // Going to store all course numbers
  courses.push(" "); // First entry placeholder
  for (var item, i = 0; item = items[i++]; ) {

          var num = item.Number;

          if (!(num in lookup)) {
                  lookup[num] = 1;
                  courses.push("CS " + num.toString());
          }

  }
  courses.push(" "); // Last entry placeholder

 console.log(courses);

 var min_gpa = {};
 var max_gpa = {};
 var sp_avg = {};
 var fa_avg = {};

 var course_iter = {};
 course_nums = [];
 for (var item, i = 0; item = items[i++]; ) {

         var num = item.Number;

         if (!(num in min_gpa)) {

                 min_gpa[num] = 5.00;
                 max_gpa[num] = 0.00;
                 // course_iter[num] = [];
                 course_nums.push(num);

         } else {
                 if (parseFloat(parseFloat(item.GPA).toFixed(2)) < min_gpa[num]) {
                         min_gpa[num] = parseFloat(parseFloat(item.GPA).toFixed(2));
                 }
                 if (parseFloat(parseFloat(item.GPA).toFixed(2)) > max_gpa[num]) {
                         max_gpa[num] = parseFloat(parseFloat(item.GPA).toFixed(2));
                 }
                 // course_iter[num].push(item);
         }

 }

course_nums.forEach(function(course_number) {
        course_iter[course_number] = [];
        sp_avg[course_number] = 0.0;
        fa_avg[course_number] = 0.0;

        yearterms = [   "2010-sp", "2010-fa",
                        "2011-sp", "2011-fa",
                                    "2012-fa",
                        "2013-sp", "2013-fa",
                        "2014-sp", "2014-fa",
                        "2015-sp", "2015-fa",
                        "2016-sp", "2016-fa",
                        "2017-sp", "2017-fa",
                        "2018-sp", "2018-fa"];
        var last_value = 0.0;

        yearterms.forEach(function (yt) {
                var found = items.filter(function(item) { return item.Number == course_number && item.YearTerm == yt; });

                if (found.length == 1) {

                        if (parseFloat(found[0].GPA) > last_value) {
                                found[0]['Color'] = "green";
                        } else {
                                found[0]['Color'] = "red";
                        }

                        if (found[0].YearTerm.includes("fa")) {
                                fa_avg[course_number] += parseFloat((parseFloat(found[0].GPA)/9).toFixed(2));
                        } else {
                                sp_avg[course_number] += parseFloat((parseFloat(found[0].GPA)/8).toFixed(2));
                        }

                        course_iter[course_number].push(found[0]);
                        last_value = parseFloat(found[0].GPA);
                }
        });

});

 console.log(min_gpa);
 console.log(max_gpa);
 console.log(fa_avg);
 console.log(sp_avg);
 console.log(course_iter);
 console.log(course_nums);

var special_width = 8;
var special_offset = height/(2 * courses.length);
 // function getScale(num, begin_y, end_y) {
 //
 //         return d3.scaleLinear()
 //                  .domain([min_gpa[num] - 0.10, Math.min(4.0, max_gpa[num] + 0.10)])
 //                  .range([end_y, begin_y]);
 //
 // }

 // Manually, calculate y-axis coordinates (for use with scaleOrdinal()).
 y_coordinates = []
 for (var i = 0; i <= height; i += (height/(courses.length))) {
         y_coordinates.push(i);
 }

// Scale for Left Axis:
var scaleLeft = d3.scaleOrdinal()
                  .domain(courses)
                  .range(y_coordinates);

// Axis for the Left:
var axisVariableLeft = d3.axisLeft()
                         .tickValues(courses)
                         .scale(scaleLeft);

var tip = d3.tip()
            .attr('class', 'd3-tip')
            .style('position','absolute')
            .html(function (d) {

                    var best = "";

                    if (sp_avg[d["Number"]] > fa_avg[d["Number"]]) {
                            best = "Spring";
                    } else {
                            best = "Fall";
                    }
                    //return "This is a tip object.";
                   return "<strong>" + "CS " + d["Number"] + "</br>" + "(" + d["Course Title"] + ")" + "</br>"
                   + "Avg. GPA: " + ((parseFloat(min_gpa[d["Number"]]) + parseFloat(max_gpa[d["Number"]]))/2).toFixed(2) + "</br>"
                   + "Best Semester to take: " + best + "</br>" + "Taught By: " + d["Instructor"] + "</br>" + "Average Number of A's: "
                   + parseFloat(d["Average A"]).toFixed(2) + "%" + "</br>"; //"</strong>" + d["Total_1980"] + "</span></br>" +
                   //"2018 Enrollment: <span style='color:red'>" + d["Total_2018"] + "</span>";
                 });

// Add the axes to the SVG
svg.append("g")
   .call(axisVariableTop);

// Top Axis Label
svg.append("text")
   .attr("transform",
         "translate(" + (width/2) + " ," +
         (0 - margin.top/2) + ")")
   .style("text-anchor", "middle")
   .text("Semester");
svg.call(tip);
// Left Axis Label
svg.append("g")
   .call(axisVariableLeft);
svg.append("text")
   .attr("transform",
         "translate(" + (0 - margin.left/2 + margin.left/10) + " ," +
         (5) + ")")
   .style("text-anchor", "middle")
   .text("Course");


 // Visual Encoding:
// Red color for losses, Green color for Victories

// Code to track win streaks
 // data = data.reverse();
 // data.forEach(function(d) {
 //         d.StreakTrack = 0;
 // });
 //
 // result.slice(1).forEach(function(opponent_name) {
 //
 //         var streak = 0;
 //
 //         data.forEach(function(d) {
 //                if(d.Opponent == opponent_name) {
 //
 //                        if (d.Result == "W") {
 //                                streak = streak + 1.5;
 //                                d.StreakTrack = streak;
 //                        } else {
 //                                if (streak > 0) {
 //                                        streak = streak + 1.5;
 //                                        d.StreakTrack = streak;
 //                                        streak = 0;
 //                                }
 //                        }
 //                }
 //         });
 //
 // });
 //
 // console.log(data);
 //
 //

 course_nums.forEach(function(course_number) {

         d = course_iter[course_number];

                 // var line = d3.line()
                 // .x(function(d) {
                 //         var term = "";
                 //
                 //         if (d['Term'] == "fa") {
                 //                 term = "Fall ";
                 //         } else {
                 //                 term = "Spring ";
                 //         }
                 //
                 //         return scaleTop(term + d['Year'].toString());
                 // })
                 // .y(function(d) {
                 //         var end_y = scaleLeft("CS " + d['Number'].toString());
                 //         var begin_y = end_y - (height/(courses.length));
                 //
                 //         var min = min_gpa[d['Number']] - 0.10;
                 //
                 //         var max = 0;
                 //
                 //         if (max_gpa[d['Number']] + 0.10 > 4.0) {
                 //                 max = 4.0;
                 //         } else {
                 //                 max = parseFloat(max_gpa[d['Number']]) + 0.10;
                 //         }
                 //         // var course_scale = getScale(d.Number, begin_y, end_y);
                 //         var gpa = parseFloat(d['GPA']);
                 //
                 //         var course_scale = d3.scaleLinear()
                 //           //.domain([min_gpa[d.Number] - 0.10, Math.min(4.0, max_gpa[d.Number] + 0.10)])
                 //           .domain([min, max])
                 //           .range([end_y, begin_y]);
                 //
                 //         // console.log(end_y);
                 //         // console.log((height/(courses.length)));
                 //         // console.log(begin_y);
                 //         // console.log(gpa);
                 //         // console.log(min);
                 //         // console.log(max);
                 //         // console.log(course_scale);
                 //
                 //         return course_scale(gpa);
                 // })
                 //
                 // svg.append('path').attr('d', line(data));



         svg.append("path")
              .datum(d)
              .attr("fill", "none")
              .attr("stroke", "#e0e0e0") //"#efd6ff") //"#ffc6ad")
              .attr("stroke-width", 2.5)
              .attr("d",

              d3.line()
                .x(function(d) {
                        var term = "";

                        if (d.Term == "fa") {
                                term = "Fall ";
                        } else {
                                term = "Spring ";
                        }

                        return scaleTop(term + d.Year.toString());
                })
                .y(function(d) {
                        var end_y = scaleLeft("CS " + d.Number.toString()) - special_width + special_offset;
                        var begin_y = scaleLeft("CS " + d.Number.toString()) - (height/(courses.length)) + special_width + special_offset;

                        var min = min_gpa[d.Number] - 0.10;

                        var max = 0;

                        if (max_gpa[d.Number] + 0.10 > 4.0) {
                                max = 4.0;
                        } else {
                                max = parseFloat(max_gpa[d.Number]) + 0.10;
                        }
                        // var course_scale = getScale(d.Number, begin_y, end_y);
                        var gpa = parseFloat(d.GPA);

                        var course_scale = d3.scaleLinear()
                          //.domain([min_gpa[d.Number] - 0.10, Math.min(4.0, max_gpa[d.Number] + 0.10)])
                          .domain([min, max])
                          .range([end_y, begin_y]);

                        // console.log(end_y);
                        // console.log((height/(courses.length)));
                        // console.log(begin_y);
                        // console.log(gpa);
                        // console.log(min);
                        // console.log(max);
                        // console.log(course_scale);

                        return course_scale(gpa);
                }));
 });


 svg.selectAll("football_data")
    .data(data_copy)
    .enter()
    .append("circle")
    .attr("r", function(d, i) {
            // return Math.abs((d.IlliniScore - d.OpponentScore)/2.5);
            var avg = (parseFloat(min_gpa[d.Number]) + parseFloat(max_gpa[d.Number]))/2;

            var max_diff = parseFloat(max_gpa[d.Number]) - avg;
            var diff = Math.abs(parseFloat(d.GPA) - avg);

            var radius_scale = d3.scaleLinear()
              //.domain([min_gpa[d.Number] - 0.10, Math.min(4.0, max_gpa[d.Number] + 0.10)])
              .domain([0, max_diff])
              .range([2, 3, 4, 5]);

            return radius_scale(diff);
    })
    .attr("cx", function(d, i) {

            var term = "";

            if (d.Term == "fa") {
                    term = "Fall ";
            } else {
                    term = "Spring ";
            }

            return scaleTop(term + d.Year.toString());

    })
    .attr("cy", function(d, i) {

            var end_y = scaleLeft("CS " + d.Number.toString()) - special_width + special_offset;
            var begin_y = scaleLeft("CS " + d.Number.toString()) - (height/(courses.length)) + special_width + special_offset;

            var min = min_gpa[d.Number] - 0.10;

            var max = 0;

            if (max_gpa[d.Number] + 0.10 > 4.0) {
                    max = 4.0;
            } else {
                    max = parseFloat(max_gpa[d.Number]) + 0.10;
            }
            // var course_scale = getScale(d.Number, begin_y, end_y);
            var gpa = parseFloat(d.GPA);

            var course_scale = d3.scaleLinear()
              //.domain([min_gpa[d.Number] - 0.10, Math.min(4.0, max_gpa[d.Number] + 0.10)])
              .domain([min, max])
              .range([end_y, begin_y]);

            // console.log(end_y);
            // console.log((height/(courses.length)));
            // console.log(begin_y);
            // console.log(gpa);
            // console.log(min);
            // console.log(max);
            // console.log(course_scale);

            return course_scale(gpa);

    })
    .attr("fill", function(d, i) {
            var avg = (parseFloat(min_gpa[d.Number]) + parseFloat(max_gpa[d.Number]))/2;

            if (parseFloat(d.GPA) >= avg) {
                    return "green";
            } else {
                    return "red";
            }
    })
    .attr("stroke", "none")
    .attr("opacity", function (d) {

            var avg = (parseFloat(min_gpa[d.Number]) + parseFloat(max_gpa[d.Number]))/2;

            var max_diff = parseFloat(max_gpa[d.Number]) - avg;
            var diff = Math.abs(parseFloat(d.GPA) - avg);

            var opacity_scale = d3.scaleLinear()
              //.domain([min_gpa[d.Number] - 0.10, Math.min(4.0, max_gpa[d.Number] + 0.10)])
              .domain([0, max_diff])
              .range([0.25, 1.0]);

            return opacity_scale(diff);

    })
    .on('mouseover', function(d){

  tip.show(d);
  // var begin_y = scaleLeft("CS " + d.Number.toString()) - (height/(courses.length)) + special_offset;
  // tip.style('top', begin_y + 'px');
  // tip.style('left', scaleTop("Fall 2014") + 'px');
  var end_y = scaleLeft("CS " + d.Number.toString()) - special_width + special_offset;
  var begin_y = scaleLeft("CS " + d.Number.toString()) - (height/(courses.length)) + special_width + special_offset;

  var min = min_gpa[d.Number] - 0.10;

  var max = 0;

  if (max_gpa[d.Number] + 0.10 > 4.0) {
          max = 4.0;
  } else {
          max = parseFloat(max_gpa[d.Number]) + 0.10;
  }
  // var course_scale = getScale(d.Number, begin_y, end_y);
  var gpa = parseFloat(d.GPA);

  var course_scale = d3.scaleLinear()
    //.domain([min_gpa[d.Number] - 0.10, Math.min(4.0, max_gpa[d.Number] + 0.10)])
    .domain([min, max])
    .range([end_y, begin_y]);

  // console.log(end_y);
  // console.log((height/(courses.length)));
  // console.log(begin_y);
  // console.log(gpa);
  // console.log(min);
  // console.log(max);
  // console.log(course_scale);

  var y = course_scale(gpa);

  var term = "";

  if (d.Term == "fa") {
          term = "Fall ";
  } else {
          term = "Spring ";
  }

  var x = scaleTop(term + d.Year.toString());

  tip.style('top', (y - 50) + 'px');
  tip.style('left', x + margin.left + 'px');

})
.on('mouseout', tip.hide);

 svg.selectAll("gpa_data")
    .data(data_copy)
    .enter()
    .append("text")
    .text(function(d){

            var gpa = parseFloat(d.GPA);
            return gpa.toFixed(2);

    })
    .attr("x", function (d) {
            var term = "";

            if (d.Term == "fa") {
                    term = "Fall ";
            } else {
                    term = "Spring ";
            }

            return scaleTop(term + d.Year.toString());
    })
    .attr("y", function (d) {
            var end_y = scaleLeft("CS " + d.Number.toString()) - special_width + special_offset;
            var begin_y = scaleLeft("CS " + d.Number.toString()) - (height/(courses.length)) + special_width + special_offset;

            var min = min_gpa[d.Number] - 0.10;

            var max = 0;

            if (max_gpa[d.Number] + 0.10 > 4.0) {
                    max = 4.0;
            } else {
                    max = parseFloat(max_gpa[d.Number]) + 0.10;
            }
            // var course_scale = getScale(d.Number, begin_y, end_y);
            var gpa = parseFloat(d.GPA);

            var course_scale = d3.scaleLinear()
              //.domain([min_gpa[d.Number] - 0.10, Math.min(4.0, max_gpa[d.Number] + 0.10)])
              .domain([min, max])
              .range([end_y, begin_y]);

            // console.log(end_y);
            // console.log((height/(courses.length)));
            // console.log(begin_y);
            // console.log(gpa);
            // console.log(min);
            // console.log(max);
            // console.log(course_scale);

            return course_scale(gpa) - 5;
    })
    .attr("font-size", function (d) {
             return 13;
    })
    .attr("opacity", function (d) {

            var avg = (parseFloat(min_gpa[d.Number]) + parseFloat(max_gpa[d.Number]))/2;

            var max_diff = parseFloat(max_gpa[d.Number]) - avg;
            var diff = Math.abs(parseFloat(d.GPA) - avg);

            var opacity_scale = d3.scaleLinear()
              //.domain([min_gpa[d.Number] - 0.10, Math.min(4.0, max_gpa[d.Number] + 0.10)])
              .domain([0, max_diff])
              .range([0.25, 1.0]);

            return opacity_scale(diff);

    })
    .attr("fill", function (d) {
            var avg = (parseFloat(min_gpa[d.Number]) + parseFloat(max_gpa[d.Number]))/2;

            if (parseFloat(d.GPA) >= avg) {
                    return "green";
            } else {
                    return "red";
            }
    });

};
