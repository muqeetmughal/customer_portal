


const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
                {/* Spinner */}
                <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-indigo-200 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                </div>

                {/* Loading text with dots animation */}
                <div className="flex items-center justify-center space-x-1">
                    <span className="text-xl font-semibold text-indigo-900">Loading</span>
                    <span className="flex space-x-1">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                </div>

                {/* Optional: Pulse circle */}
                <div className="mt-8">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full mx-auto animate-ping"></div>
                </div>
            </div>
        </div>
    )
}

export default LoadingScreen
