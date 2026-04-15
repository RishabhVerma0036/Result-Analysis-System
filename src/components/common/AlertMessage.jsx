import { Info } from "lucide-react";

const AlertMessage = ({ message, type }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`mb-6 p-4 flex items-start gap-3 rounded-md border ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
      <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default AlertMessage;