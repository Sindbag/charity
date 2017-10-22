let svg = d3.select("#svg-container");
let width = svg.node().getBoundingClientRect().width,
    height = svg.node().getBoundingClientRect().height;

svg = d3.select("#svg-container")
    .attr("width", width)
    .attr("height", height);

let geojson, projection;

let tile = d3.tile()
    .size([width, height]);

const pi = Math.PI,
    tau = 2 * pi;

// Update projection
projection = d3.geoOrthographic()
    .scale(1 / tau)
    .translate([0, 0]);

const geoGenerator = d3.geoPath()
    .projection(projection);

const graticule = d3.geoGraticule();
const color = d3.scaleOrdinal(d3.schemeCategory20);
const geoCircle = d3.geoCircle().radius(0.3).precision(1);

const zoom = d3.zoom()
    .scaleExtent([1 << 8, 1 << 14])
    // .translateExtent([[-100, -100], [width + 90, height + 100]])
    .on("zoom", zoomed);

const maps = d3.select('g.map');
const circles = d3.select('.circles');
const lines = d3.select('.lines');
const grat = d3.select('.graticule');

geoGenerator.projection(projection);

function update(cities, connects) {
  // Update world map
  let u = maps
    .selectAll('path')
    .data(geojson.features);

  u.enter()
    .append('path')
    .merge(u)
    .attr('d', geoGenerator);

  // Update graticule
  grat
    .datum(graticule())
    .attr('d', geoGenerator);

  // update circles
  u = circles
    .selectAll('path')
    .data(cities.map(function(d) {
          geoCircle.center([d['lng'] || d.lon, d.lat]).radius((d.rad || 7000) / 30000);
          let tmp = geoCircle();
          tmp['group'] = d.group + 1;
          tmp['name'] = d.city;
          return tmp;
        })
    );

  let up = u.enter()
    .append('path')
    .attr('opacity', 0);
  up
    .transition().duration(600)
    .attr("opacity", 1);
  up
    .merge(u)
    .attr('d', geoGenerator)
    .attr("fill", function(d) { return color(d.group); })
    .attr('data-toggle', 'modal')
    .attr('data-target', '#charityModal')
    .attr('data-name', d => d.name)
    .attr('data-count', d => +d.group)
    .append("svg:title")
    .text(function(d, i) { return d.name});

  // update lines
    if (connects.length) {
        u = lines
            .selectAll('path')
            .data(connects);

        up = u.enter()
            .append('path')
            .merge(u)
            .attr("d", geoGenerator)
            .attr('stroke', function (d) {
                return color(+d.group);
            });
    }
  // Compute the projected initial center.
  let center = projection([37.5, 55.4]);
  //
  // Apply a zoom transform equivalent to projection.{scale,translate,center}.
  if (!called) {
      svg
          .call(zoom)
          .call(zoom.transform, d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(1 << 12)
              .translate(-center[0], -center[1]));
      called = true;
  }
}

let called = false;


d3.json('/charity/front/data/bigc.json', function (err, json2) {
    if (err) throw err;
    let cities = json2;

    d3.json('/charity/front/data/bigl.json', function (err, links) {
        if (err) throw err;
        let connects = links;
        d3.json('/charity/front/data/world.geo.json', function(err, json3) {
            if (err) throw err;
            geojson = json3;
            perform_updates(cities, connects);
        });
    });
});

function perform_updates(cts, cnts) {
    let used = [],
        used_ct = [],
        used_cn = [];
    i = 0;
    cnts = cnts.map(function (d) {
        return {
            group: d.group,
            source: d.source,
            target: d.target,
            type: 'Feature', geometry: {
                type: 'LineString',
                coordinates:  [
                    d.coords[1].reverse(),
                    d.coords[0].reverse()
                ]
            }
        };
    });

    function fun () {
        if (i >= cts.length) return -1;

        ct = cts[i];

        used.push(ct['city']);
        used_ct.push(ct);
        let tmp = cnts.filter(cn => (used.indexOf(cn.source) > -1
            && used.indexOf(cn.target) > -1
            && used_cn.indexOf(cn) === -1));

        used_cn = used_cn.concat(tmp);
        update(used_ct, used_cn);
        i += 1;

        setTimeout(() => fun(), 100);
    }
    fun();
}

setInterval(rotate, 20);

let yaw = 300;
function rotate() {
  projection.rotate([yaw, -45]);
  yaw -= 0.1;

  circles.selectAll('path')
      .attr("d", geoGenerator);
  lines.selectAll('path')
      .attr("d", geoGenerator);
  grat.select('path')
      .attr("d", geoGenerator);
  maps.selectAll('path')
      .attr("d", geoGenerator);

}

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
  maps.selectAll('path')
      .attr("d", geoGenerator);

}


function stringify(scale, translate) {
  let k = scale / 256, r = scale % 1 ? Number : Math.round;
  return "translate(" + r(translate[0] * scale) + "," + r(translate[1] * scale) + ") scale(" + k + ")";
}
