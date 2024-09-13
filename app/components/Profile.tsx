import { useAuth0 } from "@auth0/auth0-react";

export default function Profile(){
    const saveProfile = (e : any) => {
        e.PreventDefault();
        alert("Profile has been saved!");
        //save functionality
    }

    const savePreferences = (e: any) => {
        e.PreventDefault();
        alert("Preferences have been saved!");
    }

   const { user, isAuthenticated } = useAuth0();
    
    return(
        <>
        <div className="h-screen w-full flex flex-col space-y-4 pb-5 pt-3">
            <div>
                <div className="md:grid grid-cols-4 grid-rows-2 bg-slate-100 dark:bg-slate-800 gap-2 p-4 rounded-xl shadow-xl">
                    <div className="md:col-span-1 h-48">
                        <div className="flex w-full h-full relative">
                            <img src="https://res.cloudinary.com/dboafhu31/image/upload/v1625318266/imagen_2021-07-03_091743_vtbkf8.png" className="w-44 h-44 m-auto" alt="" />
                        </div>
                    </div>
                    <div className="md:col-span-3 h-54 shadow-xl p-4 space-y-2 p-3">
                        <div className='text-xl font-medium text-black dark:text-white px-2 pb-2'>
                            Profile Settings
                        </div>
                        <div className="flex ">
                            <span className="text-sm border bg-blue-50 font-bold uppercase border-2 rounded-l px-4 py-2 bg-gray-50 whitespace-no-wrap w-2/6">Name:</span>
                            <input className="px-4 border-l-0 cursor-default border-gray-300 focus:outline-none  rounded-md rounded-l-none shadow-sm -ml-1 w-4/6" type="text" value="Ismael Contreras" />
                        </div>
                        <div className="flex ">
                            <span className="text-sm border bg-blue-50 font-bold uppercase border-2 rounded-l px-4 py-2 bg-gray-50 whitespace-no-wrap w-2/6">Email:</span>
                            <input className="px-4 border-l-0 cursor-default border-gray-300 focus:outline-none  rounded-md rounded-l-none shadow-sm -ml-1 w-4/6" type="text" value="myemail@server.com"/>
                        </div>
                        <div className="flex ">
                            <span className="text-sm border bg-blue-50 font-bold uppercase border-2 rounded-l px-4 py-2 bg-gray-50 whitespace-no-wrap w-2/6">Role:</span>
                            <input className="px-4 border-l-0 cursor-default border-gray-300 focus:outline-none  rounded-md rounded-l-none shadow-sm -ml-1 w-4/6" type="text" value="Admin"  readOnly/>
                        </div>
                        <div className="flex float-end"><button className="dark:text-slate-100 text-slate-800" onClick={saveProfile}>Save Profile</button></div>
                    </div>
                    <div className="md:col-span-1 h-54 p-4 space-y-2 hidden md:block dark:text-slate-100 text-slate-800">
                        <h3 className="font-bold uppercase"> Profile Description</h3>
                        <p className=""> 
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget laoreet diam, id luctus lectus. Ut consectetur nisl ipsum, et faucibus sem finibus vitae. Maecenas aliquam dolor at dignissim commodo. Etiam a aliquam tellus, et suscipit dolor. Proin auctor nisi velit, quis aliquet sapien viverra a. 
                        </p>
                    </div>
                    <div className="md:col-span-3 h-54 shadow-xl p-4 space-y-2 p-3">
                        <div className='text-xl font-medium text-black dark:text-white px-2 pb-2'>
                            Preference Settings
                        </div>
                        <div className="flex ">
                            <span className="text-sm border bg-blue-50 font-bold uppercase border-2 rounded-l px-4 py-2 bg-gray-50 whitespace-no-wrap w-2/6">Name:</span>
                            <input className="px-4 border-l-0 cursor-default border-gray-300 focus:outline-none  rounded-md rounded-l-none shadow-sm -ml-1 w-4/6" type="text" value="Ismael Contreras"/>
                        </div>
                        <div className="flex ">
                            <span className="text-sm border bg-blue-50 font-bold uppercase border-2 rounded-l px-4 py-2 bg-gray-50 whitespace-no-wrap w-2/6">Email:</span>
                            <input className="px-4 border-l-0 cursor-default border-gray-300 focus:outline-none  rounded-md rounded-l-none shadow-sm -ml-1 w-4/6" type="text" value="myemail@server.com" />
                        </div>
                        <div className="flex ">
                            <span className="text-sm border bg-blue-50 font-bold uppercase border-2 rounded-l px-4 py-2 bg-gray-50 whitespace-no-wrap w-2/6">Role:</span>
                            <input className="px-4 border-l-0 cursor-default border-gray-300 focus:outline-none  rounded-md rounded-l-none shadow-sm -ml-1 w-4/6" type="text" value="Admin"  readOnly/>
                        </div>
                        <div className="flex float-end"><button className="dark:text-slate-100 text-slate-800" onClick={savePreferences}>Save Preferences</button></div>
                    </div>
                </div>
                <div>
                    <button disabled={(!isAuthenticated)} className="relative px-3 py-3 flex items-center space-x-4 justify-start rounded-lg group hover:bg-slate-400 w-56 ml-0 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white w-56 h-10 ml-0">
                        Sign out
                    </button>
                </div>
            </div>
        </div>
        </>
    );
}