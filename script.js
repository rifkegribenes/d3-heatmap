const dataUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const colors = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#f6ff03", "#fbad41", "#fb3533", "#c542aa", "#7916a5", "#0e1384"];

let svg, data, x, y, xAxis, yAxis, dim, chartWrapper, cellHeight, cellWidth, uniqueYears, margin = {}, w, h, minYear, colorScale, baseTemp, xLabel, yLabel, xAxisG;

const legendRectSize = 18;
const legendSpacing = 6;

const updateDimensions = (winWidth) => {
  margin.top = 30;
  margin.right = 30;
  margin.left = 70;
  margin.bottom = 70;

  w = winWidth - margin.left - margin.right;
  h = .6 * w;
  cellHeight = h / months.length;
  cellWidth = w / uniqueYears.length;

  d3.selectAll('.d3-tip')
    .style("opacity", 0);
}

const render = (dataset) => {
  console.log('render');

  //get dimensions based on window size
  updateDimensions(window.innerWidth);

  //update x scale to new dimensions
  x.range([margin.left, w - margin.right]);

  console.log(cellHeight,cellWidth);

  //update svg to new dimensions
  // console.log(`width: ${w + margin.right + margin.left}`);
  // console.log(`height: ${h + margin.top + margin.bottom}`);
  svg
    .attr('width', w + margin.right + margin.left)
    .attr('height', h + margin.top + margin.bottom)
    // .attr('transform', `translate(${margin.left},${margin.top})`);

  //update the x axis
  xAxis.scale(x);

  console.log(h + margin.top + margin.bottom);
  xAxisG
    .attr("transform", `translate(0, ${h + margin.top + margin.bottom + 100})`)
    .call(xAxis);

  // initialize tooltips
  const tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html((d) => {
      return `<div class='tip-name'>${months[d.month - 1]} ${d.year}</div><div class='tip-gdp'>${(Math.floor((d.variance + baseTemp) * 1000) / 1000)}°</div>`;
    });

  svg.call(tip);

  // update cell size
  svg.selectAll('.bar')
      .attr("x", (d) => ((d.year - minYear) * cellWidth) + margin.left)
      .attr("y", (d) => ((d.month - 1) * cellHeight) + margin.top)
      .attr("rx", 0)
      .attr("ry", 0)
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  // update ylabels
  svg.selectAll('.yLabel')
    .attr("y", (d, i) => (i * cellHeight) + (margin.top))
    .attr("transform", `translate(${margin.left - 6}, ${cellHeight / 1.5})`);

  // update position of axis titles

  xLabel.attr("transform", `translate(${w / 2},${h + (margin.bottom / 1.35)})`)
  yLabel.attr("transform", `translate(${margin.left / 3},${h/2})rotate(-90)`)


    // add legend
    const legend = svg.selectAll('.legend')
      .data([0].concat(colorScale.quantiles()))
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        const vert = h + margin.top + margin.bottom - (legendRectSize + legendSpacing);
        const horz = w - ((colors.length - (i + 1)) * (legendRectSize  * 2));
        return `translate(${horz}, ${vert})`;
      });

    legend.append('rect')
      .attr("width", legendRectSize * 2)
      .attr("height", legendRectSize / 2)
      .style("fill", (d, i) => colors[i]);

    legend.append("text")
      .attr("class", "legend__text")
      .text((d) => d3.format(".1f")(d))
      .attr('x', 0)
      .attr('y', -1 * (legendRectSize / 2));
}

window.addEventListener('resize', render);

const init = () => {

  // define constants
  baseTemp = data.baseTemperature;
  const dataset = data.monthlyVariance;
  const year = d3.timeFormat('%Y');
  const years = dataset.map(d => d.year);
  uniqueYears = years.filter((value, index, self) =>
    self.indexOf(value) === index);

  minYear = d3.min(uniqueYears);
  const minDate = new Date(minYear, 0);
  const maxYear = d3.max(uniqueYears);
  const maxDate = new Date(maxYear, 0);
  const minVariance = d3.min(dataset, (d) => d.variance);
  const maxVariance = d3.max(dataset, (d) => d.variance);

  // initialize scales
  x = d3.scaleTime().domain([minDate, maxDate])

  colorScale = d3.scaleQuantile()
    .domain([minVariance + baseTemp, maxVariance + baseTemp])
    .range(colors);

  // initialize axis
  xAxis = d3.axisBottom(x)
    .tickFormat(d3.timeFormat('%Y'));

  //initialize svg
  svg = d3.select("body")
    .append("svg")
    .attr('width', w + margin.right + margin.left)
    .attr('height', h + margin.top + margin.bottom)
    .attr("class", "chart")
    .attr("id", "chart");

  xAxisG = svg.append('g')
    .attr('id', 'x-axis')
    .attr("transform", `translate(0, ${h + margin.top + margin.bottom + 100})`)
    .call(xAxis);

  // add titles to the axes
  yLabel = svg.append("text")
    .attr("id", "yLabel")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${margin.left / 3},${h/2})rotate(-90)`)
    .text("Months");

  xLabel = svg.append("text")
    .attr("id", "xLabel")
    .attr("text-anchor", "middle")
    .text("Years");

  const temps = svg.selectAll(".years")
      .data(dataset, (d) => `${d.year}:${d.month}`);

  temps.enter()
      .append("rect")
      .attr("x", (d) => ((d.year - minYear) * cellWidth) + margin.left)
      .attr("y", (d) => ((d.month - 1) * cellHeight) + margin.top)
      .attr("rx", 0)
      .attr("ry", 0)
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .attr("class", "bar")
      .style("fill", (d) => colorScale(d.variance + baseTemp));

  const monthLabels = svg.selectAll(".yLabel")
     .data(months)
     .enter()
     .append("text")
     .text((d) => d)
     .attr("x", 0)
     .attr("y", (d, i) => (i * cellHeight) + (margin.top))
     .style("text-anchor", "end")
     .attr("transform", `translate(${margin.left - 6}, ${cellHeight / 1.5})`)
     .attr("class", "yLabel");

   // render
   render(dataset);

 }

const request = new XMLHttpRequest();
request.open('GET', dataUrl, true);

request.onload = () => {
  if (request.status >= 200 && request.status < 400) {
    data = JSON.parse(request.responseText);
    init();
  } else {
    console.log('error fetching data');

  }
};

request.onerror = () => {
  console.log('connection error');
};

request.send();