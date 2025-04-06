const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-70"></div>

      {/* Content */}
      <div className="max-w-md text-center relative z-10">
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl ${i % 3 === 0 ? 'bg-primary/20' : i % 3 === 1 ? 'bg-secondary/20' : 'bg-base-300/50'}
              ${i % 2 === 0 ? "animate-pulse-slow" : ""} shadow-md`}
            />
          ))}
        </div>
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{title}</h2>
        <p className="text-base-content/70 text-lg">{subtitle}</p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary/10 animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-secondary/10 animate-pulse-slow"></div>
    </div>
  );
};

export default AuthImagePattern;
