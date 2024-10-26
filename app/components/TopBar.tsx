import LoginLogoutButton from "~/components/LoginLogoutButton";

export default function TopBar() {
    return <div className='flex flex-row items-center bg-slate-50 dark:bg-slate-950'>
        <h1 className='inline-block grow p-5 text-5xl text-left font-medium text-black dark:text-white'>Alignment Feed</h1>
        <div className='inline-block p-5 text-right font-medium text-black dark:text-white'>
            <LoginLogoutButton />
        </div>
    </div>;
}