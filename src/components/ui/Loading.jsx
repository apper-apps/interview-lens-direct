import { cn } from "@/utils/cn";

const Loading = ({ className, message = "Loading..." }) => {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px] w-full", className)}>
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-neutral-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Loading;