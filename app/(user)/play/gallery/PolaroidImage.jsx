import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

export const PolaroidImage = ({ image_url, description, rotation = 0, created_at }) => {
  return (
    <div 
      className="group w-64 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
      style={{ 
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <div className="relative">
        <img 
          src={image_url} 
          alt={description} 
          className="w-full h-48 object-cover mb-4"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      </div>
      <div className="space-y-2">
        <p className="text-gray-500 text-sm caveat-gallery-1">{dayjs(created_at)?.format("DD/MM/YYYY")}</p>
        <p className="text-gray-800 text-lg font-[fagsong] italic">{description}</p>
      </div>
    </div>
  );
};

PolaroidImage.propTypes = {
  image_url: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  rotation: PropTypes.number
};

export default PolaroidImage;