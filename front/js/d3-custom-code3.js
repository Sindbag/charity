const svg = d3.select("#svg-container");
let width = svg.node().getBoundingClientRect().width,
    height = svg.node().getBoundingClientRect().height;
let geojson, cities, projection;
const geoGenerator = d3.geoPath()
    .projection(projection);

const graticule = d3.geoGraticule();

const geoCircle = d3.geoCircle().radius(0.5).precision(1);
const state = {
    type: 'Equirectangular',
    scale: 120,
    translateX: width / 2,
    translateY: height / 2,
    centerLon: 0,
    centerLat: 0,
    rotateLambda: 0.1,
    rotatePhi: 0,
    rotateGamma: 0
};

function update() {
  // Update projection
  projection = d3['geo' + state.type]();

  geoGenerator.projection(projection);


  projection
    // .scale(state.scale)
    // .translate([state.translateX, state.translateY])
    .center([state.centerLon, state.centerLat])
    .rotate([state.rotateLambda, state.rotatePhi, state.rotateGamma])
    .fitExtent([[0, 0], [width, height]], geojson);

  // Update world map
  let u = d3.select('g.map')
    .selectAll('path')
    .data(geojson.features);

  u.enter()
    .append('path')
    .merge(u)
    .attr('d', geoGenerator);

  // Update projection center
  const projectedCenter = projection([state.centerLon, state.centerLat]);
  d3.select('.projection-center')
    .attr('cx', projectedCenter[0])
    .attr('cy', projectedCenter[1]);

  u = d3.select('.circles')
    .selectAll('path')
    .data(cities.map(function(d) {
      geoCircle.center([d.lng, d.lat]);
      return geoCircle();
    }));

  // Update graticule
  d3.select('.graticule path')
    .datum(graticule())
    .attr('d', geoGenerator);

  u.enter()
    .append('path')
    .merge(u)
    .attr('d', geoGenerator);
}


d3.json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json', function(err, json) {
  geojson = json;
  d3.json('/data/dcities.json', function(err, json) {
     console.log(json);
     cities = json;
     update();
  });
});