import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../lib/cropUtils";
import { X, Check } from "lucide-react";

const ImageCropper = ({ imageSrc, onCancel, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl h-[60vh] bg-black rounded-lg overflow-hidden mb-4">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={onZoomChange}
        />
      </div>

      <div className="bg-white p-4 rounded-lg w-full max-w-md flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Zoom</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(e.target.value);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            <X size={20} /> Cancel
          </button>
          <button
            type="button"
            onClick={showCroppedImage}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Check size={20} /> Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
