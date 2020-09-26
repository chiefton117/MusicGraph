function genStats() {

	var slist = d3.select("#statlist");

	var boxes = slist.selectAll("input")
		.data(window.genres)
		.enter().append("label")
		.text(function(d) { return d; })
		.append("input")
		.attr("type", "checkbox")
		.attr("checked", "true")
		.attr("id", function(d) { return d; });

	//d3.selectAll("#statlist>label").append("br");
		
/*
	window.genres.forEach(function(d) {
		$('#statlist').attr("id", "statlist");
		//$('#statlist').append("<input id=\"" + d + "\"type=\"checkbox\" checked>" + d + "</input><br>");
	});
*/





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