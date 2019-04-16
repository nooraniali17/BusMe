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
    })
    .catch(error => console.log(error));
}

function reloadPage(event) {
  location.reload();
}

window.onload = initPage;
