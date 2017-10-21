const svg = d3.select("#svg-container");
let width = svg.node().getBoundingClientRect().width,
    height = svg.node().getBoundingClientRect().height;

let geojson, cities, connects, projection;

let tile = d3.tile()
    .size([width, height]);

const state = {
    type: 'Mercator',
    scale: 290,
    translateX: width / 2 - 300,
    translateY: height / 2 + 380,
    centerLon: 0,
    centerLat: 0,
    rotateLambda: 0,
    rotatePhi: 0,
    rotateGamma: 0
};

const pi = Math.PI,
    tau = 2 * pi;

// Update projection
projection = d3['geo' + state.type]()
    .scale(1 / tau)
    .translate([0, 0]);
const geoGenerator = d3.geoPath()
    .projection(projection);

const graticule = d3.geoGraticule();
const color = d3.scaleOrdinal(d3.schemeCategory20);
const geoCircle = d3.geoCircle().radius(0.3).precision(1);

const zoom = d3.zoom()
    .scaleExtent([1 << 4, 1 << 24])
    .on("zoom", zoomed);

const raster = d3.select('g.map').append('g');
const circles = d3.select('.circles');
const lines = d3.select('.lines');
const grat = d3.select('.graticule');

function update() {

  geoGenerator.projection(projection);

  projection
    .scale(state.scale)
    .translate([state.translateX, state.translateY])
    .center([state.centerLon, state.centerLat])
    .rotate([state.rotateLambda, state.rotatePhi, state.rotateGamma]);
    // .fitExtent([[0, 0], [width, height]], geojson);

  // // Update world map
  // let u = d3.select('g.map')
  //   .selectAll('path')
  //   .data(geojson.features);

  // u.enter()
  //   .append('path')
  //   .merge(u)
  //   .attr('d', geoGenerator);

  // Update graticule
  grat
    .datum(graticule())
    .attr('d', geoGenerator);

  // update circles
  let u = circles
    .selectAll('path')
    .data(cities.map(function(d) {
          geoCircle.center([d.lng, d.lat]).radius(d.rad / 30000);

          let tmp = geoCircle();
          tmp['group'] = d.group;
          return tmp;
        })
    );

  u.enter()
    .append('path')
    .merge(u)
    .attr('d', geoGenerator)
    .attr("fill", function(d) { return color(d.group); });

  // update lines
  u = lines
    .selectAll('path')
    .data(connects.map(function(d) {
        return {
            group: d.group,
            type: 'Feature', geometry: {
                type: 'LineString',
                coordinates: [d.coords[1].reverse(), d.coords[0].reverse()]
            }
        };
    }));

  u.enter()
      .append('path')
      .merge(u)
      .attr("d", geoGenerator)
      // .attr('fill', d => color(+d.group))
      .attr('stroke', function (d) { return color(d.group); });

  // Compute the projected initial center.
  let center = projection([-98.5, 39.5]);

  // Apply a zoom transform equivalent to projection.{scale,translate,center}.
  svg
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(1 << 12)
          .translate(-center[0], -center[1]));
}


d3.json('/data/world.geo.json', function(err, json) {
    if (err) throw err;
    geojson = json;

    d3.json('/data/dcities.json', function (err, json2) {
        if (err) throw err;
        cities = json2;

        d3.json('/data/new-miserables.json', function (err, invalidJSON) {
            if (err) throw err;
            connects = invalidJSON;

            update();
        });
    });
});

function zoomed() {
  const transform = d3.event.transform;
  const tiles = tile
      .translate(projection.translate())
      .scale(transform.k)
      ();
  console.log(projection.translate());
  projection
      .scale(transform.k / tau)
      // .translate([transform.x, transform.y]);

  circles.selectAll('path').attr("d", geoGenerator);
  lines.selectAll('path').attr("d", geoGenerator);
  grat.select('path').attr("d", geoGenerator);

  let image = raster
      .attr("transform", stringify(tiles.scale, tiles.translate))
      .selectAll("image")
      .data(tiles, function(d) { return d; });

  image.exit().remove();

  image.enter().append("image")
      .attr("xlink:href", function(d) {
          return "http://" + "abc"[d[1] % 3] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png";
      })
      .attr("x", function(d) { return d[0] * 256; })
      .attr("y", function(d) { return d[1] * 256; })
      .attr("width", 256)
      .attr("height", 256);
}

function stringify(scale, translate) {
  let k = scale / 256, r = scale % 1 ? Number : Math.round;
  return "translate(" + r(translate[0] * scale) + "," + r(translate[1] * scale) + ") scale(" + k + ")";
}