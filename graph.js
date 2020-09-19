
function genGraph() {
      console.log(window.artists);
      console.log(window.artistData);
      //Begin generation of graph itself
      var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

      var color = d3.scaleOrdinal(d3.schemeCategory20);

      var simulation = d3.forceSimulation()
          .force("link", d3.forceLink().id(function(d) { return d.id; }).strength(function(d) {return (d.value / 5000)})) // Strength is common tags / 100
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2));

        var g = svg.append("g")
            .attr("class", "everything");
        
        var link = g.append("g")
            .attr("class", "links")
          .selectAll("line")
          .data(window.artistData.links)
          .enter().append("line")
            .attr("stroke-width", 1);

        var node = g.append("g")
            .attr("class", "nodes")
          .selectAll("g")
          .data(window.artistData.nodes)
          .enter().append("g");

        node.on("click", function(d) { // SET ONCLICK FUNCTIONALITY For artist spotlight
          $("#spotlight").text(d.id);
          $("#taglist").text(d.genres.join("\n"));
          $("#linklist").text(d.linked.sort(function(a,b) { // Sort by # of common tags
            var f = parseInt(a.split(",")[1]);
            var s = parseInt(b.split(",")[1]);
            return s - f;
          }).join("\n"));
        });  
        

        var circles = node.append("circle")
            .attr("r", 5)
            .attr("fill", function(d) { return color(d.group); })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        var lables = node.append("text")
            .text(function(d) {
              return d.id;
            })
            .attr('x', 6)
            .attr('y', 3);

        node.append("title")
            .text(function(d) { return d.genres; });
        
        simulation
            .nodes(window.artistData.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(window.artistData.links);

        var radius = 15;
        node.attr("r", radius)


        var zoom_handler = d3.zoom()
            .on("zoom", zoomaction);

        zoom_handler(svg);

        function ticked() {
          link
              .attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });
          /*
          node
            .attr("transform", function(d) { return "translate(" + (d.x = Math.max(radius, Math.min(width - radius, d.x))) + "," + (d.y = Math.max(radius, Math.min(height - radius, d.y))) + ")";
             })
          */
          node
            .attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
        })  
        }

        function zoomaction() { //zoom functionality
          g.attr("transform", d3.event.transform);
        }


  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

}
