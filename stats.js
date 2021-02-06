function genStats() {

	var weightedGenres = {};
	var totalplays = 0;
	console.log(window.numArtists);
	for(var i=0;i<window.numArtists;i++) {
		var current = window.artistData.nodes[i];
		current.genres.forEach(function(d) {
			if(weightedGenres[d]) {
				weightedGenres[d] = weightedGenres[d] + parseInt(current.plays);
			} else weightedGenres[d] = parseInt(current.plays);
		});
		totalplays += parseInt(current.plays);
	}
	/*
	const root = treemap(weightedGenres);

	var svg = d3.select("#bubbles")
	.append("svg")
	.attr("width", 100)
	.attr("height", 100)
	.append("g")
	.attr("transform"
		"translate(" + width / 2 + "," + height / 2 + ")");
	*/
	var genreLen = document.createElement('H1');
	genreLen.innerHTML = "# of Genres Recorded : " + Object.keys(weightedGenres).length;
	$("#stats").append(genreLen);


	var test_genre = "indie";	

	var possible = allLinks(window.numArtists); // maximum possible number of links
	var link = document.createElement('H1');
	link.innerHTML = "% of artists linked : " + ((artistData.links.length / possible) * 100).toFixed(2) + "%";
	$("#stats").append(link);
	var genre = document.createElement('h1');
	genre.innerHTML = "Test density of: " + test_genre;

	var wGenres = d3.entries(weightedGenres);

	

	
	var test_artists = {};
	window.artistData.nodes.forEach(function(d) {
		var percent = (d.genres.filter(e => e.toLowerCase().includes(test_genre)).length / d.genres.length) * 100;
		test_artists[d.id] = percent;
	});

	var t_artists = d3.entries(test_artists);
	
	var mean = d3.mean(t_artists, d => d.value);
	var median = d3.median(t_artists, d => d.value);
	var stdev = d3.deviation(t_artists, d => d.value);
	var max = d3.max(t_artists, d => d.value);
	var min = d3.min(t_artists, d => d.value);


	d3.select("#stats")
		.append("p")
		.text("mean : " + mean);
	d3.select("#stats")
		.append("p")
		.text("median : " + median);
	d3.select("#stats")
		.append("p")
		.text("stdev : " + stdev);
	d3.select("#stats")
		.append("p")
		.text(" ");

	var topGenres = d3.select("#stats")
		.selectAll("p")
		.data(t_artists)
		.enter().append("p")
		.text(d => d.key + " " + d.value);

}
function choose(n, k) {
    if (k === 0) return 1;
    return (n * choose(n-1, k-1)) / k;
}
/*
	returns the greatest number of links from n(given) nodes in an adirectional graph
*/
function allLinks(n) {
	return (n * (n-1)) / 2;
}