import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-pulse shadow-md"
            >
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to Nexus!
        </h2>
        <p className="text-base-content/70 text-lg">
          Select a conversation from the sidebar to start chatting
        </p>
        <div className="pt-4">
          <div className="badge badge-primary badge-outline p-3">Real-time messaging</div>
          <div className="badge badge-secondary badge-outline p-3 ml-2">Secure & private</div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
