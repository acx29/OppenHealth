// this is all one big function

document.getElementById("mySubmit").onclick = async function () {
    let email = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    const res = await fetch("/api/login", {
        method: "POST", // REST CRUD API thingy
        headers: {
            "Content-Type" : "application/json" 
        },
        body: JSON.stringify({
            email,
            password,
        })      
    });

    const data = await res.json();

    if(!res.ok){
        alert(data.message || data.error_description || JSON.stringify(data)) // adding 3 possible diff alerts
        return;
    }

    console.log("Login succesful!", data);
    window.location.href = "./dashboard";

}

document.getElementById("resendConfirmation").onclick = async function (e) {
    e.preventDefault(); // this makes sure that after clicking it doesn't j refresh w a new url that adds '#'
    let email = document.getElementById("username").value.trim();

    if(!email){
        alert("Please enter your email first.");
        return;
    }

    const res = await fetch("/api/resend-confirmation", { // we are calling the backend and storing it in a variable res
        method: "POST", // REST API and we are creating/triggering a new action (send confirmation email)
        headers: {
            "Content-Type": "application/json" // metadata about the HTTP request (in this case POST)
        },
        body: JSON.stringify({ email })
    });

    const data = await res.json();

    if(!res.ok){
        alert(data.message || data.error_description || JSON.stringify(data));
        return;
    }

    alert("Email confirmation resent.");

}