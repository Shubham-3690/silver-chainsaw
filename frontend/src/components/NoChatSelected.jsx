import { Beaker, Zap, Lock, Users } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-pulse-slow shadow-lg"
            >
              <Beaker className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to Carbonate!
        </h2>
        <p className="text-base-content/70 text-lg">
          Select a conversation from the sidebar to start chatting with your friends
        </p>

        {/* Feature badges */}
        <div className="pt-6 flex flex-wrap justify-center gap-3">
          <div className="badge badge-primary badge-outline p-3 gap-2 shadow-sm">
            <Zap className="w-4 h-4" /> Real-time messaging
          </div>
          <div className="badge badge-secondary badge-outline p-3 gap-2 shadow-sm">
            <Lock className="w-4 h-4" /> Secure & private
          </div>
          <div className="badge badge-accent badge-outline p-3 gap-2 shadow-sm">
            <Users className="w-4 h-4" /> See who's online
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
