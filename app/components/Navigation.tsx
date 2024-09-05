import { useState, useRef } from "react";
import Home from "~/components/Home";

export default function Nav(apiUrl : any){
    const [toggleExpand, setToggleExpand] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [darkModeToggle, setDarkModeToggle] = useState("dark");
    const [sidebarClass, setSidebarClass] = useState("pt-3 w-28 bg-slate-100 dark:bg-slate-800 h-screen fixed rounded-none border-none transition-all duration-200 ease-in-out overflow-hidden text-center px-0 text-gray-500");
    const [sidebarStyle, setSidebarStyle] = useState({width: "4rem"});
    const textLeft = "text-left px-6 text-slate-100 dark:text-slate-800";
    const textCenter = "text-center px-0 text-gray-500" 

    const [mainContentStyle, setMainContentStyle] = useState({marginLeft: "4rem"});

    const labelClassInitial = "font-medium transition-all duration-200 opacity-0";
    const labelClassChanged = "font-medium transition-all duration-200 opacity-100";
    const [labelClass, setLabelClass] = useState(labelClassInitial);
    
    const sidebarBtn = "relative px-3 py-3 flex items-center space-x-4 justify-start text-gray-500 rounded-lg group";
    const sidebarBtnGradient = " bg-gradient-to-r from-cyan-400 to-cyan-500 text-white w-56 h-10 ml-0";
    const [sidebarHomeBtn, setSidebarHomeBtn] = useState(sidebarBtn);
    const [sidebarProfileBtn, setSidebarProfileBtn] = useState(sidebarBtn);
    const [sidebarLoginBtn, setSidebarLoginBtn] = useState(sidebarBtn);

    const expandSidebar = () => {
        setToggleExpand(!toggleExpand);

        if(toggleExpand === false){
            setSidebarStyle({width: '4rem'});
            setMainContentStyle({marginLeft:'4rem'});
            setSidebarClass(sidebarClass.replace(textLeft, textCenter));
            setLabelClass(labelClassInitial);
        } 
        else
        {
            setSidebarStyle({width: '16rem'});
            setMainContentStyle({marginLeft: '16rem'});
            setSidebarClass(sidebarClass.replace(textCenter, textLeft));
            setLabelClass(labelClassChanged);
        }
    }

    function highlightSidebarItem(text: string)
    {
        text === "home" ? setSidebarHomeBtn(sidebarHomeBtn.replace("text-gray-500", "") + sidebarBtnGradient) : setSidebarHomeBtn(sidebarBtn);
        text === "profile" ? setSidebarProfileBtn(sidebarProfileBtn.replace("text-gray-500", "") + sidebarBtnGradient) : setSidebarProfileBtn(sidebarBtn);
        text === "login" ? setSidebarLoginBtn(sidebarProfileBtn.replace("text-gray-500", "") + sidebarBtnGradient) : setSidebarLoginBtn(sidebarBtn);
    }

    const toggleDarkMode = () => {
        console.log("Dark mode now: "+darkMode);
        setDarkMode(darkMode => !darkMode);
        console.log("Dark mode after switch: "+darkMode);
        setDarkModeToggle(darkMode ? "dark" : "");
    }

    return (
        <>  
        <div className={darkModeToggle}>
            <nav className="bg-slate-100 dark:bg-slate-800 border-b border-gray-300 dark:border-gray-600">
                <div className="flex justify-between items-center px-6">
                    <button id="menu-button" onClick={expandSidebar}>
                        <i className="fas fa-bars text-cyan-500 text-lg"></i>
                    </button>
                    <div className="mx-auto">
                        <h1 className='text-5xl text-center font-medium text-black dark:text-white p-5'>Alignment Feed</h1>
                    </div>
                    <div className="space-x-4">
                        <button onClick={toggleDarkMode}>
                           {darkMode ? 
                            <i className="fa-solid fa-moon text-cyan-500 fa-lg"></i>
                            :
                            <i className="fa-regular fa-sun text-cyan-500 fa-lg"></i>
                           }
                        </button>
                    </div>
                </div>
            </nav>

            <div id="sidebar" className={sidebarClass} style={sidebarStyle}>
                <div className="p-2 space-y-4">
                    <button className={sidebarHomeBtn} onClick={() => highlightSidebarItem("home")}>
                        <i className="fas fa-home text-lg"></i>
                        <span className={labelClass}>Home</span>
                    </button>

                    <button className={sidebarProfileBtn} onClick={() => highlightSidebarItem("profile")}>
                        <i className="fa-solid fa-user"></i>
                        <span className={labelClass}>Profile</span>
                    </button>

                    <button className={sidebarLoginBtn} onClick={() => highlightSidebarItem("login")}>
                        <i className="fas fa-users"></i>
                        <span className={labelClass}>Login</span>
                    </button>
                </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 h-full w-full lg:w-auto transition-all duration-200 ease-in-out" style={mainContentStyle}>
                <Home apiUrl={apiUrl} mode={darkMode}/>
            </div>
        </div>
    </>)
}       