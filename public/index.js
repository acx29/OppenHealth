
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
      if (!res.ok) {
        alert(data.message || data.error_description || JSON.stringify(data));
        return;
    }

    console.log("Signup successful: ", data);
    
    // redirects user:
    window.location.href = "/dashboard";
}


