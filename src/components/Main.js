import { useState } from 'react';

function Main() {
  const [isSetup, setIsSetup] = useState(false);

  const handleSetup = () => {
    setIsSetup(!isSetup);
  }

  return (
    <div className="flex-1 w-[400px] bg-sky-200/20 p-5 text-green-400">

      <div className="flex-1 justify-center text-center pb-5">
        <div className="flex-1 font-bold text-2xl">Greenhouse Autopilot</div>
      </div>

      {!isSetup && (
        <div className="flex flex-col flex-1 w-full">

          <div className="pb-5 w-full">
            <button
              className="bg-green-400 text-white font-bold py-2 px-4 rounded w-full"
              // onClick={handleButtonClick}
            >
              Auto Fill
            </button>
          </div>

          <div className="pb-5 w-full flex-1">
            <button
              className="bg-green-200 text-white font-bold py-2 px-4 rounded w-full"
              onClick={handleSetup}
            >
              Setup
            </button>
          </div>

        </div>
      )}

      {isSetup && (
        <div className="flex flex-col flex-1 w-full">

          <div className='pb-2'>
            <label className="block text-bold text-base text-gray-700 pb-1">First Name</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400 sm:text-sm p-2"
              placeholder="First Name"
            />
          </div>

          <div className='pb-2'>
            <label className="block text-bold text-base text-gray-700 pb-1">Last Name</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-400 focus:border-green-400 sm:text-sm p-2"
              placeholder="Last Name"
            />
          </div>



        </div>
      )}


    </div>
  );
}

export default Main;