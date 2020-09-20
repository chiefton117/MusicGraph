function genStats() {
	console.log(window.genres);
	window.genres.forEach(function(d) {
		$('#statlist').append("<input id=\"" + d + "\"type=\"checkbox\" checked>" + d + "</input>")
			.attr("id", "abcd");
	});
	/*
	$('#statlist').append($"g")
            .attr("class", "genres")
          .selectAll("input")
          .data(window.genres)
          .enter().append("input")
          .attr("id", function(d) {return d;})
          .attr("type", "checkbox")
          .text(function(d) {return d;});*/
}