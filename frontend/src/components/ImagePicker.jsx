import React, { useState, useEffect } from "react";
import ImageCropper from "./ImageCropper";

const ImagePicker = ({
  defaultImage,
  onImageChanged,
  label = "Image Source",
}) => {
  const [mode, setMode] = useState("url"); // 'url' | 'file'
  const [urlValue, setUrlValue] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  // Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImgSrc, setCropperImgSrc] = useState(null);

  useEffect(() => {
    if (defaultImage) {
      if (defaultImage.startsWith("http")) {
        setMode("url");
        setUrlValue(defaultImage);
      } else {
        setMode("file"); // It's a stored file path, but we treat it as "file mode" initial state
        setPreviewUrl(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${defaultImage}`,
        );
      }
    } else {
      setMode("url");
      setUrlValue("");
      setPreviewUrl(null);
    }
  }, [defaultImage]);

  const handleTypeChange = (newMode) => {
    setMode(newMode);
    // Notify parent of the change (clearing value if switching)
    if (newMode === "url") {
      onImageChanged({ type: "url", value: urlValue });
    } else {
      onImageChanged({ type: "file", value: null }); // No file selected yet
    }
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrlValue(val);
    onImageChanged({ type: "url", value: val });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropperImgSrc(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
      e.target.value = null;
    }
  };

  const handleCropComplete = (croppedBlob) => {
    const file = new File([croppedBlob], "cropped_image.jpg", {
      type: "image/jpeg",
    });
    setPreviewUrl(URL.createObjectURL(file));
    setShowCropper(false);
    setCropperImgSrc(null);
    onImageChanged({ type: "file", value: file });
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropperImgSrc(null);
  };

  return (
    <div className="mb-4">
      {showCropper && (
        <ImageCropper
          imageSrc={cropperImgSrc}
          onCancel={handleCropCancel}
          onCropComplete={handleCropComplete}
        />
      )}

      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex gap-4 mb-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`imageType-${label}`} // Unique name if multiple pickers exist
            checked={mode === "url"}
            onChange={() => handleTypeChange("url")}
            className="text-blue-600"
          />
          <span>Image Link</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`imageType-${label}`}
            checked={mode === "file"}
            onChange={() => handleTypeChange("file")}
            className="text-blue-600"
          />
          <span>Upload File</span>
        </label>
      </div>

      {mode === "url" ? (
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={urlValue}
          onChange={handleUrlChange}
          placeholder="https://..."
        />
      ) : (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {previewUrl && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="h-20 w-auto rounded border"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImagePicker;
