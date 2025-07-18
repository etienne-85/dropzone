import React, { useState, useEffect, useRef } from 'react';

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

          if (!isInstalled) {
            localStorage.setItem('dropzone-installed', 'true');
            setIsInstalled(true);
          }
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
    const bookmarkletCode = `javascript:(() => {
    const data = {
      title: document.title,
      url: location.href,
      savedAt: new Date().toISOString()
    };

    const receiver = window.open('https://etienne-85.github.io/dropzone/', 'dropzone-sink');
    if (!receiver) {
      alert('Could not open dropzone. Is popup blocked?');
      return;
    }

    setTimeout(() => {
      receiver.postMessage(data, '*');
      alert('Bookmark sent to dropzone!');
    }, 800);
  })();`;
    if (bookmarkletRef.current) {
      bookmarkletRef.current.href = bookmarkletCode;
    }
  }, [isInstalled]);

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
        <div className="flex items-center space-x-2">
          <label
            htmlFor="importFile"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center cursor-pointer"
            title="Import bookmarks from JSON"
          >
            <svg
              className="w-4 h-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 011.414 0L10 9.586l2.293-2.879a1 1 0 111.414 1.414l-3 3.75a1 1 0 01-1.414 0l-3-3.75a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v8a1 1 0 11-2 0V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Import
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
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
            title="Export bookmarks to JSON"
          >
            <svg
              className="w-4 h-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 13.293a1 1 0 011.414 0L10 16.172l2.293-2.879a1 1 0 111.414 1.414l-3 3.75a1 1 0 01-1.414 0l-3-3.75a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v8a1 1 0 11-2 0V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Export
          </button>
          <div className="relative">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
              title="Settings"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0l-.1.41a1.5 1.5 0 01-2.1 1.44l-.4-.16c-1.52-.6-3.24.73-2.63 2.24l.24.6a1.5 1.5 0 01-1.44 2.1l-.4.1c-1.56.38-1.56 2.6 0 2.98l.4.1a1.5 1.5 0 011.44 2.1l-.24.6c-.6 1.52.73 3.24 2.24 2.63l.4-.16a1.5 1.5 0 012.1 1.44l.1.41c.38 1.56 2.6 1.56 2.98 0l.1-.41a1.5 1.5 0 012.1-1.44l.4.16c1.52.6 3.24-.73 2.63-2.24l-.24-.6a1.5 1.5 0 011.44-2.1l.4-.1c-1.56-.38-1.56-2.6 0-2.98l-.4-.1a1.5 1.5 0 01-1.44-2.1l.24-.6c.6-1.52-.73-3.24-2.24-2.63l-.4.16a1.5 1.5 0 01-2.1-1.44l-.1-.41zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {showConfig && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
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
      </div>

      {!isInstalled ? (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-300 mb-8 leading-relaxed">
          <p className="font-bold mb-2">How to install the dropzone bookmarklet:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Keep this <code className="bg-gray-200 px-1 rounded">dropzone.html</code> page open in a browser tab.
            </li>
            <li>
              Drag the button below <strong>to your bookmarks bar</strong> to create the bookmarklet.
            </li>
            <li>
              Press the bookmarklet to complete installation.
            </li>
          </ol>
        </div>
      ) : (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p className="font-bold">Installation successful!</p>
          <p>You can now use the bookmarklet to save pages to your dropzone.</p>
        </div>
      )}

      <a
        ref={bookmarkletRef}
        draggable={true}
        className="select-none px-3 py-2 bg-blue-100 border border-blue-300 inline-block cursor-pointer no-underline text-blue-600 font-bold rounded mb-4 hover:bg-blue-200"
        title="Drag this link to your bookmarks bar"
      >
        Save to dropzone
      </a>

      <h2 className="text-blue-600 text-2xl font-bold mb-4">Saved bookmarks</h2>
      <ul className="list-none p-0">
        {bookmarks.length === 0 ? (
          <li>No bookmarks saved yet.</li>
        ) : (
          bookmarks.map((bookmark, index) => (
            <li key={index} className="mb-3 border-b border-gray-200 pb-2">
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
            </li>
          ))
        )}
      </ul>

    </div>
  );
};
