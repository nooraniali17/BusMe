function initPage() {
  //LEARNING HOW TO GET
  const Url = "http://3d13fbc4.ngrok.io/";
  const payLoad = {
    headers: {
      "Content-Type": "application/json"
    },
    method: "GET"
  };
  //part of the js api
  fetch(Url, payLoad)
    .then(data => data.json())
    .then(res => {
      console.log(res);
      //GOING THROUGH DATABASE AND MAKING HASHMAP
      const myMap = new Map();
      let index = 0;
      let value = 0;
      for (index = 0; index < res.length; index++) {
        if (!myMap.has(res[index].stop_name)) {
          myMap.set(res[index].stop_name, res[index].num_pass);
        } else {
          value = myMap.get(res[index].stop_name);
          value = value + res[index].num_pass;
          myMap.set(res[index].stop_name, value);
        }
      }
      console.log(myMap);
      generateTable(myMap);
      //   generate_table();
    })
    .catch(error => console.log(error));
}

function reloadPage(event) {
  location.reload();
}

function generateTable(myMap) {
  // grabs body tag and saves in body variable
  let body = document.getElementsByTagName("body")[0];
  let tbl = document.createElement("table");
  let tblBody = document.createElement("tbody");
  let i = 0;
  let j = 0;
  let cellText;
  let mapIter = myMap.entries();
  let hashMapEntry = mapIter.next().value;

  // creating the cells below
  for (i = 0; i < myMap.size; i++) {
    // creates the correct number of rows from the number
    // of rows in our HashMap
    let row = document.createElement("tr");
    for (j = 0; j < 2; j++) {
      let cell = document.createElement("td");
      if (j == 0) {
        cellText = document.createTextNode(hashMapEntry[j]);
      } else {
        cellText = document.createTextNode(hashMapEntry[j]);
      }
      cell.append(cellText);
      row.appendChild(cell);
    }
    tblBody.appendChild(row);
    hashMapEntry = mapIter.next().value;
  }

  tbl.appendChild(tblBody);
  body.appendChild(tbl);
  tbl.setAttribute("border", "2");
}

window.onload = initPage;
