import React from 'react';

export type FloatingCardProps = {
  img?: string;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  position?: React.CSSProperties;
};

const FloatingCard: React.FC<FloatingCardProps> = ({ img, title, subtitle, icon, position }) => {
  return (
    <div style={position} className="absolute bg-white shadow-lg rounded-lg px-4 py-3 flex items-center gap-3">
      {img ? (
        <img src={img} alt={title} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        icon ? (
          <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center">{icon}</div>
        ) : (
          <div className="w-10 h-10 rounded-md bg-gray-100" />
        )
      )}

      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-gray-400">{subtitle}</div>
      </div>
    </div>
  );
};

export default React.memo(FloatingCard);



