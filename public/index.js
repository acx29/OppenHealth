document.getElementById("mySubmit").onclick = async function(){ // sign up func
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let repeatPassword = document.getElementById("repeat-password").value;

    console.log(username);
    console.log(password);
    console.log(repeatPassword); 

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
    console.log(data);

}

async function signUp(username, password){
    const {data, error} = await supabase.auth.signUp({ // hashmap (2 key-value pairs), hence the { } notation
        email: username, 
        password: password
    })
}

