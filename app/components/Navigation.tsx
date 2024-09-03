import { useEffect, useState } from "react";

export default function Nav(){
    const [sidebar, setSidebar] = useState(document.createElement('nav'));
    const [navClosed, setNavClosed] = useState(document.createElement('svg'));
    const [navOpen, setNavOpen] = useState(document.createElement('svg'));

    useEffect(() => {
        setSidebar(document?.getElementById("sidebar")!);
        setNavClosed(document.getElementById("navClosed")!);
        setNavOpen(document.getElementById("navOpen")!);
    }, []);


    function openSidebar(e : any) {
        e.preventDefault();
        if(sidebar != null || navClosed != null || navOpen != null){
            sidebar.classList.toggle("show");
            navClosed.classList.toggle("hidden");
            navOpen.classList.toggle("hidden");
        }
    }

        return (
            <>  
            <nav id="navbar" className="fixed top-0 z-40 flex w-full flex-row justify-end bg-gray-700 px-4 sm:justify-between">        
                <ul className="breadcrumb hidden flex-row items-center py-4 text-lg text-white sm:flex">
                    <li className="inline">
                        <a href="#">Main</a>
                    </li>
                    <li className="inline">
                        <span>Homepage</span>
                    </li>
                </ul>
                <button id="btnSidebarToggler" type="button" className="py-4 text-2xl text-white hover:text-gray-200" onClick={openSidebar}>
                    <svg id="navClosed" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="h-8 w-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                    <svg id="navOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="hidden h-8 w-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>   
            </nav>
            <div id="containerSidebar" className="z-40">
                <div className="navbar-menu relative z-40">
                    <nav id="sidebar" className="fixed left-0 bottom-0 flex w-3/4 -translate-x-full flex-col overflow-y-auto bg-gray-700 pt-6 pb-8 sm:max-w-xs lg:w-80">
                        <div className="px-4 pb-6">
                            <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">
                                Main
                            </h3>
                            <ul className="mb-8 text-sm font-medium">
                                <li>
                                    <a className="active flex items-center rounded py-3 pl-3 pr-4 text-gray-50 hover:bg-gray-600" href="#homepage">
                                        <span className="select-none">Homepage</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="flex items-center rounded py-3 pl-3 pr-4 text-gray-50 hover:bg-gray-600" href="#link1">
                                        <span className="select-none">link1</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="px-4 pb-6">
                            <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">
                                Legal
                            </h3>
                            <ul className="mb-8 text-sm font-medium">
                                <li>
                                    <a className="flex items-center rounded py-3 pl-3 pr-4 text-gray-50 hover:bg-gray-600" href="#tc">
                                        <span className="select-none">Terms and Condition</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="flex items-center rounded py-3 pl-3 pr-4 text-gray-50 hover:bg-gray-600" href="#privacy">
                                        <span className="select-none">Privacy policy</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="flex items-center rounded py-3 pl-3 pr-4 text-gray-50 hover:bg-gray-600" href="#imprint">
                                        <span className="select-none">Imprint</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="px-4 pb-6">
                            <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">
                                Others
                            </h3>
                            <ul className="mb-8 text-sm font-medium">
                                <li>
                                    <a className="flex items-center rounded py-3 pl-3 pr-4 text-gray-50 hover:bg-gray-600" href="#ex1">
                                        <span className="select-none">...</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="flex items-center rounded py-3 pl-3 pr-4 text-gray-50 hover:bg-gray-600" href="#ex2">
                                        <span className="select-none">...</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
                <div className="mx-auto lg:ml-80"></div>
            </div>
            </>
        )
    }