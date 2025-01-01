import ClickOutside from "@/components/ClickOutside";
import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { signOut } = useClerk();
  
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('staffEmail') : null;
  const userRole = typeof window !== 'undefined' ? 
    document.cookie.split('; ').find(row => row.startsWith('role='))?.split('=')[1] : null;

  const handleLogout = async () => {
    document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('staffEmail');
    
    await signOut();
    window.location.href = 'https://final-project-customer-rosy.vercel.app/Login/Logout';
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
      >
        <span className="text-right">
          <span className="block text-sm font-medium text-black dark:text-white">
            {userRole || 'Staff'}
          </span>
          <span className="block text-xs">{userEmail}</span>
        </span>

        <svg
          className="fill-current"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
          >
            <svg
              className="fill-current"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.5375 0.618744H11.6531C10.7594 0.618744 10.0031 1.37499 10.0031 2.26874V4.64062C10.0031 5.53437 10.7594 6.29062 11.6531 6.29062H15.5375C16.4313 6.29062 17.1875 5.53437 17.1875 4.64062V2.26874C17.1875 1.37499 16.4313 0.618744 15.5375 0.618744ZM15.95 4.64062C15.95 4.85312 15.7781 5.02499 15.5656 5.02499H11.6531C11.4406 5.02499 11.2688 4.85312 11.2688 4.64062V2.26874C11.2688 2.05624 11.4406 1.88437 11.6531 1.88437H15.5656C15.7781 1.88437 15.95 2.05624 15.95 2.26874V4.64062Z"
                fill=""
              />
              <path
                d="M15.5375 7.67497H11.6531C10.7594 7.67497 10.0031 8.43122 10.0031 9.32497V11.6968C10.0031 12.5906 10.7594 13.3468 11.6531 13.3468H15.5375C16.4313 13.3468 17.1875 12.5906 17.1875 11.6968V9.32497C17.1875 8.43122 16.4313 7.67497 15.5375 7.67497ZM15.95 11.6968C15.95 11.9093 15.7781 12.0812 15.5656 12.0812H11.6531C11.4406 12.0812 11.2688 11.9093 11.2688 11.6968V9.32497C11.2688 9.11247 11.4406 8.9406 11.6531 8.9406H15.5656C15.7781 8.9406 15.95 9.11247 15.95 9.32497V11.6968Z"
                fill=""
              />
              <path
                d="M15.5375 14.7344H11.6531C10.7594 14.7344 10.0031 15.4906 10.0031 16.3844V18.7562C10.0031 19.65 10.7594 20.4062 11.6531 20.4062H15.5375C16.4313 20.4062 17.1875 19.65 17.1875 18.7562V16.3844C17.1875 15.4906 16.4313 14.7344 15.5375 14.7344ZM15.95 18.7562C15.95 18.9687 15.7781 19.1406 15.5656 19.1406H11.6531C11.4406 19.1406 11.2688 18.9687 11.2688 18.7562V16.3844C11.2688 16.1719 11.4406 16 11.6531 16H15.5656C15.7781 16 15.95 16.1719 15.95 16.3844V18.7562Z"
                fill=""
              />
              <path
                d="M6.29375 0.618744H2.40937C1.51562 0.618744 0.759375 1.37499 0.759375 2.26874V4.64062C0.759375 5.53437 1.51562 6.29062 2.40937 6.29062H6.29375C7.1875 6.29062 7.94375 5.53437 7.94375 4.64062V2.26874C7.94375 1.37499 7.1875 0.618744 6.29375 0.618744ZM6.70625 4.64062C6.70625 4.85312 6.53437 5.02499 6.32187 5.02499H2.40937C2.19687 5.02499 2.025 4.85312 2.025 4.64062V2.26874C2.025 2.05624 2.19687 1.88437 2.40937 1.88437H6.32187C6.53437 1.88437 6.70625 2.05624 6.70625 2.26874V4.64062Z"
                fill=""
              />
              <path
                d="M6.29375 7.67497H2.40937C1.51562 7.67497 0.759375 8.43122 0.759375 9.32497V11.6968C0.759375 12.5906 1.51562 13.3468 2.40937 13.3468H6.29375C7.1875 13.3468 7.94375 12.5906 7.94375 11.6968V9.32497C7.94375 8.43122 7.1875 7.67497 6.29375 7.67497ZM6.70625 11.6968C6.70625 11.9093 6.53437 12.0812 6.32187 12.0812H2.40937C2.19687 12.0812 2.025 11.9093 2.025 11.6968V9.32497C2.025 9.11247 2.19687 8.9406 2.40937 8.9406H6.32187C6.53437 8.9406 6.70625 9.11247 6.70625 9.32497V11.6968Z"
                fill=""
              />
              <path
                d="M6.29375 14.7344H2.40937C1.51562 14.7344 0.759375 15.4906 0.759375 16.3844V18.7562C0.759375 19.65 1.51562 20.4062 2.40937 20.4062H6.29375C7.1875 20.4062 7.94375 19.65 7.94375 18.7562V16.3844C7.94375 15.4906 7.1875 14.7344 6.29375 14.7344ZM6.70625 18.7562C6.70625 18.9687 6.53437 19.1406 6.32187 19.1406H2.40937C2.19687 19.1406 2.025 18.9687 2.025 18.7562V16.3844C2.025 16.1719 2.19687 16 2.40937 16H6.32187C6.53437 16 6.70625 16.1719 6.70625 16.3844V18.7562Z"
                fill=""
              />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
