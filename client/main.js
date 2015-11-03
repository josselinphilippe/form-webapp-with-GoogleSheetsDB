// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = 'client_id';

var SCRIPT_ID = 'script_id';

var SCOPES = ['https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/userinfo.email'
];

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES,
        'immediate': true
    }, handleAuthResult);
}


function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    var loadDiv = document.getElementById('loading');
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        authorizeDiv.style.display = 'none';
        loadDiv.style.display = 'block';
        callScriptFunction();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        authorizeDiv.style.display = 'inline';
    }
}


function handleAuthClick(event) {
    gapi.auth.authorize({
            client_id: CLIENT_ID,
            scope: SCOPES,
            immediate: false
        },
        handleAuthResult);
    return false;
}


function callScriptFunction() {

    // Create an execution request object.
    var request = {
        'function': 'getData'
    };

    // Make the API request.
    var op = gapi.client.request({
        'root': 'https://script.googleapis.com',
        'path': 'v1/scripts/' + SCRIPT_ID + ':run',
        'method': 'POST',
        'body': request
    });

    op.execute(function(resp) {
        handleGetDataResponse(resp);
    });
}


function handleGetDataResponse(resp) {
    if (resp.error && resp.error.status) {
        // The API encountered a problem before the script
        // started executing.
        console.log('Error calling API:');
        console.log(JSON.stringify(resp, null, 2));
    } else if (resp.error) {
        // The API executed, but the script returned an error.
        // Extract the first (and only) set of error details.
        // The values of this object are the script's 'errorMessage' and
        // 'errorType', and an array of stack trace elements.
        var error = resp.error.details[0];
        console.log('Script error message: ' + error.errorMessage);
        if (error.scriptStackTraceElements) {
            // There may not be a stacktrace if the script didn't start
            // executing.
            console.log('Script error stacktrace:');
            for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                var trace = error.scriptStackTraceElements[i];
                console.log('\t' + trace.function+':' + trace.lineNumber);
            }
        }
    } else {

        var inspections = resp.response.result.inspections;
        if (Object.keys(inspections).length == 0) {
            alert("nothing here");
        } else {
            var loadDiv = document.getElementById('loading');
            loadDiv.style.display = 'none';
        }
    }
}


jQuery(document).ready(function($) {

    $('#inspection-form').find("input, select, button, textarea").prop("disabled", false);
    $("#inspection-form").submit(function(event) {
        $form = $('#inspection-form');
        var $inputs = $form.find("search, input, select, button, textarea");
        // serialize the data in the form
        var serializedData = getValues();
        // Create an execution request object.
        // Create execution request.
        var request = {
            'function': 'setData',
            'parameters': serializedData,
            'devMode': true // Optional.
        };

        // Make the API request.
        var op = gapi.client.request({
            'root': 'https://script.googleapis.com',
            'path': 'v1/scripts/' + SCRIPT_ID + ':run',
            'method': 'POST',
            'body': request
        });
        op.execute(function(resp) {
            handleGetDataResponse(resp);
        });
        // prevent default posting of form
        event.preventDefault();
        resetForm();
    });
});



//calculate Haversine dist between user and citibike stations
//http://www.movable-type.co.uk/scripts/latlong.html
function calcDist(lat1, lon1, lat2, lon2) {
    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    }
    R = 6371000; // mean radius of the earth in meters
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;

    return d = R * 2 * Math.asin(Math.sqrt(a));
}



//determine if inspection types return True or False
function isEmpty(object) {
    for (var i in object) {
        return true;
    }
    return false;
}

//this function is called when user clicks form submit
//values are passed to server function that handles post to google sheet

function getValues() {
    //this.disabled = true;
    //build response objects to feed Bool values
    var rprObjects = {},
        blkObjects = {},
        unblkObjects = {},
        invObjects = {};

    var masterObj = {};

    //get form by id
    var form = $('#inspection-form');

    //get form inputs
    var inputs = form.find("input, select, button, textarea");

    //get cs-num-input and station name from number and text inputs

    var stationName = $("#station-search").val();
    var csNumber = $('#cs-num-input').val();

    //get bool values from checkboxes
    var checkBoxes = $("form input:checkbox");

    //if any of the inspection types have checked values return TRUE for that inspection type
    for (var i = 0; i < checkBoxes.length; i++) {
        var checkBox = $(checkBoxes[i]);
        var checkClass = checkBox.attr('class');


        //console.log(checkBoxes).attr('id');

        if (checkBox.prop('checked')) {
            console.log(checkClass);


            var key = checkBox.attr('id');
            var val = checkBox.prop('checked');

            if (checkClass === 'rpr' && checkBox.prop('checked')) {
                rprObjects[key] = val;
            }
            if (checkClass === 'blk' && checkBox.prop('checked')) {
                blkObjects[key] = val;
            }
            if (checkClass === 'unblk' && checkBox.prop('checked')) {
                unblkObjects[key] = val;
            }
            if (checkClass === 'inv' && checkBox.prop('checked')) {
                invObjects[key] = val;
            }
        }
    }

    masterObj = {
            "cs_number": csNumber,
            "station_name": stationName,
            "repair": isEmpty(rprObjects),
            "block": isEmpty(blkObjects),
            "unblock": isEmpty(unblkObjects),
            "inventory": isEmpty(invObjects),
            "repair_info": rprObjects,
            "block_info": blkObjects,
            "unblock_info": unblkObjects,
            "inventory_info": invObjects
        }
        //        console.log(masterObj);
    return masterObj;
}


function resetForm() {
    $('#inspection-form')[0].reset();
    $('#station-search').val('');
    $('#cs-num-input').focus(); //this causes native keyboard trigger, not ideal



    var container = $("fieldset#collapseContainer");
    var collapsedElements = $("fieldset");

    console.log(collapsedElements);
    console.log("container:", container);

}

//browser geolocation with HTML5
var getPosition = function(options) {
    var deferred = $.Deferred();

    navigator.geolocation.getCurrentPosition(
        deferred.resolve,
        deferred.reject,
        options);

    return deferred.promise();
};


//position coordinates
var getUserCoords = function(position) {
    var deferred = $.Deferred();
    if (position.coords.latitude) {
        var latlon = [position.coords.latitude, position.coords.longitude];
        deferred.resolve(latlon);

    }
    return deferred.promise();
};



//calculate distance between all stations and user
//build array of station objects from stations spreadsheet
//append distance {property : val} to stations object
//push to array and sort array by distance from user
//return for use on client side search input

var updateStations = function(coords, status) {


    $.getJSON("data/citibike_stations.json", function(data, error) {

        var stationsArray = [];

        for (var i = 0; i < data.length; i++) {
            var stationObj = {};

            stationObj["station"] = data[i]["Name"];
            lat = data[i]["Latitude"];
            lon = data[i]["Longitude"];
            distance = calcDist(coords[0], coords[1], lat, lon);
            stationObj["dist"] = distance;
            stationsArray.push(stationObj);
        }

        stationsArray.sort(function(a, b) {
            return a.dist - b.dist;
        });


        updateStationsList(stationsArray);

    })
}

//function bound to click event on dynamic list of stations
//when user clicks on station, the value of that clicked item is appended to the search input
function selectStation(el) {

    var txt = $(el).text();

    var inputEl = $("#station-search").val(txt);

    var listview = $("#stations-listview");
    $("#stations-listview").listview("refresh"); //this displays the only autocomplete suggestion to matching txt
}



var updateStationsList = function(stationsArr) {

    for (var i = 0; i < stationsArr.length; i++) {
        var stationName = stationsArr[i].station;
        //            if(i>4){
        $('<li class="station-item" data-id=' + i + ' onclick="selectStation(this);">').append('<a href="#">' + stationName + '</a>').appendTo('#stations-listview');
    }
    $('#stations-listview').listview().listview('refresh');


}
//    need to append selected li value to input search, let listview work itself out with "refresh"
//    to do this, give id to dynamic input search element to resolve delay in element load and permit event binding
$(document).on("filterablecreate", function(event, ui) {
    //give search input id attr and make it required
    var newId = "station-search",
        listview = $(event.target);
    
    listview.prev("form").find("input").prop("id", newId).prop("required", "required");

    var searchInput = listview.prev("form").find("input"),
        result = $("station-search");

    //when user focuses on station input...
    $("#station-search").focus(function() {

        //filter the suggested list to the closest five stations and only show those items
        $(".station-item").filter(function() {
            return $(this).attr("data-id") < 5;
        }).removeClass("ui-screen-hidden");
    });


    listview.listview("refresh");
});



//chain events with deferred object
$(function() {
    console.log("begin chain functions");


    $.when(getPosition())
        .then(getUserCoords)
        .then(updateStations)
        .done(function() {
        console.log("done chaining functions");
        });
});