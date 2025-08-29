import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Empty = ({ 
  title = "No data available", 
  message = "There's nothing to display at the moment.",
  action,
  actionLabel = "Get Started",
  className 
}) => {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px] w-full", className)}>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200">
            <ApperIcon name="FileText" size={40} className="text-neutral-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          {title}
        </h3>
        <p className="text-neutral-600 mb-6 leading-relaxed">
          {message}
        </p>
{action && typeof action === 'function' && (
          <button
            onClick={action}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 btn-hover shadow-lg"
          >
            <ApperIcon name="Plus" size={16} />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default Empty;