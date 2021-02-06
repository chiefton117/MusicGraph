window.numTags = 10;
window.firstClick = true;

window.rGenres = {};
window.numArtists;
window.genres = [];
window.artistData = {
    nodes: [],
    links: []
  };

$(document).ready(function() {

      
      var service;
      const hash = window.location.hash // Attempt to locate the token from spotify, if it exists
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


      // This function will create our global artist, link and genre data in three general steps:
      // 0. Authenticate the user for their preferred service(Spotify involves a sign-in and redirect)
      // 1. Batch call to the given API to get artist data
      //  1a. For Last.FM, multiple unique API calls are required for the artist and their genres respectively
      //  1b. For Spotify, multiple API calls are required, as there is a limit of 50 with an offset
      // 2. Create links by iterating over every artist and returning a link if their common genres > 0
      function getData() {




        if(window.firstClick) {
            window.firstClick = false;
        }

        const userTxt = $('#userTxt').val();
        var cookielen = document.cookie.split(" ").length-1; // If a cookie is set, get the length of its arguments
        const userNum = parseInt(document.cookie.split(" ")[cookielen]); // We only need the integer at the end


        var current;

        function btnLoop() { // Loop until one radio button is selcted
          if(!service) {
          service = $("input[name='serviceBtn']:checked").val();

          setTimeout(btnLoop, 500);
          }
        }
        btnLoop();
        $('#genbtn').attr("disabled", "true");
        $('#progresscontainer').show(); // Show progress bar

        if(service == "Last.fm") { // SERVICES FOR LAST FM

              $.when(fmArtists(userTxt, userNum)).done(function(data1) {
              window.numArtists = data1.artists.artist.length;
              for(var i = 0; i < window.numArtists; i++) { // Initialize each artist with name and empty array
                var linked = new Array();
                current = data1.artists.artist[i].name;
                if(current) {
                  $.when(fmATopTags(current)).done(function(data2) { // Embedded ajax call for quicker storage
                  var arr = new Array();
                  if(data2.toptags) {
                        for(var j = 0; j < window.numTags; j++) { // Set to 10 default to prevent aggressive linking
                          if(data2.toptags.tag[j]) arr[j] = data2.toptags.tag[j].name.toLowerCase();
                        }
                  }
                window.artistData.nodes.push({
                "id" : current,
                "genres": arr,
                "linked": linked,
                "plays": data1.artists.artist[i].playcount,
                "group" : 1
              });
                  });
                }

              var progress = ((i / (window.numArtists-1)) * 100).toFixed(2);
              $('#progress').css('width', progress + "%").html(progress + "%"); // Update progress bar

              }
          });
        } else if(service == "Spotify") { // SERVICES FOR SPOTIFY
        
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
            if(!window.numArtists) {
                  window.numArtists = 0;
                }

            var looping = true;
            while(looping) {
              $.when(spotifyAjax(accessToken, 50, window.numArtists)).done(function(data) {
                console.log(data.total);

                window.numArtists = window.numArtists + data.total; // correctly sets artists for loop
                for(var i=0; i<data.total;i++) {
                  var linked = new Array();
                  current = data.items[i];
                  if(current) {
                  window.artistData.nodes.push({
                    "id" : current.name,
                    "genres": current.genres,
                    "linked": linked,
                    "plays": current.playcount,
                    "group" : 1
                  });
                }
                  var progress = ((i / (window.numArtists-1)) * 100).toFixed(2);
                  $('#progress').css('width', progress + "%").html(progress + "%"); // Update progress bar

                }
              if(data.total < 50) looping = false;
              });

            }

        } else {
          alert("you must select one service to search by");
        }



          for(var i=0;i<window.numArtists;i++) { // Literally check everything against everything
            var artist1 = window.artistData.nodes[i];

            window.genres = window.genres.concat(artist1.genres.filter(value => !window.genres.includes(value))); // Add unique values to genres

            for(var j=i+1;j<window.numArtists;j++) { // Unfortunate 2d for loop to create links
              var artist2 = window.artistData.nodes[j];
              var commonTags = getCommonTagNum(artist1.genres, artist2.genres);
              
              if(commonTags > 2) {
                window.artistData.links.push({
                  "source" : artist1.id,
                  "target" : artist2.id,
                  "value" : commonTags
                });
                //window.artistData.nodes[i].linked.push(artist2.id + "," + commonTags);
                //window.artistData.nodes[j].linked.push(artist1.id + "," + commonTags);
                window.artistData.nodes[i].linked.push(artist2.id);
                window.artistData.nodes[j].linked.push(artist1.id);
              }
            }
          }


       $('#progresscontainer').hide(); // Hide progress bar
      window.genres.sort(); // sort all genres alphabetically
      genGraph();
      genControls();
      genStats();

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
function fmArtists(username, limit) {
  return $.ajax({
        dataType: 'json',
        async: false,
        url: 'http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=943bdddf5707846447a81b95edae1537&user=' + username + '&limit=' + limit + '&format=json'
      });
}
/*
  Returns the Last.Fm JSON call for tags for a given artist
*/
function fmATopTags(name) {
  return $.ajax({
        dataType: 'json',
        async: false,
        url: "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=" + name + "&api_key=943bdddf5707846447a81b95edae1537&format=json"
      });
}
/* 
  Returns the Last.Fm JSON call for a user's top tags, the limit of which should be the same as the amount of artists queried * window.numTags limit
*/
function fmUTopTags(username, limit) {
  return $.ajax({
        dataType: 'json',
        async: false,
        url: "http://ws.audioscrobbler.com/2.0/?method=user.gettoptags&user=" + username + "&api_key=943bdddf5707846447a81b95edae1537&format=json"
      });
} 
function spotifyAjax(accessToken, limit, offset) {
  return $.ajax({
   url: 'https://api.spotify.com/v1/me/top/artists/?limit=' + limit + '&offset=' + offset,
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