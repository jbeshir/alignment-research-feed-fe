import { memo, useState, useMemo } from "react";
import Home from "~/components/Home";
import Profile from "~/components/Profile";
import { useAuth0 } from "@auth0/auth0-react";

const Navigation = memo(function Nav({ apiBaseURL }: { apiBaseURL: string }){
    const [toggleExpand, setToggleExpand] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    const [sidebarClass, setSidebarClass] = useState("pt-3 w-28 bg-slate-100 dark:bg-slate-800 h-screen fixed rounded-none border-none transition-all duration-200 ease-in-out overflow-hidden text-center px-0 text-gray-500");
    const [sidebarStyle, setSidebarStyle] = useState({width: "4rem"});
    const textVisible = "text-left px-6 text-slate-100 dark:text-slate-800";
    const textNotVisible = "text-center px-0 text-gray-500" 

    const [mainContentStyle, setMainContentStyle] = useState({marginLeft: "4rem"});

    const labelClassInitial = "font-medium transition-all duration-200 opacity-0";
    const labelClassChanged = "font-medium transition-all duration-200 opacity-100";
    const [labelClass, setLabelClass] = useState(labelClassInitial);
    
    const sidebarBtn = "relative px-3 py-3 flex items-center space-x-4 justify-start text-gray-500 rounded-lg group hover:bg-slate-400 w-56";
    const sidebarBtnGradient = " bg-gradient-to-r from-cyan-400 to-cyan-500 text-white w-56 ml-0";
    const [sidebarHomeBtn, setSidebarHomeBtn] = useState("relative px-3 py-3 flex items-center space-x-4 justify-start rounded-lg group hover:bg-slate-400 w-56 ml-0 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white w-56 h-10 ml-0");
    const [sidebarProfileBtn, setSidebarProfileBtn] = useState(sidebarBtn);

    const [pageChanged, setPageChanged] = useState(true);

    const expandSidebar = () => {
        setToggleExpand(!toggleExpand);

        if(toggleExpand === false){
            setSidebarStyle({width: '4rem'});
            setMainContentStyle({marginLeft:'4rem'});
            setSidebarClass(sidebarClass.replace(textVisible, textNotVisible));
            setLabelClass(labelClassInitial);
        } 
        else
        {
            setSidebarStyle({width: '16rem'});
            setMainContentStyle({marginLeft: '16rem'});
            setSidebarClass(sidebarClass.replace(textNotVisible, textVisible));
            setLabelClass(labelClassChanged);
        }
    }

    const highlightSidebarItem = async (text: string) => 
    {
        if(text === "home"){
            setSidebarHomeBtn(sidebarHomeBtn.replace("text-gray-500", "") + sidebarBtnGradient);
            setPageChanged(true);
        }
        else {
            setSidebarHomeBtn(sidebarBtn);
        }

        if(text === "profile"){
            setSidebarProfileBtn(sidebarProfileBtn.replace("text-gray-500", "") + sidebarBtnGradient)
            setPageChanged(false);
        }
        else{
            setSidebarProfileBtn(sidebarBtn);
        }
    }

    const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();
    
    const toggleDarkMode = () => {
        setDarkMode(darkMode => !darkMode);
    }

    return (
        <>  
        <div className={darkMode ? "dark dark:bg-slate-800" : "bg-slate-100"}>
            <nav className="sticky top-0 z-50 w-full px-5 py-2 flex justify-between items-center bg-slate-100 dark:bg-slate-800 border-b border-gray-300 dark:border-gray-600">
                <div className="px-2 nav-align">
                    <div>
                        <button id="menu-button" onClick={expandSidebar} >
                            <i className="fas fa-bars text-cyan-500 text-lg"></i>
                        </button>
                    </div>
                    <div className="px-6">
                        <h1 className='text-5xl font-medium text-black dark:text-white p-5 pt-3' style={{left: "0%"}}> { pageChanged ? "Alignment Feed" : "Profile" } </h1>
                    </div>
                    <div className="nav-right">
                        <button onClick={toggleDarkMode}>
                            {
                                darkMode ? <i className="fa-solid fa-moon text-cyan-500 fa-xl"></i> : <i className="fa-regular fa-sun text-cyan-500 fa-xl"></i>
                            }
                        </button>
                    </div>
                    <div className="nav-right">
                        <button  onClick={() => loginWithRedirect()}>
                            {
                                isAuthenticated ?  <i className="fas fa-right-to-bracket text-gray-600 fa-xl"></i> : <i className="fas fa-right-to-bracket text-cyan-500 fa-xl"></i>
                            }
                            
                            <span className={labelClass}>Login</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div id="sidebar" className={sidebarClass} style={sidebarStyle}>
                <div className="p-2">
                    <button className={sidebarHomeBtn} onClick={() => highlightSidebarItem("home")}>
                        <i className="fas fa-home text-lg"></i>
                        <span className={labelClass}>Home</span>
                    </button>

                    <button className={sidebarProfileBtn} onClick={() => highlightSidebarItem("profile")}>
                        <i className="fa-solid fa-user"></i>
                        <span className={labelClass}>Profile</span>
                    </button>

                    
                </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 h-full w-full lg:w-auto transition-all duration-200 ease-in-out" style={mainContentStyle}>
                <main className="relative">
                    {   
                        pageChanged ? <Home apiBaseURL={apiBaseURL} /> : <Profile />
                    }
                </main>
            </div>
        </div>
    </>)
});

export default Navigation;