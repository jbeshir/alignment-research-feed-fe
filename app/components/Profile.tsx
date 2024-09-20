import { useAuth0 } from "@auth0/auth0-react";
import { useState } from 'react'
 
export default function Profile(){
    const saveProfile = (e:  React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        alert("Profile has been saved!");
        //save functionality
    }

    const savePreferences = (e:  React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        alert("Preferences have been saved!");
    }

    const { user, isAuthenticated, logout } = useAuth0(); 

    const [firstName, setFirstName] = useState(user?.name ?? "John");
    const [lastName, setLastName] = useState(user?.family_name ?? "Doe");
    const [email, setEmail] = useState(user?.email ?? "johndoe@mail.com");
    const [birthDate, setBirthDate] = useState(user?.birthdate ?? "");
    const [role, setRole] = useState("research lead");
    const [country, setCountry] = useState(user?.address ?? "United States of America");
    const [zip, setZip] = useState(1);
    
    //Fix settings on profile so that it is not light on a dark theme

    return(
        <>
        <div className="h-screen w-full flex flex-col pt-3">
            <div className="bg-slate-100 dark:bg-slate-800 gap-2 p-4 rounded-xl shadow-xl">
              <section aria-labelledby="profile-details-heading">
                <form>
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white dark:bg-black py-6 px-4 sm:p-6">
                      <div>
                        <h2 id="payment-details-heading" className="text-lg leading-6 font-medium text-gray-900">
                          Profile
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Update your profile information. 
                        </p>
                      </div>

                      <div className="mt-6 grid grid-cols-4 gap-6">
                        <div className="col-span-4 sm:col-span-2">
                          <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                            First name
                          </label>
                          <input
                            onChange={(e) => setFirstName(e.target.value)}
                            type="text"
                            name="first-name"
                            id="first-name"
                            value={firstName}
                            autoComplete="cc-given-name"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"/>
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                            Last name
                          </label>
                          <input
                            onChange={(e) => setLastName(e.target.value)}
                            type="text"
                            name="last-name"
                            id="last-name"
                            value={lastName}
                            autoComplete="cc-family-name"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                            Email address
                          </label>
                          <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="text"
                            name="email-address"
                            id="email-address"
                            value={email}
                            autoComplete="email"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-1">
                          <label htmlFor="birth-date" className="block text-sm font-medium text-gray-700">
                            Birth date
                          </label>
                          <input
                            onChange={(e) => setBirthDate(e.target.value)}
                            type="text"
                            name="birth-date"
                            id="birth-date"
                            value={birthDate}
                            autoComplete="cc-birth"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                            placeholder="MM / YY"
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-1">
                            <label htmlFor="role" className="flex items-center text-sm font-medium text-gray-700">
                                <span>Role</span>
                            </label>
                            <select
                            onChange={(e) => setRole(e.target.value)}
                            name="role"
                            id="role"
                            value={role}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm">
                                <option defaultValue="research lead">research lead</option>
                                <option value="research contributor">research contributor</option>
                                <option value="developer">developer</option>
                                <option value="professor">professor</option>
                            </select>
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                            Country
                          </label>
                          <select
                            onSelect={(e) => setCountry(e.currentTarget.value)}
                            id="country"
                            name="country"
                            value={country}
                            autoComplete="country-name"
                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                          >
                            <option value="United States of America">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="Mexico">Mexico</option>
                          </select>
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">
                            ZIP / Postal code
                          </label>
                          <input
                            onChange={(e) => setZip(e.target.value)}
                            type="text"
                            name="postal-code"
                            id="postal-code"
                            autoComplete="postal-code"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <button onClick={saveProfile} type="button" className="bg-gray-800 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </section>
              <section aria-labelledby="settings-heading" className="pt-4">
                <form>
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 sm:p-6">
                      <div>
                        <h2 id="payment-details-heading" className="text-lg leading-6 font-medium text-gray-900">
                            Settings
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Update the settings and personal preferences. 
                        </p>
                      </div>

                      <div className="mt-6 grid grid-cols-4 gap-6">
                        <div className="col-span-4 sm:col-span-2">
                          <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                            First name
                          </label>
                          <input
                            onChange={(e) => setFirstName(e.target.value)}
                            type="text"
                            name="first-name"
                            id="first-name"
                            value={firstName}
                            autoComplete="cc-given-name"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"/>
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                            Last name
                          </label>
                          <input
                            onChange={(e) => setLastName(e.target.value)}
                            type="text"
                            name="last-name"
                            id="last-name"
                            value={lastName}
                            autoComplete="cc-family-name"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                            Email address
                          </label>
                          <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="text"
                            name="email-address"
                            id="email-address"
                            value={email}
                            autoComplete="email"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-1">
                          <label htmlFor="birth-date" className="block text-sm font-medium text-gray-700">
                            Birth date
                          </label>
                          <input
                            onChange={(e) => setBirthDate(e.target.value)}
                            type="text"
                            name="birth-date"
                            id="birth-date"
                            value={birthDate}
                            autoComplete="cc-birth"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                            placeholder="MM / YY"
                          />
                        </div>

                        <div className="col-span-4 sm:col-span-1">
                            <label htmlFor="role" className="flex items-center text-sm font-medium text-gray-700">
                                <span>Role</span>
                            </label>
                            <select
                            onChange={(e) => setRole(e.target.value)}
                            name="role"
                            id="role"
                            value={role}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm">
                                <option defaultValue="research lead">research lead</option>
                                <option value="research contributor">research contributor</option>
                                <option value="developer">developer</option>
                                <option value="professor">professor</option>
                            </select>
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                            Country
                          </label>
                          <select
                            onSelect={(e) => setCountry(e.currentTarget.value)}
                            id="country"
                            name="country"
                            value={country}
                            autoComplete="country-name"
                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                          >
                            <option value="United States of America">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="Mexico">Mexico</option>
                          </select>
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">
                            ZIP / Postal code
                          </label>
                          <input
                            onChange={(e) => setZip(e.target.value)}
                            type="text"
                            name="postal-code"
                            id="postal-code"
                            autoComplete="postal-code"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <button onClick={saveProfile} type="button" className="bg-gray-800 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </section>
              <section aria-labelledby="articles-details-heading" className="pt-4">
                <form>
                  <div className="shadow sm:rounded-md sm:overflow-hidden">
                    <div className="bg-white py-6 px-4 sm:p-6">
                      <div>
                        <h2 id="payment-details-heading" className="text-lg leading-6 font-medium text-gray-900">
                            Latest actions
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Your latest interactions on articles
                        </p>
                      </div>

                      <div className="mt-6 grid grid-cols-4 gap-6">
                        {/* Articles upvoted/downvoted by user shown here */}
                      </div>
                    </div>
                  </div>
                </form>
              </section>
            </div>
        </div>
        </>
    );
}

