/* jshint esversion: 6 */

///////////////////////////////////////////////////////////////////////////////
//// Initial Set Up ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Global variables
const columns = 10,
			rows = 10,
			gridSize = 20,
			icon = "M96 0c35.346 0 64 28.654 64 64s-28.654 64-64 64-64-28.654-64-64S60.654 0 96 0m48 144h-11.36c-22.711 10.443-49.59 10.894-73.28 0H48c-26.51 0-48 21.49-48 48v136c0 13.255 10.745 24 24 24h16v136c0 13.255 10.745 24 24 24h64c13.255 0 24-10.745 24-24V352h16c13.255 0 24-10.745 24-24V192c0-26.51-21.49-48-48-48z",
			panelPadding = 20,
			panelWidth = 240,
			panelHeight = 320;

///////////////////////////////////////////////////////////////////////////////
// Scales

const color = d3.scaleOrdinal()
		.domain(["no", "yes"])
		.range(["#ec1e25", "#ccc"]);

///////////////////////////////////////////////////////////////////////////////
// SVG containers

const svg = d3.select("#svg")
	.append("svg")
	.attr("width", 720)
	.attr("height", 680);

///////////////////////////////////////////////////////////////////////////////
//// Load and Process Data ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

d3.csv("data/data.csv", (row) => ({
		category: row.category,
		subcategory: row.subcategory,
		value: +row.value
}), (error, data) => {
	if (error) throw error;
	const dataByCategory = d3.nest()
		.key(d => d.category)
		.map(data);

	const categories = dataByCategory.keys();
	categories.forEach((category, i) => {
		svg.append("g")
			.attr("id", category)
			.attr("transform",
				`translate(${panelWidth * (i % 3) + panelPadding}, ${panelHeight * (Math.floor(i / 3)) + panelPadding})`)
			.call(waffleChart, dataByCategory.get(category), category)
			.call(captionNumber, dataByCategory.get(category), category)
			.call(captionText, category);
	});
});

///////////////////////////////////////////////////////////////////////////////
//// Waffle Chart /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function waffleChart(selection, data, category) {
	const gridData = [],
				answer = data.find(isSubcategoryNo).value;

	data.forEach(d => {
		d3.range(d.value).forEach(e => {
			gridData.push({ subcategory: d.subcategory });
		});
	});

	gridData.forEach((d, i) => {
		d.index = i;
		d.row = (columns - 1) - Math.floor(i / columns);
		d.column = i % columns;
	});

	const dataLength = gridData.length;

	/////////////////////////////////////////////////////////////////////////////
	// Plot each grid in the waffle chart

	const grid = selection.selectAll("g")
		.data(gridData)
		.enter()
		.append("g")
			.attr("transform", d => `translate(${d.column * gridSize}, ${d.row * gridSize})`);

	grid.append("path")
		.attr("class", "grid-icon")
		.attr("id", d => `${category}-icon-${d.index}`)
		.attr("d", icon)
		.attr("transform", "scale(0.035)");

	// Invisible square to capture mouse event
	grid.append("rect")
			.attr("width", gridSize)
			.attr("height", gridSize)
			.attr("class", "grid-rect")
			.attr("id", d => `${category}-icon-${d.index}`)
			.attr("fill", "none")
			.attr("pointer-events", "all")
			.style("cursor", "default")
			.on("mouseover", d => mouseover(d, dataLength, category))
			.on("mouseout", d => mouseout(d, dataLength, category))
			.on("click", d => click(d, dataLength, answer, category));
}

///////////////////////////////////////////////////////////////////////////////
//// Captions /////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function captionNumber(selection, data, category) {
	selection.append("g")
			.attr("transform", `translate(${columns / 2 * gridSize}, ${rows * gridSize})`)
		.append("text")
			.attr("id", `${category}-caption-number`)
			.attr("fill", color("no"))
			.attr("font-size", 42)
			.attr("text-anchor", "middle")
			.attr("y", 42)
			.text("?");
}

function captionText(selection, category) {
	const caption = selection.append("g")
		.attr("transform", `translate(${columns / 2 * gridSize}, ${rows * gridSize + 50})`)
	.append("text")
		.attr("class", "caption-text")
		.attr("fill", "#666")
		.attr("font-size", 18)
		.attr("text-anchor", "middle");

	switch(category) {
		case "water":
			caption.append("tspan")
					.attr("x", 0)
					.attr("y", 20)
					.text("would have no clean,");
			caption.append("tspan")
					.attr("x", 0)
					.attr("y", 40)
					.text("safe water to drink");
			break;
		case "nutrition":
			caption.append("tspan")
					.attr("x", 0)
					.attr("y", 20)
					.text("would be undernourished");
			break;
		case "poverty":
			caption.append("tspan")
					.attr("x", 0)
					.attr("y", 20)
					.text("would live on less than");
			caption.append("tspan")
					.attr("x", 0)
					.attr("y", 40)
					.text("$1.90 USD per day");
			break;
		case "literacy":
			caption.append("tspan")
					.attr("x", 0)
					.attr("y", 20)
					.text("would not be able");
			caption.append("tspan")
					.attr("x", 0)
					.attr("y", 40)
					.text("to read and write");
			break;
		case "electricity":
			caption.append("tspan")
					.attr("x", 0)
					.attr("y", 20)
					.text("would not");
			caption.append("tspan")
					.attr("x", 0)
					.attr("y", 40)
					.text("have electricity");
			break;
		case "housing":
			caption.append("tspan")
					.attr("x", 0)
					.attr("y", 20)
					.text("would not have a place to shelter");
			caption.append("tspan")
					.attr("x", 0)
					.attr("y", 40)
					.text("them from the wind and the rain");
			break;

	}
}

///////////////////////////////////////////////////////////////////////////////
//// Event Listeners //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// When mouse over, change the guessing number and icon coloring
function mouseover(d, dataLength, category) {
	d3.range(dataLength).forEach(index => {
		d3.select(`.grid-icon#${category}-icon-${index}`)
			.attr("fill", index <= d.index ? color("no") : color("yes"));
	});

	d3.select(`#${category}-caption-number`)
			.text(d.index + 1);
}

function mouseout(d, dataLength, category) {
	d3.range(dataLength).forEach(index => {
			d3.select(`.grid-icon#${category}-icon-${index}`)
				.attr("fill", color("yes"));
		});
	d3.select(`#${category}-caption-number`)
			.text("?");
}

///////////////////////////////////////////////////////////////////////////////
// When click, show the correct number
function click(d, dataLength, answer, category) {
	d3.selectAll(`#${category} .grid-rect`)
			.on("mouseover", null)
			.on("mouseout", null)
			.on("click", null);

	d3.range(dataLength - 1).forEach(index => {
		const t = d3.transition();
		if (d.index > answer - 1) { // Guess is greater than answer
			if (index <= d.index && index >= answer - 1) { // These icons need to change color
				d3.select(`.grid-icon#${category}-icon-${index}`)
					.transition(t)
						.duration(50)
						.delay(50 * (d.index - index))
						.attr("fill", index < answer ? color("no") : color("yes"))
						.on("end", () => {
							d3.select(`#${category}-caption-number`).text(index + 1);
						});
			}
		} else { // Guess is less than answer
			if (index > d.index && index <= answer - 1) { // These icons need to change color
				d3.select(`.grid-icon#${category}-icon-${index}`)
					.transition(t)
						.duration(50)
						.delay(50 * (index - d.index))
						.attr("fill", index < answer ? color("no") : color("yes"))
						.on("end", () => {
							d3.select(`#${category}-caption-number`).text(index + 1);
						});
			}
		}
	});
}

///////////////////////////////////////////////////////////////////////////////
//// Helper Functions /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function isSubcategoryNo(data) {
	return data.subcategory === "no";
}