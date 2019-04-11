
function initPage() {
    //Starting out URL:
    //file:///Users/alinoorani/Desktop/BusMe/js_client/passengerSubmission.html?numInParty=2?lat=38.0211715?lng=-121.3510804
    urlString= window.location.href.split("?");

    //After split url is:
    //file:///Users/alinoorani/Desktop/BusMe/js_client/passengerSubmission.html,numInParty=2,lat=38.0211715,lng=-121.3510804
    console.log(urlString);

    //urlString is now an array with finalNumInParty at index 1
    let finalNumInParty = urlString[1].split('=').pop();
    let finalLat = urlString[2].split('=').pop();
    let finalLng = urlString[3].split('=').pop();

    document.getElementById("passengersInPartyLabel").innerHTML = finalNumInParty;
}


window.onload = initPage;