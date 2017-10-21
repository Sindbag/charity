let svg = d3.select("#svg-container");
let width = svg.node().getBoundingClientRect().width,
    height = svg.node().getBoundingClientRect().height;

svg = d3.select("#svg-container")
    .attr("width", width)
    .attr("height", height);

let cities, connects, projection;

let tile = d3.tile()
    .size([width, height]);

const pi = Math.PI,
    tau = 2 * pi;

// Update projection
projection = d3.geoMercator()
    .scale(1 / tau)
    .translate([0, 0]);

const geoGenerator = d3.geoPath()
    .projection(projection);

const graticule = d3.geoGraticule();
const color = d3.scaleOrdinal(d3.schemeCategory20);
const geoCircle = d3.geoCircle().radius(0.3).precision(1);

const zoom = d3.zoom()
    .scaleExtent([1 << 11, 1 << 14])
    // .translateExtent([[-100, -100], [width + 90, height + 100]])
    .on("zoom", zoomed);

const raster = d3.select('g.map').append('g');
const circles = d3.select('.circles');
const lines = d3.select('.lines');
const grat = d3.select('.graticule');

geoGenerator.projection(projection);


function update() {
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
          tmp['name'] = d.cnm;
          return tmp;
        })
    );

  u.enter()
    .append('path')
    .merge(u)
    .attr('d', geoGenerator)
    .attr("fill", function(d) { return color(d.group); })
    .attr('data-toggle', 'modal')
    .attr('data-target', '#exampleModal')
    .attr('data-name', d => d.name)
    .attr('data-count', d => d.groud)
    // .on('click', d => handleMouseClick(d))
    .append("svg:title")
    .text(function(d, i) { return d.name});

  // update lines
  u = lines
    .selectAll('path')
    .data(connects.map(function(d) {
        return {
            group: d.group,
            type: 'Feature', geometry: {
                type: 'LineString',
                coordinates: [
                    d.coords[1].reverse(),
                    d.coords[0].reverse()
                ]
            }
        };
    }));

  u.enter()
      .append('path')
      .merge(u)
      .attr("d", geoGenerator)
      .attr('stroke', function (d) { return color(+d.group); });

  // Compute the projected initial center.
  let center = projection([37.5, 55.4]);
  //
  // Apply a zoom transform equivalent to projection.{scale,translate,center}.
  svg
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(1 << 12)
          .translate(-center[0], -center[1]));
}


d3.json('/charity/front/data/new-dcities.json', function (err, json2) {
    if (err) throw err;
    cities = json2;

    d3.json('/charity/front/data/new-miserables.json', function (err, invalidJSON) {
        if (err) throw err;
        connects = invalidJSON;

        update();
    });
});

function zoomed() {
  const transform = d3.event.transform;
  const tiles = tile
      .scale(transform.k)
      .translate([transform.x, transform.y])
      ();

  projection
      .scale(transform.k / tau)
      .translate([transform.x, transform.y]);

  circles.selectAll('path')
      .attr("d", geoGenerator);
  lines.selectAll('path')
      .attr("d", geoGenerator);
  grat.select('path')
      .attr("d", geoGenerator);

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

$('#exampleModal').on('show.bs.modal', function (event) {
  let button = $(event.relatedTarget); // Button that triggered the modal
  let city = button.data('name'); // Extract info from data-* attributes
  let count = button.data('count'); // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  let modal = $(this);
  modal.find('.modal-title').text('Благотворительность в городе ' + city);
  modal.find('#modalData').html('Ого: ' + count)
});