const dataUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const request = new XMLHttpRequest();
request.open('GET', dataUrl, true);

request.onload = () => {
  if (request.status >= 200 && request.status < 400) {
    const data = JSON.parse(request.responseText);
    const baseTemp = data.baseTemperature;
    const dataset = data.monthlyVariance;
    const w = 1200;
    const h = 800;
    const padding = 60;
    const marginLB = 40;
    const legendRectSize = 18;
    const legendSpacing = 6;
    const year = d3.timeFormat('%Y');
    const years = dataset.map(d => d.year);
    const uniqueYears = years.filter((value, index, self) =>
    self.indexOf(value) === index);

    const minYear = d3.min(uniqueYears);
    const minDate = new Date(minYear, 0);
    const maxYear = d3.max(uniqueYears);
    const maxDate = new Date(maxYear, 0);

    const cellHeight = (h - padding - marginLB) / months.length;
    const cellWidth = (w - padding - marginLB) / uniqueYears.length;
    const xScale = d3.scaleTime()
                     .domain([minDate, maxDate])
                     .range([(padding / 2) + marginLB, w - (padding/2)]);

    const minVariance = d3.min(dataset, (d) => d.variance);
    const maxVariance = d3.max(dataset, (d) => d.variance);

    const xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.timeFormat('%Y'));

    const colors = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"];

    const colorScale = d3.scaleQuantile()
    .domain([minVariance + baseTemp, maxVariance + baseTemp])
    .range(colors);


    const tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((d) => {
        return `<div class='tip-name'>${months[d.month - 1]} ${d.year}</div><div class='tip-gdp'>${(Math.floor((d.variance + baseTemp) * 1000) / 1000)}°</div>`;
      });

    const svg = d3.select("body")
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .attr("class", "chart")
      .attr("id", "chart");

    const monthLabels = svg.selectAll(".yLabel")
                           .data(months)
                           .enter()
                           .append("text")
                           .text((d) => d)
                           .attr("x", 0)
                           .attr("y", (d, i) => (i * cellHeight) + (padding/2))
                           .style("text-anchor", "end")
                           .attr("transform", `translate(${(padding/2) + marginLB - 6}, ${cellHeight / 1.5})`)
                           .attr("class", "yLabel");

    svg.call(tip);

    const color = d3.scaleOrdinal(d3.schemeCategory20);

    const temps = svg.selectAll(".years")
      .data(dataset, (d) => `${d.year}:${d.month}`);

    temps.enter()
      .append("rect")
      .attr("x", (d) => ((d.year - minYear) * cellWidth) + (padding/2) + marginLB)
      .attr("y", (d) => ((d.month - 1) * cellHeight) + (padding/2))
      .attr("rx", 0)
      .attr("ry", 0)
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .attr("class", "bar")
      .style("fill", (d) => colorScale(d.variance + baseTemp))
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    // add x axis
    svg.append("g")
       .attr("transform", `translate(0, ${h - (padding/2) - marginLB})`)
       .call(xAxis);

    // add titles to the axes
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${(padding + marginLB) / 3},${h/2})rotate(-90)`)
        .text("Months");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (w/2) +","+(h-(((padding/2) + marginLB)/3))+")")
        .text("Years");

    const legend = svg.selectAll('.legend')
                      .data([0].concat(colorScale.quantiles()))
                      .enter()
                      .append('g')
                      .attr('class', 'legend')
                      .attr('transform', (d, i) => {
                        const vert = h - (legendRectSize + legendSpacing);
                        const horz = w - padding - ((colors.length - (i + 1)) * (legendRectSize  * 2));
                        return `translate(${horz}, ${vert})`;
                      });

    legend.append('rect')
      .attr("width", legendRectSize * 2)
      .attr("height", legendRectSize / 2)
      .style("fill", (d, i) => colors[i]);

    legend.append("text")
      .attr("class", "legend__text")
      .text((d) => d3.format(".2f")(d))
      .attr('x', 0)
      .attr('y', -1 * (legendRectSize / 2));

  } else {
    console.log('error fetching data');

  }
};

request.onerror = () => {
  console.log('connection error');
};

request.send();