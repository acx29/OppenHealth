// this is all one big function

document.getElementById("mySubmit").onclick = async function () {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    const res = await fetch("/api/login", {
        method: "POST", // REST CRUD API thingy
        headers: {
            "Content-Type" : "application/json" 
        },
        body: JSON.stringify({
            username,
            password,
        })      
    });

    const data = await res.json();

    if(!res.ok){
        alert(data.message || data.error_description || JSON.stringify(data)) // adding 3 possible diff alerts
        return;
    }

    console.log("Login succesful!", data);
    window.location.href = "/dashboard";

}