// =========================
// Part 2.1: Side-by-side Boxplot
// =========================

// Load the data for the boxplot
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 30, bottom: 50, left: 50};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const platforms = [...new Set(data.map(d => d.Platform))];
    const xScale = d3.scaleBand()
      .domain(platforms)
      .range([0, width])
      .paddingInner(0.1);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
      .range([height, 0]);

    // Add x-axis and its label
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(xScale));
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height + margin.bottom - 5)
       .attr("text-anchor", "middle")
       .text("Platform");

    // Add y-axis and its label
    svg.append("g")
       .call(d3.axisLeft(yScale));
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -height / 2)
       .attr("y", -margin.left + 15)
       .attr("text-anchor", "middle")
       .text("Likes");

    // Define a rollup function to compute min, q1, median, q3, and max for each group
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return {min, q1, median, q3, max};
    };

    // -----------------------------------------------------------------------
    // Group data by Platform and compute the quartiles for each group.
    // The following two lines group the data by platform and then determine the x position 
    // and the box width for each platform using the xScale.
    // -----------------------------------------------------------------------
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    quantilesByGroups.forEach((quantiles, Platform) => {
        const x = xScale(Platform);
        const boxWidth = xScale.bandwidth();

        // Draw vertical line from min to max for each platform
        svg.append("line")
           .attr("x1", x + boxWidth / 2)
           .attr("x2", x + boxWidth / 2)
           .attr("y1", yScale(quantiles.min))
           .attr("y2", yScale(quantiles.max))
           .attr("stroke", "black");

        // Draw the rectangular box from q1 to q3
        svg.append("rect")
           .attr("x", x)
           .attr("y", yScale(quantiles.q3))
           .attr("width", boxWidth)
           .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
           .attr("fill", "#ccc")
           .attr("stroke", "black");

        // Draw the horizontal line for the median
        svg.append("line")
           .attr("x1", x)
           .attr("x2", x + boxWidth)
           .attr("y1", yScale(quantiles.median))
           .attr("y2", yScale(quantiles.median))
           .attr("stroke", "red");
    });
});


// =========================
// Part 2.2: Side-by-side Bar Plot
// =========================

// Load the summarized social media average data
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define platforms and postTypes for this dataset
    const platforms = [...new Set(data.map(d => d.Platform))];
    const postTypes = [...new Set(data.map(d => d.PostType))];

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 30, bottom: 50, left: 50};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container for the bar plot
    const svg = d3.select("#barplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales: x0 for Platform and x1 for PostType, plus y scale for AvgLikes
    const x0 = d3.scaleBand()
      .domain(platforms)
      .range([0, width])
      .paddingInner(0.1);

    const x1 = d3.scaleBand()
      .domain(postTypes)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgLikes)])
      .nice()
      .range([height, 0]);

    // Color scale for PostType
    const color = d3.scaleOrdinal()
      .domain(postTypes)
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // Add x-axis and its label
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x0));
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height + margin.bottom - 5)
       .attr("text-anchor", "middle")
       .text("Platform");

    // Add y-axis and its label
    svg.append("g")
       .call(d3.axisLeft(y));
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -height / 2)
       .attr("y", -margin.left + 15)
       .attr("text-anchor", "middle")
       .text("Average Likes");

    // Create groups for each platform and draw the bars for each post type
    platforms.forEach(platform => {
        const platformData = data.filter(d => d.Platform === platform);
        const group = svg.append("g")
            .attr("transform", `translate(${x0(platform)},0)`);

        group.selectAll("rect")
            .data(platformData)
            .enter()
            .append("rect")
            .attr("x", d => x1(d.PostType))
            .attr("y", d => y(d.AvgLikes))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.AvgLikes))
            .attr("fill", d => color(d.PostType));
    });

    // Add the legend with a small colored square and text for each PostType
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, ${margin.top})`);

    postTypes.forEach((type, i) => {
        // Legend colored square
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", color(type));
        // Legend text
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(type)
            .attr("alignment-baseline", "middle");
    });
});


// =========================
// Part 2.3: Line Plot for Time Series Data
// =========================

// Load the summarized time series data
const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers and parse the date
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
        // The Date string is in the format "3/1/2024 (Friday)"; extract the date part and parse it.
        d.Date = d.Date.split(" ")[0];
        d.Date = d3.timeParse("%m/%d/%Y")(d.Date);
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 30, bottom: 70, left: 50};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container for the line plot
    const svg = d3.select("#lineplot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Date))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgLikes)])
      .nice()
      .range([height, 0]);

    // Draw the x-axis with rotated text labels
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(xScale))
       .selectAll("text")
       .style("text-anchor", "end")
       .attr("transform", "rotate(-25)");

    // Draw the y-axis
    svg.append("g")
       .call(d3.axisLeft(yScale));

       data.forEach(function(d) {
         d.AvgLikes = +d.AvgLikes;
         // If the format is "3/1/2024 12:00:00", split by space and keep the date part
         const datePart = d.Date.split(" ")[0];
         // Parse using the month/day/year format
         d.Date = d3.timeParse("%m/%d/%Y")(datePart);
       });
       

    // Add x-axis and y-axis labels
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height + margin.bottom - 10)
       .attr("text-anchor", "middle")
       .text("Date");

    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -height / 2)
       .attr("y", -margin.left + 15)
       .attr("text-anchor", "middle")
       .text("Average Likes");

    // Create the line generator with curveNatural
    const line = d3.line()
      .x(d => xScale(d.Date))
      .y(d => yScale(d.AvgLikes))
      .curve(d3.curveNatural);

    // Draw the line path
    svg.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 2)
       .attr("d", line);
});
