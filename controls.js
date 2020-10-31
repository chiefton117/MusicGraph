var hidden = [];
function genControls() {

	hidden = [];

	 // Select All Button
	d3.select("#toggletabs").append("label")
		.attr("class", "col-sm-4 col-md-4 col-lg-4")
		.text("Select All ")
		.append("input")
		.attr("type", "checkbox")
		.property("checked", true)
		.attr("id", "all")
		.on("click", function(d) { // Logic for selecting and de-selecting all nodes/links
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

	// Create all labels for artists
	var alabels = d3.select("#atoggle").selectAll("input")
		.data(window.artistData.nodes)
		.enter().append("label")
		.attr("class", "col-sm-4 col-md-4 col-lg-4")
		.text(function(d) { return d.id + " "; });

	// Create checkboxes for artists and append to labels
	var	aboxes = alabels.append("input")
		.attr("type", "checkbox")
		.property("checked", true)
		.attr("id", function(d) { return d.id; });
	
	/*
	// Create labels for all genres
	var glabels = d3.select("#gtoggle").selectAll("input")
		.data(window.genres)
		.enter().append("label")
		.attr("class", "col-sm-4 col-md-4 col-lg-4")
		.text(function(d) { return d + " "; });

	// Create checkboxes for genres and append to labels
	var	gboxes = glabels.append("input")
		.attr("type", "checkbox")
		.property("checked", true)
		.attr("id", function(d) { return d; });
	*/
	var glabels = d3.select("#genrepicker").selectAll("option")
		.data(window.genres)
		.enter().append("option")
		.attr("data-tokens", function(d) { return d; })
		.text(function(d) { return d; });

	//$('select').on('change', function(d) {
		glabels.on("click", function(d) {
		var circles = d3.selectAll(".nodes>g");
		
		// Select the node with same primary key(artist name), update hidden array accordingly
		circles.style("visibility", function(d_sel) {
				return d_sel.genres.includes(d) ? 'visible' : 'hidden';
				if(hidden.includes(d_sel)) hidden.splice(hidden.indexOf(d_sel.id),1);
			});


		// Select all lines that are NOT hidden, and are attached to our artist
		d3.selectAll(".links>line").style("visibility", function(d_sel) {
			return d_sel.source.genres.includes(d) && d_sel.target.genres.includes(d) ? 'visible' : 'hidden';
          		//return (circles.select(d_sel.source).attr('visibility') == 'visible' && circles.select(d_sel.target).attr('visibility') == 'visible') ? 'visible' : 'hidden';
          });


	});


	// Selects and de-selects an artist and all linked nodes if their checkbox is toggled
	// 1. See if this artist should appear or not
	// 2. Find this artist's node and hide/show it, update array of hidden artists
	// 3. Find all links to or from this artist, show or hide them accordingly
	aboxes.on("click", function(d) {

		var ch = $(this).prop('checked'); // Is this artist's box checked?
		var circles = d3.selectAll(".nodes>g");
		
		// Select the node with same primary key(artist name), update hidden array accordingly
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

		// Select all lines that are NOT hidden, and are attached to our artist
		d3.selectAll(".links>line").filter(function(link_d) {
            return (link_d.source.id == d.id && !hidden.includes(link_d.target.id)) 
            || (link_d.target.id == d.id && !hidden.includes(link_d.source.id));
          }).style("visibility", function(d_sel) {
          		return ch ? 'visible' : 'hidden';
          });
		
	});
	
	/*
	// This is currently experimental
	gboxes.on("click", function(d) {
		var ch = $(this).prop('checked');
		var circles = d3.selectAll(".nodes>g");
	
		circles.select(function(i) {
			if(i.genres.every(e => hidden.includes(e)) && i.genres.includes(d)) return this;
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
*/




}