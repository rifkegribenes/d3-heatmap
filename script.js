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
    const w = 1000;
    const h = 800;
    const padding = 60;
    const marginLB = 90;
    const cellHeight = (h - padding - marginLB) / months.length;
    const legendRectSize = 18;
    const legendSpacing = 8;
    const year = d3.timeFormat('%Y');

    const years = dataset.map(d => d.year);
    const uniqueYears = years.filter((value, index, self) =>
    self.indexOf(value) === index);

    const minYear = d3.min(uniqueYears);
    const minDate = new Date(minYear, 0);
    const maxYear = d3.max(uniqueYears);
    const maxDate = new Date(maxYear, 0);
    console.log(minDate, maxDate);
    const xScale = d3.scaleTime()
                     .domain([minDate, maxDate])
                     .range([padding + marginLB, w - padding]);

    const minVariance = d3.min(dataset, (d) => d.variance);
    const maxVariance = d3.max(dataset, (d) => d.variance);

    // const maxGini = d3.max(dataset, (d) => d[3]);
    // const minGini = d3.min(dataset, (d) => d[3]);
    // const xScale = d3.scaleLinear()
    //                  .domain([minGini, maxGini])
    //                  .range([padding, w - padding]);
    // const maxGDP = d3.max(dataset, (d) => d[2]);
    // const minGDP = d3.min(dataset, (d) => d[2]);
    // const rScale = d3.scaleLinear()
    //                  .domain([minGDP, maxGDP])
    //                  .range([5, 25]);
    const xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.timeFormat('%Y'));


    // const tip = d3.tip()
    //   .attr('class', 'd3-tip')
    //   .offset([-10, 0])
    //   .html((d) => {
    //     return "<div class='tip-name'>" + d[0] + "</div><div class='tip-gdp'>GDP Per Capita:<br>" + formatCurrency(d[2]) + "<br><div class='tip-gdp'>Life Expectancy: " + d[1] + " yrs</div><div class='tip-gdp'>Gini Index: " + d[3] + "</div>";
    //   });

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
                           .attr("transform", `translate(${padding + marginLB}, ${cellHeight / 1.5})`)
                           .attr("class", "yLabel");

    // svg.call(tip);

    // const color = d3.scaleOrdinal(d3.schemeCategory20);

    // svg.selectAll("circle")
    //   .data(dataset)
    //   .enter()
    //   .append("circle")
    //   .attr("cx", (d) => xScale(d[3]))
    //   .attr("cy", (d) => yScale(d[1]))
    //   .attr("r", (d) => rScale(d[2]))
    //   .attr("fill", (d) => color(d[4]))
    //   .attr("id", (d) => d[0])
    //   .attr("class", (d) => `circle ${d[4]}`)
    //   .on('mouseover', (d) => {
    //     // only show tooltips for visible plots
    //     if (!document.getElementById(d[0]).classList.contains('hidden')) {
    //        tip.show(d);
    //       }
    //   })
    //   .on('mouseout', tip.hide);

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