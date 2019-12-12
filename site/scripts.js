$(function() {
    const $signupForm = $('#vsignup');
    const $loginForm = $('#vlogin');
    const $newCustomer = $('#newCustomer');
    const venues = getVenues();

    // $('#searchbar').autocomplete({
    //     source: venues
    // });

    $signupForm.submit((e) => { // submit signup form
        e.preventDefault();
        const data = $signupForm.serializeArray().reduce((o, x) => {
            o[x.name] = x.value;
            return o;
        }, {});
        createAccount(data.uname, data.pass, data.vname, data.desc);
    });

    $loginForm.submit((e) => { // submit login form
        e.preventDefault();
        const data = $loginForm.serializeArray().reduce((o, x) => {
            o[x.name] = x.value;
            return o;
        }, {});
        login(data.uname, data.pass);
        redirect();
    });

    $newCustomer.submit((e) => {
        e.preventDefault();
        const name = $('newCustomerName').val();
        addToQueue(name, venue); // TODO: venue
    });
    
});

async function addToQueue(name, venue) {
    try {
        const response = await axios({
            method: "post",
            url: "http://localhost:3000/addQueue",
            withCredentials: true,
            data: {
                customerName: name,
                venueName: venue
            },
        });
    } catch(e) {
        alert(e);
    }
}

async function getVenues() {
    try {
        const response = await axios({
            method: "get",
            url: "http://localhost:3000/venues",
        });
        const venues = response.data;
        return venues;
    } catch(e) {
        console.log(e);
    }
}

function randomString() {
    return Math.random().toString(36).slice(2);
}

async function redirect() {
    try {
        const response = await axios({
            method: "get",
            url: "http://localhost:3000/private/manage",
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
        });
        window.location.href = "http://localhost:3000/manage";
    } catch(e) {
        console.log(e);
        // not logged in
    }
}

async function login(username, password) { // send login request, set cookie
    try {
        const response = await axios({
            method: "post",
            url: "http://localhost:3000/account/login",
            withCredentials: true,
            data: {
                name: username,
                pass: password,
            },
        });
        setCookie("vid", response.data.data.vid);
        localStorage.setItem('jwt', response.data.jwt);
    } catch(e) {
        alert(e);
    }
}

function setCookie(name, value) {
    let d = new Date();
    d.setTime(d.getTime() + (7*24*60*60*1000)); // expires after 7 days
    let expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name) {
    var name = name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

const createAccount = async function (username, password, venue, desc) {
    try {
        const response = await axios({
            method: "post",
            url: "http://localhost:3000/account/create",
            withCredentials: true,
            data: {
                name: username,
                pass: password,
                data: {
                    vid: randomString(), //gen token
                    venue: venue,
                    description: desc
                }
            },
        });
        login(username, password);
    } catch(e) {
        alert(e);
    }
}

async function manageInfo(){
    let vid = getCookie("vid");
    if (vid == '') {
        window.location.href = "http://localhost:3000/vlogin"
    }
    
    // implement fetch queue backend
    const response = await axios({
        method: "get",
        url: "http://localhost:3000/private/manage",
        withCredentials: true,
        headers: {
            vid: vid,
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
        },
    });

    let queue = response.data;
    let list = document.getElementById('queue');
    list.innerHTML = '';
    for(let i=0; i<queue.length; i++){
        list.innerHTML += "<li>" + queue[i] + "</li>";
    }
}

async function openTable() {
    let vid = getCookie("vid");
    const first = $('#queue li').first().remove(); // remove first li

    const getresponse = await axios({
        method: "get",
        url: "http://localhost:3000/private/manage",
        withCredentials: true,
        headers: {
            vid: vid,
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
        },
    });

    let queue = getresponse.data; 
    queue.shift();                  // Delete first item in list
    const postresponse = await axios({
        method: "post",
        url: "http://localhost:3000/private/manage",
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
        },
        data: {
            vid: vid,
            queue: queue
        }
    });
    manageInfo();
}

function logout() {
    localStorage.setItem('jwt', 0);
    document.cookie = `vid=0;expires = Thu, 01 Jan 1970 00:00:00 GMT";path=/`;
    window.location.href = "/";
}

// function autocomplete(inp) {
//     /*the autocomplete function takes two arguments,
//     the text field element and an array of possible autocompleted values:*/
//     let arr = getVenues();
//     let currentFocus;
//     /*execute a function when someone writes in the text field:*/
//     inp.addEventListener("input", function(e) {
//         let a, b, i, val = this.value;
//         /*close any already open lists of autocompleted values*/
//         closeAllLists();
//         if (!val) { return false;}
//         currentFocus = -1;
//         /*create a DIV element that will contain the items (values):*/
//         a = document.createElement("DIV");
//         a.setAttribute("id", this.id + "autocomplete-list");
//         a.setAttribute("class", "autocomplete-items");
//         /*append the DIV element as a child of the autocomplete container:*/
//         this.parentNode.appendChild(a);
//         /*for each item in the array...*/
//         for (i = 0; i < arr.length; i++) {
//           /*check if the item starts with the same letters as the text field value:*/
//           if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
//             /*create a DIV element for each matching element:*/
//             b = document.createElement("DIV");
//             /*make the matching letters bold:*/
//             b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
//             b.innerHTML += arr[i].substr(val.length);
//             /*insert a input field that will hold the current array item's value:*/
//             b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
//             /*execute a function when someone clicks on the item value (DIV element):*/
//                 b.addEventListener("click", function(e) {
//                 /*insert the value for the autocomplete text field:*/
//                 inp.value = this.getElementsByTagName("input")[0].value;
//                 /*close the list of autocompleted values,
//                 (or any other open lists of autocompleted values:*/
//                 closeAllLists();
//             });
//             a.appendChild(b);
//           }
//         }
//     });
//     /*execute a function presses a key on the keyboard:*/
//     inp.addEventListener("keydown", function(e) {
//         let x = document.getElementById(this.id + "autocomplete-list");
//         if (x) x = x.getElementsByTagName("div");
//         if (e.keyCode == 40) {
//           /*If the arrow DOWN key is pressed,
//           increase the currentFocus variable:*/
//           currentFocus++;
//           /*and and make the current item more visible:*/
//           addActive(x);
//         } else if (e.keyCode == 38) { //up
//           /*If the arrow UP key is pressed,
//           decrease the currentFocus variable:*/
//           currentFocus--;
//           /*and and make the current item more visible:*/
//           addActive(x);
//         } else if (e.keyCode == 13) {
//           /*If the ENTER key is pressed, prevent the form from being submitted,*/
//           e.preventDefault();
//           if (currentFocus > -1) {
//             /*and simulate a click on the "active" item:*/
//             if (x) x[currentFocus].click();
//           }
//         }
//     });
//     function addActive(x) {
//       /*a function to classify an item as "active":*/
//       if (!x) return false;
//       /*start by removing the "active" class on all items:*/
//       removeActive(x);
//       if (currentFocus >= x.length) currentFocus = 0;
//       if (currentFocus < 0) currentFocus = (x.length - 1);
//       /*add class "autocomplete-active":*/
//       x[currentFocus].classList.add("autocomplete-active");
//     }
//     function removeActive(x) {
//       /*a function to remove the "active" class from all autocomplete items:*/
//       for (let i = 0; i < x.length; i++) {
//         x[i].classList.remove("autocomplete-active");
//       }
//     }
//     function closeAllLists(elmnt) {
//       /*close all autocomplete lists in the document,
//       except the one passed as an argument:*/
//       let x = document.getElementsByClassName("autocomplete-items");
//       for (let i = 0; i < x.length; i++) {
//         if (elmnt != x[i] && elmnt != inp) {
//         x[i].parentNode.removeChild(x[i]);
//       }
//     }
//   }
//   /*execute a function when someone clicks in the document:*/
//   document.addEventListener("click", function (e) {
//       closeAllLists(e.target);
//   });
// }


