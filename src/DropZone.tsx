import React, { useState, useEffect, useRef } from 'react';

interface Bookmark {
  title: string;
  url: string;
  savedAt: string;
}

export const DropZone = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

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
  }, []);

  return (
    <div className="font-sans max-w-3xl mx-auto mt-8 px-4 text-gray-800">
      <h1 className="text-blue-600 text-3xl font-bold mb-6">DropZone</h1>

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
            When browsing any page, click the bookmarklet to save the current page info here.
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

      <button
        onClick={handleExport}
        className="bg-blue-600 text-white border-none px-4 py-2 rounded cursor-pointer mr-4 font-semibold hover:bg-blue-800"
        title="Export bookmarks to JSON"
      >
        Export Bookmarks
      </button>
      <label htmlFor="importFile" className="inline-block">
        Import bookmarks from JSON:
      </label>
      <input
        type="file"
        id="importFile"
        accept=".json"
        onChange={handleImport}
        className="mt-4 mb-4 block"
      />
    </div>
  );
};
