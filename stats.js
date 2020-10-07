var hidden = [];
function genStats() {

	hidden = [];

	d3.select("#toggletabs").append("label") // Select All Button
		.attr("class", "col-sm-4 col-md-4 col-lg-4")
		.text("Select All ")
		.append("input")
		.attr("type", "checkbox")
		.property("checked", true)
		.attr("id", "all")
		.on("click", function(d) { // Logic for selecting and de-selecting all
			hidden = [];
			if(this.hasAttribute("checked")) {
				this.removeAttribute('checked');
				$('label>input').prop("checked", false);
				d3.selectAll(".nodes>g").style("visibility", "hidden");
				d3.selectAll(".links>line").style("visibility", "hidden");
				window.artistData.nodes.forEach(e => hidden.push(e.id));
			} else {
				this.setAttribute("checked", "true");
				$('label>input').prop("checked", true);
				d3.selectAll(".nodes>g").style("visibility", "visible");
				d3.selectAll(".links>line").style("visibility", "visible");
			}
		});

	var alabels = d3.select("#atoggle").selectAll("input")
		.data(window.artistData.nodes)
		.enter().append("label")
		.attr("class", "col-sm-4 col-md-4 col-lg-4")
		.text(function(d) { return d.id + " "; });

	var	aboxes = alabels.append("input")
		.attr("type", "checkbox")
		.property("checked", true)
		.attr("id", function(d) { return d.id; });
	
	var glabels = d3.select("#gtoggle").selectAll("input")
		.data(window.genres)
		.enter().append("label")
		.attr("class", "col-sm-4 col-md-4 col-lg-4")
		.text(function(d) { return d + " "; });

	var	gboxes = glabels.append("input")
		.attr("type", "checkbox")
		.property("checked", true)
		.attr("id", function(d) { return d; });
	
	aboxes.on("click", function(d) {

		var ch = $(this).prop('checked');
		var circles = d3.selectAll(".nodes>g");
	
		circles.select(function(i) {
			if(i.id == d.id) return this;
		}).style("visibility", function(d_sel) {
				if(ch) {
					hidden.splice(hidden.indexOf(d_sel.id),1);
					return 'visible';	
				}
				else {
					hidden.push(d_sel.id);
					return 'hidden';
				}
			});

		d3.selectAll(".links>line").filter(function(link_d) {
            return (link_d.source.id == d.id && !hidden.includes(link_d.target.id)) || (link_d.target.id == d.id && !hidden.includes(link_d.source.id));
          }).style("visibility", function(d_sel) {
          		return ch ? 'visible' : 'hidden';
          });
		
	});
	/*
	gboxes.on("click", function(d) {
		var ch = $(this).prop('checked');
		var circles = d3.selectAll(".nodes>g");
	
		circles.select(function(i) {
			if(i.genres.includes(d)) return this;
		}).style("visibility", function(d_sel) {
				if(ch) {
					hidden.splice(hidden.indexOf(d_sel.id),1);
					return 'visible';	
				}
				else {
					hidden.push(d_sel.id);
					return 'hidden';
				}
			});

		d3.selectAll(".links>line").filter(function(link_d) {
            return (link_d.source.id == d.id && !hidden.includes(link_d.target.id)) || (link_d.target.id == d.id && !hidden.includes(link_d.source.id));
          }).style("visibility", function(d_sel) {
          		return ch ? 'visible' : 'hidden';
          });
		
	});*/





}