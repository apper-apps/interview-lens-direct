import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Error = ({ message = "Something went wrong", onRetry, className }) => {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px] w-full", className)}>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-red-50 border border-red-200">
            <ApperIcon name="AlertCircle" size={32} className="text-red-500" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Unable to Load Content
        </h3>
        <p className="text-neutral-600 mb-6 leading-relaxed">
          {message}. Please check your connection and try again.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all duration-200 btn-hover"
          >
            <ApperIcon name="RefreshCw" size={16} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default Error;