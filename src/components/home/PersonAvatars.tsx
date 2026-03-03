import React from 'react';

type Props = {
  avatars: string[];
};

const PersonAvatars: React.FC<Props> = ({ avatars }) => {
  return (
    <div className="mt-6 flex items-center gap-3">
      <div className="-space-x-2 flex items-center">
        {avatars.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Mentor avatar ${idx + 1}`}
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(PersonAvatars);



