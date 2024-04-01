import react, { useState } from "react"
import "./home.css"
import logo from "../../assets/loginPageBanner.png"
import logo1 from "../../assets/icon.png"
import axios from "axios"

//import Playlist from "../playlist/playlist"

function Home() {


const [mail,setMail]=useState("")
const [password,setPasword]=useState("")


async function login() {
    try {
         await axios.post("https://app.cloudmedia.com.tr/api/auth/login", {
            email: mail,
            password: password
        }, {
            headers: {
                "Content-Type": "application/json",
            }
        }).then(response=>{
           
            if(response.data){

                
             window.electron.ipcRenderer.send("login-info", response?.data);
             window.location.reload()
            }
        });
      
    } catch (error) {
        console.error("Login error:", error);
    }
}




    return (
        <div className="home-container">
            <div className="home-logo">
                <img src={logo} alt="" srcset="" />
            </div>
            <div className="home-login">
                <div><img src={logo1} alt="" srcset="" /></div>
                <div>
                   <div>
                   <label> E-posta</label>
                    <input type="text" onChange={(e)=>setMail(e.target.value)} />
                   </div>
                   <div>
                   <label> Şifre</label>
                    <input type="password" onChange={(e)=>setPasword(e.target.value)}   />
                   </div>
                   <div>
                  <button type="button" onClick={login}>Giriş Yap</button>  
                
                   </div>
                </div>
            </div>
        </div>
    )
}


export default Home