import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-3 text-center text-xs text-base-content/60 border-t border-base-300/50 bg-base-100/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <span>Developed by</span>
          <span className="font-medium text-primary">Shubham</span>
          <Heart className="h-3 w-3 text-red-500 fill-red-500" />
        </div>
        <p className="italic">"Learn. Explore. Create"</p>
      </div>
    </footer>
  );
};

export default Footer;
