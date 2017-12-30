const dataUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const request = new XMLHttpRequest();
request.open('GET', dataUrl, true);

request.onload = () => {
  if (request.status >= 200 && request.status < 400) {
    const data = JSON.parse(request.responseText);
    // console.log(data.monthlyVariance);
    const baseTemp = data.baseTemperature;
    const dataset = data.monthlyVariance;
    const w = 1200;
    const h = 800;
    const padding = 60;
    const marginLB = 40;
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
                     .range([padding + marginLB, w - padding]);

    const minVariance = d3.min(dataset, (d) => d.variance);
    const maxVariance = d3.max(dataset, (d) => d.variance);

    const xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.timeFormat('%Y'));

    const colors = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"];

    const colorScale = d3.scaleQuantile()
    .domain([minVariance + baseTemp, maxVariance + baseTemp])
    .range(colors);

    // const colorScale = d3.scaleSequential()
    //                      .domain([minVariance + baseTemp, maxVariance + baseTemp])
    //                      .interpolator(d3.interpolateRainbow);


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
                           .attr("y", (d, i) => i * cellHeight)
                           .style("text-anchor", "end")
                           .attr("transform", `translate(${padding + marginLB - 6}, ${cellHeight / 1.5})`)
                           .attr("class", "yLabel");

    svg.call(tip);

    const color = d3.scaleOrdinal(d3.schemeCategory20);

    const temps = svg.selectAll(".years")
      .data(dataset, (d) => `${d.year}:${d.month}`);

    temps.enter()
      .append("rect")
      .attr("x", (d) => ((d.year - minYear) * cellWidth) + padding + marginLB)
      .attr("y", (d) => (d.month - 1) * cellHeight)
      .attr("rx", 0)
      .attr("ry", 0)
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .style("fill", (d) => colorScale(d.variance + baseTemp))
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    // add x axis
    svg.append("g")
       .attr("transform", `translate(0, ${h - padding - marginLB})`)
       .call(xAxis);

    // add titles to the axes
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${(padding + marginLB) / 2},${h/2})rotate(-90)`)
        .text("Months");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (w/2) +","+(h-((padding + marginLB)/3))+")")
        .text("Years");

    // const legend = svg.selectAll('.legend')
    //                   .data(color.domain())
    //                   .enter()
    //                   .append('g')
    //                   .attr('class', 'legend')
    //                   .attr('id', (d) => d)
    //                   .attr('transform', function(d, i) {
    //                     var height = legendRectSize + legendSpacing;
    //                     var offset =  height * color.domain().length / 2;
    //                     // var horz = -2 * legendRectSize;
    //                     let row = i <= 5 ? 1 : 2;
    //                     let horz = i <= 5 ?
    //                       30 + (i * w / 6) :
    //                       30 + ((i - 6) * w / 6);
    //                     const vert = height * row;
    //                     return 'translate(' + horz + ',' + vert + ')';
    //                   })
    //                   .on('click', (d) => {
    //                     const allCircles = Array.from(document.getElementsByClassName('circle'));
    //                     const otherContinents = allCircles.filter(el => !el.classList.contains(d));
    //                     const continentMatches = Array.from(document.getElementsByClassName(d));
    //                     otherContinents.forEach((el) => {
    //                       el.classList.remove('visible');
    //                       el.classList.add('hidden');
    //                     });
    //                     continentMatches.forEach((el) => {
    //                       el.classList.remove('hidden');
    //                       el.classList.add('visible');
    //                     });
    //                     document.getElementById('btn').classList.add('btn-show');
    //                     document.getElementById('btn').classList.remove('btn-hide');
    //                   });

    // legend.append('circle')
    //   .attr('r', legendRectSize / 2)
    //   .style('fill', color)
    //   .style('stroke', color);

    // legend.append('text')
    //   .attr('x', legendRectSize )
    //   .attr('y', legendRectSize - (legendSpacing * 1.5))
    //   .text(function(d) { return d; });

    // const showAll = () => {
    //   const allCircles = Array.from(document.getElementsByClassName('circle'));
    //   allCircles.forEach((el) => {
    //     el.classList.remove('hidden');
    //     el.classList.add('visible');
    //   });
    //   document.getElementById('btn').classList.add('btn-hide');
    //   document.getElementById('btn').classList.remove('btn-show');
    // }

    // document.getElementById('btn').addEventListener("click", showAll);
  } else {
    console.log('error fetching data');

  }
};

request.onerror = () => {
  console.log('connection error');
};

request.send();