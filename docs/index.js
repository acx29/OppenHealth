let username;
let password;
let repeatPassword;

import { createClient } from '@supabase/supabase-js'; // ok we added the url and key from my supabase project below
const supabase = createClient('https://cseushjckimnurbnuxcy.supabase.co', 'sb_publishable_Xj0uKhbrEbdSJSkIynNXpg_xD9hntDu');


document.getElementById("mySubmit").onclick = function(){
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;
    repeatPassword = document.getElementById("repeat-password").value;

    console.log(username);
    console.log(password);
    console.log(repeatPassword); 
}

