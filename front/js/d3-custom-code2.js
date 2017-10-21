'use strict';

const svg = d3.select("#svg-container");
let width = svg.node().getBoundingClientRect().width,
    height = svg.node().getBoundingClientRect().height;

var places = {
  HNL: [-157 - 55 / 60 - 21 / 3600, 21 + 19 / 60 + 7 / 3600],
  HKG: [113 + 54 / 60 + 53 / 3600, 22 + 18 / 60 + 32 / 3600],
  SVO: [37 + 24 / 60 + 53 / 3600, 55 + 58 / 60 + 22 / 3600],
  HAV: [-82 - 24 / 60 - 33 / 3600, 22 + 59 / 60 + 21 / 3600],
  CCS: [-66 - 59 / 60 - 26 / 3600, 10 + 36 / 60 + 11 / 3600],
  UIO: [-78 - 21 / 60 - 31 / 3600, 0 + 6 / 60 + 48 / 3600]
};

var route = {
  type: "LineString",
  coordinates: [
    places.HNL,
    places.HKG,
    places.SVO,
    places.HAV,
    places.CCS,
    places.UIO
  ]
};

var projection = d3.geo.kavrayskiy7()
    .scale(170)
    .rotate([-40, 0])
    .translate([width / 2, height / 2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var graticule = d3.geo.graticule();

svg.append("defs").append("path")
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path);

svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");

svg.append("use")
    .attr("class", "fill")
    .attr("xlink:href", "#sphere");

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

svg.append("path")
    .datum(route)
    .attr("class", "route")
    .attr("d", path);

var point = svg.append("g")
    .attr("class", "points")
  .selectAll("g")
    .data(d3.entries(places))
  .enter().append("g")
    .attr("transform", function(d) { return "translate(" + projection(d.value) + ")"; });

point.append("circle")
    .attr("r", 4.5);

point.append("text")
    .attr("y", 10)
    .attr("dy", ".71em")
    .text(function(d) { return d.key; });

const err = d3.select('#error-message');

d3.json("/charity/front/data/world-50m.json", function(error, world) {
  if (error) {
      console.log(error);
      err.append('p').text(error);
      throw error;
  }

  svg.insert("path", ".graticule")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);

  svg.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "boundary")
      .attr("d", path);
});

d3.select(self.frameElement).style("height", height + "px");