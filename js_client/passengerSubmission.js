
function initPage() {
    let url = new URL(window.location);
    let finalNumInParty = url.searchParams.get('numInParty');
    let finalLat = url.searchParams.get('lat');
    let finalLng = url.searchParams.get('lng');

    console.log(finalNumInParty);
    console.log(finalLat);
    console.log(finalLng);
    
    document.getElementById("passengersInPartyLabel").innerHTML = finalNumInParty;
}


window.onload = initPage;