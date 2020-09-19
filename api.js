window.numTags = 10;
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

      
      
      


      if(accessToken) {
        service = "Spotify";
        getData();
      } else {
        document.cookie = null;
      }

      $('#genbtn').click(function() {
        document.cookie = $('#userNum').val();
        getData();
      });
      
      

  function getData() {
        $('#genbtn').attr("disabled", "true");
        $('#progresscontainer').show(); // Show progress bar
      
       
        if(window.firstClick) {
            window.firstClick = false;
        }


        const userTxt = $('#userTxt').val();
        const userNum = document.cookie;


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
                var linked = new Array();
                current = data1.artists.artist[i].name;
                if(current) {
                  $.when(ajax2(current)).done(function(data2) {
                  var arr = new Array();
                  if(data2.toptags) {
                        for(var j = 0; j < window.numTags; j++) { // TODO maybe replace with more?
                          if(data2.toptags.tag[j]) arr[j] = data2.toptags.tag[j].name.toLowerCase();
                        }
                  }
                window.artistData.nodes.push({
                "id" : current,
                "genres": arr,
                "linked": linked,
                "group" : 1
              });
                  });
                }

              var progress = ((i / (window.numArtists-1)) * 100).toFixed(2);
              $('#progress').css('width', progress + "%").html(progress + "%"); // Update progress bar

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

            //If we've reached this part of the code, it means an access token has been granted
            $('#userNum').val(userNum);
            document.getElementById("sbtn").checked = true; // Check the spotify radio dial for consistency

            $.when(spotifyAjax(accessToken, userNum % 50)).done(function(data) {
              window.numArtists = data.total; // correctly sets
              for(var i=0; i<window.numArtists;i++) {
                var linked = new Array();
                current = data.items[i];
                if(current) {
                window.artistData.nodes.push({
                  "id" : current.name,
                  "genres": current.genres,
                  "linked": linked,
                  "group" : 1
                });
              }
                var progress = ((i / (window.numArtists-1)) * 100).toFixed(2);
                $('#progress').css('width', progress + "%").html(progress + "%"); // Update progress bar

              }
            });
          
        } else {
          alert("you must select one service to search by");
        }



          for(var i=0;i<window.numArtists;i++) { // Literally check everything against everything
            var artist1 = window.artistData.nodes[i];
            for(var j=i+1;j<window.numArtists;j++) {
              var artist2 = window.artistData.nodes[j];
              var commonTags = getCommonTagNum(artist1.genres, artist2.genres);
              
              if(commonTags > 0) {
                window.artistData.links.push({
                  "source" : artist1.id,
                  "target" : artist2.id,
                  "value" : commonTags
                });
                window.artistData.nodes[i].linked.push(artist2.id + "," + commonTags);
                window.artistData.nodes[j].linked.push(artist1.id + "," + commonTags);
              }
            }
          

          }
       $('#progresscontainer').hide(); // Hide progress bar
      genGraph();
    }
});

/*
  Returns the NUMBER of common tags between any two given artists
*/
function getCommonTagNum(artist1, artist2) {
  if(artist1 && artist2) {
    var len = artist1.filter(value => artist2.includes(value)).length;
    if(len) {
      return len;
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
  console.log("token " + accessToken);
  console.log("limit " + limit);
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