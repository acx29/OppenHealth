// logic for redirecting user on dashboard html file

console.log("dashboard.js loaded"); // j to check if this loads

async function logoutUser(){
    await fetch("/api/logout", { // calling the logout route in authRoutes.js
        method: "POST",
        credentials: "include",
    });

    window.location.href = "/signIn.html";

}