$(function() {
    const $signupForm = $('#vsignup');
    const $loginForm = $('#vlogin');

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
    });

    $('#search').submit((e) => {
        e.preventDefault();
        const venue = $('#searchbar').val();
        getCustomerPage(venue);
    });

    $('#newCustomer').submit((e) => {
        e.preventDefault();

        const name = $('#newCustomerName').val();
        let venue = window.location.href.slice(29);
        let pos = customerSubmit(name, venue);
        // console.log(pos);
        let queuePosition = $(`<div>You are in position 10!</div>`);
        $('#newCustomer').replaceWith(queuePosition);
    });
});

async function customerSubmit(name, venue) {
    try {
        const response = await axios({
            method: "post",
            url: `http://localhost:3000/submit`,
            data: {
                "name": name,
                "vid": venue
            }
        })
        return response.data.pos;
        
    } catch(e) {
        console.log(e);
    }
}

function autocomp() { // autocomplete search using jquery-ui api
    getVenues().then((resp) => {
        $('#searchbar').autocomplete({
            source: resp,
            delay: 250 // debouncing
        });
    });
}

function getCustomerPage(venue) {
    try {
        window.location.href = `http://localhost:3000/venues/${venue}`;
    } catch(e) {
        console.log(e);
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
        redirect();
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

async function createAccount(username, password, venue, desc) {
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
        alert("Error: Cannot create account");
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

async function next() {
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

function randomString() {
    return Math.random().toString(36).slice(2);
}

function logout() {
    localStorage.setItem('jwt', 0);
    document.cookie = `vid=0;expires = Thu, 01 Jan 1970 00:00:00 GMT";path=/`;
    window.location.href = "/";
}
