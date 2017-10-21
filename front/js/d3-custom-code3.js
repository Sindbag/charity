const svg = d3.select("#svg-container");
let width = svg.node().getBoundingClientRect().width,
    height = svg.node().getBoundingClientRect().height;
let geojson, cities, projection;
const state = {
    type: 'Mercator',
    scale: 290,
    translateX: width / 2 - 300,
    translateY: height / 2 + 380,
    centerLon: 0,
    centerLat: 0,
    rotateLambda: 1,
    rotatePhi: 2,
    rotateGamma: 0
};
var pi = Math.PI,
    tau = 2 * pi;
// Update projection
projection = d3['geo' + state.type]();
const geoGenerator = d3.geoPath()
    .projection(projection);

const graticule = d3.geoGraticule();
const color = d3.scaleOrdinal(d3.schemeCategory20);
const geoCircle = d3.geoCircle().radius(0.3).precision(1);

var zoom = d3.zoom()
    .scaleExtent([1 << 14, 1 << 11])
    .on("zoom", zoomed);

function update() {

  geoGenerator.projection(projection);

  projection
    .scale(state.scale)
    .translate([state.translateX, state.translateY])
    .center([state.centerLon, state.centerLat])
    .rotate([state.rotateLambda, state.rotatePhi, state.rotateGamma]);
    // .fitExtent([[0, 0], [width, height]], geojson);

  // // Update world map
  let u = d3.select('g.map')
    .selectAll('path')
    .data(geojson.features);

  u.enter()
    .append('path')
    .merge(u)
    .attr('d', geoGenerator);

  u = d3.select('.circles')
    .selectAll('path')
    .data(cities.map(function(d) {
      geoCircle.center([d.lng, d.lat]).radius(d.rad / 30000);
      return geoCircle();
    }));

  // Update graticule
  d3.select('.graticule path')
    .datum(graticule())
    .attr('d', geoGenerator);

  u.enter()
    .append('path')
    .merge(u)
    .attr('d', geoGenerator)
    .attr("fill", function(d) { return color(d.group); });
}


d3.json('/data/world.geo.json', function(err, json) {
  geojson = json;
  d3.json('/data/dcities.json', function(err, json) {
     cities = json;
     update();
  });
    svg
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(1 << 12)
          .translate(width / 2, height / 2));
});

function zoomed() {
  var transform = d3.event.transform;

  // var tiles = tile
  //     .scale(transform.k)
  //     .translate([transform.x, transform.y])
  //     ();

  projection
      .scale(transform.k / tau)
      .translate([transform.x, transform.y]);

  // vector
  //     .attr("d", path);
  //
  // var image = raster
  //     .attr("transform", stringify(tiles.scale, tiles.translate))
  //   .selectAll("image")
  //   .data(tiles, function(d) { return d; });
  //
  // image.exit().remove();
  //
  // image.enter().append("image")
  //     .attr("xlink:href", function(d) { return "http://" + "abc"[d[1] % 3] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
  //     .attr("x", function(d) { return d[0] * 256; })
  //     .attr("y", function(d) { return d[1] * 256; })
  //     .attr("width", 256)
  //     .attr("height", 256);
}