export default function timeAgo(dateString: string | null) {

    if (!dateString) return "sent";

    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds

    if (diff < 60) {
        return `${diff}s ago`;
    } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes}m ago`;
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours}h ago`;
    } else if (diff < 2592000) {
        const days = Math.floor(diff / 86400);
        return `${days}d ago`;
    } else if (diff < 31536000) {
        const months = Math.floor(diff / 2592000);
        return `${months}mo ago`;
    } else {
        const years = Math.floor(diff / 31536000);
        return `${years}y ago`;
    }
}
