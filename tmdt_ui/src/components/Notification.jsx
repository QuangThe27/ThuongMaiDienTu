import { X, CheckCircle, AlertCircle } from 'lucide-react';

function Notification({ message, type, onClose }) {
    const isSuccess = type === 'success';

    return (
        <div
            className={`fixed top-5 right-5 z-[9999] flex items-center p-4 mb-4 min-w-[300px] rounded-lg shadow-lg border animate-in fade-in slide-in-from-right-10 duration-300 ${
                isSuccess
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
            }`}
        >
            <div className="flex-shrink-0">
                {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>

            <div className="ml-3 text-sm font-medium pr-8">{message}</div>

            <button
                onClick={onClose}
                className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 focus:outline-none ${
                    isSuccess
                        ? 'hover:bg-green-200 text-green-500'
                        : 'hover:bg-red-200 text-red-500'
                }`}
            >
                <X size={18} />
            </button>
        </div>
    );
}

export default Notification;
