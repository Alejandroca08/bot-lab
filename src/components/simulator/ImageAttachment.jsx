import { useState, useRef } from 'react';

export default function ImageAttachment({ onSelect, onCancel }) {
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview({
        base64: ev.target.result,
        fileName: file.name,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!preview) return;
    onSelect(preview.base64, {
      mimeType: preview.mimeType,
      fileName: preview.fileName,
      caption: caption.trim() || undefined,
    });
  };

  return (
    <div className="mb-3 bg-surface-700 rounded-xl border border-surface-400/50 p-3 animate-fade-in">
      {!preview ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-surface-400 rounded-lg p-6 text-center cursor-pointer hover:border-accent/40 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" className="mx-auto mb-2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-xs text-surface-300">Click to select an image</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div>
          <div className="relative mb-2">
            <img
              src={preview.base64}
              alt="Preview"
              className="rounded-lg max-h-48 object-contain mx-auto"
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="flex-1 bg-surface-600 rounded-lg px-3 py-2 text-xs text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent border border-transparent"
            />
            <button onClick={handleSend} className="p-2 rounded-lg bg-accent text-surface-900 hover:bg-accent-hover transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
            <button onClick={onCancel} className="p-2 rounded-lg text-surface-300 hover:text-surface-50 hover:bg-surface-600 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
