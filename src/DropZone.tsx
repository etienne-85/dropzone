import React, { useState, useEffect, useRef } from 'react';
import { Settings, Trash2 } from 'lucide-react';

interface Bookmark {
  title: string;
  url: string;
  savedAt: string;
}

export const DropZone = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const loadBookmarks = () => {
    const stored = localStorage.getItem('bookmarks');
    if (stored) {
      setBookmarks(JSON.parse(stored));
    }
  };

  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
  };

  useEffect(() => {
    const installed = localStorage.getItem('dropzone-installed') === 'true';
    setIsInstalled(installed);

    window.name = 'dropzone-sink';
    loadBookmarks();

    const handleMessage = (event: MessageEvent) => {
      console.log('Received message:', event);
      const data = event.data;
      if (data && data.title && data.url && data.savedAt) {
        const stored = localStorage.getItem('bookmarks') || '[]';
        let currentBookmarks = JSON.parse(stored);
        if (!currentBookmarks.some((b: Bookmark) => b.url === data.url && b.savedAt === data.savedAt)) {
          currentBookmarks.push(data);
          saveBookmarks(currentBookmarks);
          console.log('Saved bookmark:', data);

          if (event.source) {
            event.source.postMessage({ status: 'success' }, event.origin as any);
          }
          
          if (!isInstalled) {
            localStorage.setItem('dropzone-installed', 'true');
            setIsInstalled(true);
          }
          setTimeout(() => window.close(), 300);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleExport = () => {
    const bookmarksJson = localStorage.getItem('bookmarks') || '[]';
    const blob = new Blob([bookmarksJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dropzone-bookmarks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (!Array.isArray(imported)) throw new Error('JSON must be an array');

        const stored = localStorage.getItem('bookmarks') || '[]';
        let currentBookmarks = JSON.parse(stored);

        imported.forEach((imp: any) => {
          if (
            imp.title &&
            imp.url &&
            imp.savedAt &&
            !currentBookmarks.some((b: Bookmark) => b.url === imp.url && b.savedAt === imp.savedAt)
          ) {
            currentBookmarks.push(imp);
          }
        });

        saveBookmarks(currentBookmarks);
        alert('Imported bookmarks successfully!');
      } catch (err) {
        alert('Failed to import bookmarks: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const bookmarkletRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const dropzoneUrl = window.location.href;
    const bookmarkletCode = `javascript:(() => {
    const data = {
        title: document.title,
        url: location.href,
        savedAt: new Date().toISOString()
    };

    const receiver = window.open('${dropzoneUrl}', 'dropzone-sink');
    if (!receiver) {
        alert('Could not open dropzone. Is popup blocked?');
        return;
    }

    const messageListener = (event) => {
        if (event.source === receiver && event.data.status === 'success') {
            alert('Bookmark saved to Dropzone!');
            window.removeEventListener('message', messageListener);
        }
    };

    window.addEventListener('message', messageListener);

    setTimeout(() => {
        receiver.postMessage(data, '*');
    }, 800);
})();`;
    if (bookmarkletRef.current) {
      bookmarkletRef.current.href = bookmarkletCode;
    }
  }, [isInstalled]);

  const handleDelete = (index: number) => {
    const newBookmarks = [...bookmarks];
    newBookmarks.splice(index, 1);
    saveBookmarks(newBookmarks);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('bookmarks');
      localStorage.removeItem('dropzone-installed');
      setBookmarks([]);
      setIsInstalled(false);
      setShowConfig(false);
    }
  };

  return (
    <div className="font-sans max-w-3xl mx-auto mt-8 px-4 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-blue-600 text-3xl font-bold">DropZone</h1>
        <div className="relative">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          {showConfig && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
              <label
                htmlFor="importFile"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Import Bookmarks
              </label>
              <input
                type="file"
                id="importFile"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={handleExport}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export Bookmarks
              </button>
              <button
                onClick={handleClearData}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Clear All Data
              </button>
            </div>
          )}
        </div>
      </div>

      {!isInstalled ? (
        <>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-300 mb-8 leading-relaxed">
            <p className="font-bold mb-2">How to install the dropzone bookmarklet:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Drag the button below <strong>to your bookmarks bar</strong>.
              </li>
              <li>
                Start bookmarking your first site using the bookmarklet button to complete install.
              </li>
            </ol>
          </div>
          <a
            ref={bookmarkletRef}
            draggable={true}
            className="select-none px-3 py-2 bg-blue-100 border border-blue-300 inline-block cursor-pointer no-underline text-blue-600 font-bold rounded mb-4 hover:bg-blue-200"
            title="Drag this link to your bookmarks bar"
          >
            Save to dropzone
          </a>
        </>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-300 mb-8 leading-relaxed">
          <p className="text-center text-gray-600">
            Use the bookmarklet button from any page to save it here.
          </p>
        </div>
      )}

      <h2 className="text-blue-600 text-2xl font-bold mb-4">Saved bookmarks</h2>
      <ul className="list-none p-0">
        {bookmarks.length === 0 ? (
          <li>No bookmarks saved yet.</li>
        ) : (
          bookmarks.map((bookmark, index) => (
            <li key={index} className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
              <div>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline text-blue-600 font-semibold"
                >
                  {bookmark.title}
                </a>
                <small className="text-gray-600 ml-2 font-normal">
                  (saved at {new Date(bookmark.savedAt).toLocaleString()})
                </small>
              </div>
              <button
                onClick={() => handleDelete(index)}
                className="text-gray-400 hover:text-gray-600"
                title="Delete bookmark"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </li>
          ))
        )}
      </ul>

    </div>
  );
};
