const numTags = 5; // Number of associated tags stored with an artist
window.firstClick = true;
window.numArtists;
window.artistData = {
    nodes: [],
    links: []
  };

$(document).ready(function() {


      var service;
      const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce(function (initial, item) {
        if (item) {
          var parts = item.split('=');
          initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
      }, {});
      window.location.hash = '';
      
      // Set token
      let accessToken = hash.access_token;


      $('#genbtn').click(getData);
      if(accessToken) {
        service = "Spotify";
        getData();
      }

function getData() {

     
      if(window.firstClick) {
          window.firstClick = false;
      }

      var userTxt = $('#userTxt').val();
      var userNum = $('#userNum').val();

      var current;



      function btnLoop() { // Loop until one radio button is selcted
        if(!service) {
        service = $("input[name='serviceBtn']:checked").val();

        setTimeout(btnLoop, 500);
        }
      }
      btnLoop();
      if(service == "Last.fm") {
        

          $.when(ajax1(userTxt, userNum)).done(function(data1){
          window.numArtists = data1.artists.artist.length;
          for(var i = 0; i < window.numArtists; i++) { // Initialize each artist with name and empty array
            current = data1.artists.artist[i].name;
            if(current) {
              $.when(ajax2(current)).done(function(data2) {
              var arr = new Array();
              if(data2.toptags) {
                    for(var j = 0; j < numTags; j++) {
                      if(data2.toptags.tag[j]) arr[j] = data2.toptags.tag[j].name;
                    }
              }
            window.artistData.nodes.push({
            "id" : current,
            "genres": arr,
            "group" : 1
          });
              });
            }
          }
        });
  


      } else if(service == "Spotify") {
      
      const scopes = [
        'user-top-read'
      ];
      const authEndpoint = 'https://accounts.spotify.com/authorize';


      if (!accessToken) {
        window.location = `${authEndpoint}?client_id=${window.client_id}&redirect_uri=${window.redirect_uri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
        return;
      }
      document.getElementById("sbtn").checked = true; // Check the spotify radio dial for consistency

      $.when(spotifyAjax(accessToken, userNum % 50)).done(function(data) {
        window.numArtists = data.total; // correctly sets
        for(var i=0; i<data.total;i++) {
          current = data.items[i];
          window.artistData.nodes.push({
            "id" : current.name,
            "genres": current.genres,
            "group" : 1
          });
        }
      });
        
      } else {
        alert("you must select one service to search by");
      }

        for(var i=0;i<window.numArtists;i++) { // Literally check everything against everything
          var artist1 = window.artistData.nodes[i];
          for(var j=i+1;j<numArtists;j++) {
            var artist2 = window.artistData.nodes[j];
          var commonTags = getCommonTagNum(artist1.genres, artist2.genres);
            if(commonTags > 0) {
              window.artistData.links.push({
                "source" : artist1.id,
                "target" : artist2.id,
                "value" : commonTags
              });
            }
          }
        }
     

      for(var i=0;i<window.numArtists;i++) { // Create list on side of page
        var artist = window.artistData.nodes[i];
        var button = document.createElement("button");
        button.setAttribute("data-toggle", "collapse");
        button.setAttribute("data-target", "#artist" + i);
        button.innerHTML = artist.id;

        var element = document.createElement("div");
        element.setAttribute("class", "collapse");
        element.setAttribute("id", "artist" + i);
        var tags = document.createElement("p");
        tags.setAttribute("id", "tags" + i);
        tags.innerHTML = artist.genres;

        element.appendChild(tags);
        var sidelist = document.getElementById("sidelist");

        sidelist.appendChild(element);
        sidelist.appendChild(button);

      }



      console.log(window.artistData);
      //Begin generation of graph itself
      var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

      var color = d3.scaleOrdinal(d3.schemeCategory20);

      var simulation = d3.forceSimulation()
          .force("link", d3.forceLink().id(function(d) { return d.id; }).strength(function(d) {return (d.value / 500)})) // Strength is common tags / 100
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2));

        var g = svg.append("g")
            .attr("class", "everything");
        
        var link = g.append("g")
            .attr("class", "links")
          .selectAll("line")
          .data(window.artistData.links)
          .enter().append("line")
            .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = g.append("g")
            .attr("class", "nodes")
          .selectAll("g")
          .data(window.artistData.nodes)
          .enter().append("g");
        

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
          g.attr("transform", d3.event.transform)
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
});


/*
  Returns the NUMBER of common tags between any two given artists
*/
function getCommonTagNum(artist1, artist2) {
  if(artist1 && artist2) {
    var len = artist1.filter(value => artist2.includes(value)).length;
    if(len) {
      return len-1;
    } else return 0;
  }
}
/*
  Returns the common tags between any two given artists
*/
function getCommonTags(artist1, artist2) {
  if(artist1 && artist2) {
    return artist1.filter(value => artist2.includes(value));
  }
  return null;
}
/*
  Returns the Last.Fm JSON call for artists for a given user
*/
function ajax1(username, limit) {
  return $.ajax({
        dataType: 'json',
        async: false,
        url: 'http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=943bdddf5707846447a81b95edae1537&user=' + username + '&limit=' + limit + '&format=json'
      });
}
/*
  Returns the Last.Fm JSON call for tags for a given artist
*/
function ajax2(name) {
  return $.ajax({
        dataType: 'json',
        async: false,
        url: "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=" + name + "&api_key=943bdddf5707846447a81b95edae1537&format=json"
      });
}
function spotifyAjax(accessToken, limit) {
  return $.ajax({
   url: 'https://api.spotify.com/v1/me/top/artists/?limit=' + limit,
   async: false,
   type: "GET",
   headers: {
       'Authorization': 'Bearer ' + accessToken
   }
   //success: function(response) {
   //    return response;
   //}
});
}