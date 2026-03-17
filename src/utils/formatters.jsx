export function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Саяхан';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} минутын өмнө`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} цагийн өмнө`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Өчигдөр';
    if (days < 7) return `${days} өдрийн өмнө`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} долоо хоногийн өмнө`;
    return date.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function renderContent(text) {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            // we have to be careful with React components without importing React. 
            // In typical Vite setups, if we return JSX we must import React (or turn on new JSX transform).
            // It's safer to have the caller render URLs or ensure React is imported.
            // Assuming modern React JSX transform is enabled.
            return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="feed-inline-link">{part}</a>;
        }
        return part;
    });
}
