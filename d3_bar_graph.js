let height = 500;
let margin = { top: 40, right: 40, bottom: 140, left: 60 };

let tooltip = d3.select("#tooltip");

d3.csv("Spotify_Song_Attributes_Cleaned.csv", d3.autoType).then(data => {
  let features = [
    "danceability_norm",
    "energy_norm",
    "valence_norm",
    "acousticness_norm"
  ];

  let grouped = d3.rollups(
    data,
    v => ({
      danceability_norm: d3.mean(v, d => d.danceability_norm),
      energy_norm: d3.mean(v, d => d.energy_norm),
      valence_norm: d3.mean(v, d => d.valence_norm),
      acousticness_norm: d3.mean(v, d => d.acousticness_norm)
    }),
    d => d.major_genre
  );

  let chartData = grouped.map(([genre, values]) => ({
    genre,
    ...values
  }));

  let minGenreWidth = 90;
  let width = Math.max(900, chartData.length * minGenreWidth);

  let svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  let x0 = d3.scaleBand()
    .domain(chartData.map(d => d.genre))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  let x1 = d3.scaleBand()
    .domain(features)
    .range([0, x0.bandwidth()])
    .padding(0.1);

  let y = d3.scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top]);

  let color = d3.scaleOrdinal()
    .domain(features)
    .range(["steelblue", "orange", "green", "purple"]);

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x0))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  svg.append("g")
    .selectAll("g")
    .data(chartData)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${x0(d.genre)},0)`)
    .selectAll("rect")
    .data(d => features.map(feature => ({
      genre: d.genre,
      feature,
      value: d[feature]
    })))
    .enter()
    .append("rect")
    .attr("x", d => x1(d.feature))
    .attr("y", d => y(d.value))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.value))
    .attr("fill", d => color(d.feature))
    .on("mouseover", function(event, d) {
      d3.select(this).attr("opacity", 0.7);

      tooltip
        .style("opacity", 1)
        .html(`
          <strong>Genre:</strong> ${d.genre}<br>
          <strong>Feature:</strong> ${d.feature.replace("_norm", "")}<br>
          <strong>Average:</strong> ${d.value.toFixed(3)}
        `);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity", 1);
      tooltip.style("opacity", 0);
    });

  let legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, 40)`);

  features.forEach((f, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(f));

    legend.append("text")
      .attr("x", 18)
      .attr("y", i * 20 + 10)
      .text(f.replace("_norm", ""));
  });
});