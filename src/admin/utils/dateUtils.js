export const formatLastSeen = (dateString) => {
    if (!dateString) return 'Unknown';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Unknown';

        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting last seen:', error);
        return 'Unknown';
    }
};

export const formatMessageTime = (timestamp) => {
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Invalid time';
        
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting message time:', error);
        return 'Invalid time';
    }
};