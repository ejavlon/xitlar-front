import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <Loader className="w-8 h-8 text-[#8b5cf6] animate-spin" />
      <span className="text-xs text-gray-500 font-medium tracking-wide">
        Buffering sound waves...
      </span>
    </div>
  );
}
