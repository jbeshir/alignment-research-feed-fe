import { memo, useState, Fragment, useMemo } from "react";
import Home from "~/components/Home";
import Profile from "~/components/Profile";
import { useAuth0 } from "@auth0/auth0-react";
import { Menu, Transition } from '@headlessui/react'

const Navigation = memo(function Nav({ apiBaseURL }: { apiBaseURL: string }){
    const [darkMode, setDarkMode] = useState(true);
    const [pageChanged, setPageChanged] = useState(true);

    const changePage = (item: number) => {
        switch(item){
            case 1:
                setPageChanged(true);
                break;
            case 2:
                setPageChanged(false);
                break;
            case 3:
                setDarkMode(darkMode => !darkMode);
                break;  
            case 4:
                isAuthenticated ? logout() : loginWithRedirect();
                break;       
        }
    }

    const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

    const userProfile = {
        name: user?.name ?? "John Doe",
        email: user?.email ?? 'johndoe@example.com',
        imageUrl: isAuthenticated ? user?.picture : 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=80',
    }

    const userNavigation = [
        { name: 'Home', page: 1 },
        { name: 'Profile', page: 2 },
        { name: darkMode ? 'Light Mode' : 'Dark Mode', page: 3},
        { name: isAuthenticated ? 'Sign in' : 'Sign out', page: 4},
    ]
      
    function classNames(...classes: any[]) {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <>  
        <div className={darkMode ? "dark dark:bg-slate-800" : "bg-slate-100"}>
            <nav className="sticky top-0 z-50 w-full px-5 py-2 flex justify-between items-center bg-slate-100 dark:bg-slate-800 border-b border-gray-300 dark:border-gray-600">
                <div className="px-2 nav-align">
                    <div className="px-1">
                        <h1 className='text-5xl font-medium text-black dark:text-white p-3 pt-3' style={{left: "0%"}}> { pageChanged ? "Alignment Feed" : "Profile" } </h1>
                    </div>
                    <div className="nav-right lg:ml-4 lg:items-center">
                        <Menu as="div" className="px-2 relative ml-4 flex-shrink-0">
                            <div>
                                <Menu.Button className="bg-white rounded-full flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                                    <span className="sr-only">Open user menu</span>
                                    <img className="h-8 w-8 rounded-full" src={userProfile.imageUrl} alt="" />
                                </Menu.Button>
                            </div>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95">
                                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none">
                                    {userNavigation.map((item) => (
                                        <Menu.Item key={item.name}>
                                            {({ active }) => (
                                                <button onClick={() => changePage(item.page)} className={classNames(active ? 'hover:bg-slate-100 w-48' : '', 'block py-2 px-4 w-48 text-sm text-gray-700')}>
                                                    {item.name}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </Menu.Items>
                            </Transition>
                        </Menu>    
                    </div>
                </div>
            </nav>

            <div className="bg-slate-100 dark:bg-slate-800 h-full w-full lg:w-auto transition-all duration-200 ease-in-out">
                <main className="relative">
                    {   
                        pageChanged ? <Home apiBaseURL={apiBaseURL} darkMode={darkMode ? "-dark" : ""}/> : <Profile />
                    }
                </main>
            </div>
        </div>
    </>)
});

export default Navigation;