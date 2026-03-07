
document.getElementById("mySubmit").onclick = async function(){ // sign up func
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let repeatPassword = document.getElementById("repeat-password").value;

    if(password!==repeatPassword){
        alert("Passwords do not match.");
        return;
    }
    
    // fetch is an API call method, parameters define what type of API we need (post/rest)
    const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username, 
            password
        })
    });

    const data = await res.json();
    if(!res.ok){
        alert("Sign-up failed. Make sure you are using a complicated password and make sure passwords match.");
        console.log(data); // im assuming on inspect element u will be able to see data (ex. error 404)
        return;
    }

    console.log("Signup successful: ", data);
    
    // redirects user:
    window.location.href = "/dashboard";
}


