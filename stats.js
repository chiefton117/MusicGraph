function genStats() {

	var labels = d3.select("#statlist").selectAll("input")
		.data(window.artistData.nodes)
		.enter().append("label")
		.attr("class", "col-sm-4 col-md-4 col-lg-4")
		.text(function(d) { return d.id; });

	var	boxes = labels.append("input")
		.attr("type", "checkbox")
		.attr("checked", "true")
		.attr("id", function(d) { return d.id; });
	/*
	boxes.on("click", function(d) {

		d3.select(this).attr("checked", function(d) {

		});

		d3.selectAll(".links>line").filter(function(link_d) {
            return link_d.source.id == d.id || link_d.target.id == d.id;
          }).style("visibility", "hidden");
		

		console.log(d);
		*/
		/*
		d3.selectAll("g").style("visibility", function(d_sel) {
			if(d_sel) {
				if(d_sel.genres.includes(d)) return 'hidden';
			}
		});
		d3.selectAll(".links>line").style("visibility", function(d_sel) {
			if(d_sel) {
				if(d_sel.source.genres.includes(d) || d_sel.target.genres.includes(d)) return 'hidden';
			}
		}); 
	});*/


}


/*
	var labels = d3.select("#statlist").selectAll("input")
		.data(window.genres)
		.enter().append("label")
		.attr("class", "col-sm-4 col-md-4 col-lg-4")
		.text(function(d) { return d; });

	var	boxes = labels.append("input")
		.attr("type", "checkbox")
		.attr("checked", "true")
		.attr("id", function(d) { return d; });

	boxes.on("click", function(d) {
		console.log(d);
		d3.selectAll("g").style("visibility", function(d_sel) {
			if(d_sel) {
				if(d_sel.genres.includes(d)) return 'hidden';
			}
		});
		d3.selectAll(".links>line").style("visibility", function(d_sel) {
			if(d_sel) {
				if(d_sel.source.genres.includes(d) || d_sel.target.genres.includes(d)) return 'hidden';
			}
		});
	});
	*/