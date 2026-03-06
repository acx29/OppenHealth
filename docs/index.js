let username;
let password;
let repeatPassword;

document.getElementById("mySubmit").onclick = function(){
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;
    repeatPassword = document.getElementById("repeat-password").value;

    console.log(username);
    console.log(password);
    console.log(repeatPassword); 
}

