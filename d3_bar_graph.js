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

  let featureLabels = {
    danceability_norm: "Danceability",
    energy_norm: "Energy",
    valence_norm: "Valence",
    acousticness_norm: "Acousticness"
  };

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
    .range([margin.left, width - margin.right])
    .padding(0.3);

  let x1 = d3.scaleBand()
    .padding(0.1);

  let y = d3.scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top]);

  let color = d3.scaleOrdinal()
    .domain(features)
    .range(["steelblue", "orange", "green", "purple"]);

  let xAxisGroup = svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`);

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  let barsGroup = svg.append("g");

  let legend = svg.append("g")
    .attr("transform", `translate(${width - 170}, 40)`);

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
      .text(featureLabels[f]);
  });

  function update() {
    let selectedFeature = d3.select("#sortFeature").property("value");

    let displayData = [...chartData];

    if (selectedFeature !== "all") {
      displayData.sort((a, b) => d3.ascending(a[selectedFeature], b[selectedFeature]));
    }

    let displayedFeatures = selectedFeature === "all" ? features : [selectedFeature];

    x0.domain(displayData.map(d => d.genre));
    x1.domain(displayedFeatures).range([0, x0.bandwidth()]);

    xAxisGroup
      .transition()
      .duration(800)
      .call(d3.axisBottom(x0));

    xAxisGroup.selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    let genreGroups = barsGroup
      .selectAll(".genre-group")
      .data(displayData, d => d.genre);

    let genreGroupsEnter = genreGroups.enter()
      .append("g")
      .attr("class", "genre-group");

    let allGroups = genreGroupsEnter.merge(genreGroups);

    allGroups.transition()
      .duration(800)
      .attr("transform", d => `translate(${x0(d.genre)},0)`);

    let rects = allGroups
      .selectAll("rect")
      .data(
        d => displayedFeatures.map(feature => ({
          genre: d.genre,
          feature,
          value: d[feature]
        })),
        d => d.feature
      );

    rects.enter()
      .append("rect")
      .attr("x", d => x1(d.feature))
      .attr("y", y(0))
      .attr("width", x1.bandwidth())
      .attr("height", 0)
      .attr("fill", d => color(d.feature))
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.7);
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>Genre:</strong> ${d.genre}<br>
            <strong>Feature:</strong> ${featureLabels[d.feature]}<br>
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
      })
      .merge(rects)
      .transition()
      .duration(800)
      .attr("x", d => x1(d.feature))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - margin.bottom - y(d.value))
      .attr("fill", d => color(d.feature));

    rects.exit()
      .transition()
      .duration(300)
      .attr("y", y(0))
      .attr("height", 0)
      .remove();

    genreGroups.exit().remove();

    legend.style("display", selectedFeature === "all" ? null : "none");
  }

  d3.select("#sortFeature").on("change", update);

  update();
});