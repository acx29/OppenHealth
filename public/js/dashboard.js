// logic for redirecting user on dashboard html file

async function logoutUser(){
    await fetch("/api/logout", { // calling the logout route in authRoutes.js
        method: "POST",
        credentials: "include",
    });

    window.location.href = "/signIn.html";

}