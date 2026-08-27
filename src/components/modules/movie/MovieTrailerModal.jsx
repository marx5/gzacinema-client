import Modal from "../../core/Modal";

export function MovieTrailerModal({ isOpen, onClose, trailerUrl, movieTitle }) {
  if (!isOpen) return null;

  // Format youtube embed URL
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("embed/")) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={movieTitle ? `Trailer: ${movieTitle}` : "Trailer"}
      maxWidth="max-w-4xl"
    >
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
        {trailerUrl ? (
          <iframe
            src={getEmbedUrl(trailerUrl)}
            title={movieTitle || "Trailer"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Không có video trailer
          </div>
        )}
      </div>
    </Modal>
  );
}

export default MovieTrailerModal;
