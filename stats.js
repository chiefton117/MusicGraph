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

	var possible = choose(window.numArtists,2); // maximum possible number of links
	var link = document.createElement('H1');
	link.innerHTML = "% of artists linked : " + ((artistData.links.length / possible) * 100).toFixed(2) + "%";
	$("#stats").append(link);
	console.log("Plays" + totalplays);
	console.log(weightedGenres);
	
}
function choose(n, k) {
    if (k === 0) return 1;
    return (n * choose(n-1, k-1)) / k;
}