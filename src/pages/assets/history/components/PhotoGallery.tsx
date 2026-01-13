import { ChevronLeft, ChevronRight, ImageOff, X, ZoomIn } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { Button } from "@/ui/button";
import { Dialog, DialogContent } from "@/ui/dialog";

interface PhotoGalleryProps {
	photos: string[];
	title?: string;
}

interface ThumbnailProps {
	photo: string;
	index: number;
	onOpen: (index: number) => void;
}

const Thumbnail = memo(function Thumbnail({ photo, index, onOpen }: ThumbnailProps) {
	const [loaded, setLoaded] = useState(false);
	const [failed, setFailed] = useState(false);

	return (
		<button
			type="button"
			onClick={() => onOpen(index)}
			className="relative aspect-square rounded-md overflow-hidden bg-muted hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
		>
			{!loaded && !failed && <div className="absolute inset-0 animate-pulse bg-muted" />}
			{failed ? (
				<div className="absolute inset-0 flex items-center justify-center bg-muted">
					<ImageOff className="h-4 w-4 text-muted-foreground" />
				</div>
			) : (
				<img
					src={photo}
					alt={`Asset capture ${index + 1}`}
					loading="lazy"
					onLoad={() => setLoaded(true)}
					onError={() => setFailed(true)}
					className={`absolute inset-0 w-full h-full object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
				/>
			)}
			<div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
				<ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
			</div>
		</button>
	);
});

export function PhotoGallery({ photos, title = "Photos" }: PhotoGalleryProps) {
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const openLightbox = useCallback((index: number) => {
		setCurrentIndex(index);
		setLightboxOpen(true);
	}, []);

	const navigatePrev = useCallback(() => {
		setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
	}, [photos.length]);

	const navigateNext = useCallback(() => {
		setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
	}, [photos.length]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "ArrowLeft") navigatePrev();
			if (e.key === "ArrowRight") navigateNext();
			if (e.key === "Escape") setLightboxOpen(false);
		},
		[navigatePrev, navigateNext],
	);

	if (photos.length === 0) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
				<ImageOff className="h-4 w-4" />
				No photos available
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{title && <p className="text-xs font-medium text-muted-foreground">{title}</p>}

			{/* Thumbnail Grid - each thumbnail manages its own load state */}
			<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
				{photos.map((photo, index) => (
					<Thumbnail key={`${photo}-${index}`} photo={photo} index={index} onOpen={openLightbox} />
				))}
			</div>

			{/* Lightbox Modal - only rendered when open */}
			{lightboxOpen && (
				<Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
					<DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-black/95 border-none" onKeyDown={handleKeyDown}>
						<div className="relative w-full h-full flex items-center justify-center">
							{/* Close button */}
							<Button
								variant="ghost"
								size="icon"
								className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
								onClick={() => setLightboxOpen(false)}
							>
								<X className="h-5 w-5" />
							</Button>

							{/* Navigation */}
							{photos.length > 1 && (
								<>
									<Button
										variant="ghost"
										size="icon"
										className="absolute left-4 z-10 text-white hover:bg-white/20"
										onClick={navigatePrev}
									>
										<ChevronLeft className="h-6 w-6" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="absolute right-4 z-10 text-white hover:bg-white/20"
										onClick={navigateNext}
									>
										<ChevronRight className="h-6 w-6" />
									</Button>
								</>
							)}

							{/* Current Image */}
							<img
								src={photos[currentIndex]}
								alt={`Asset capture ${currentIndex + 1}`}
								className="max-w-full max-h-full object-contain"
							/>

							{/* Counter */}
							<div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
								{currentIndex + 1} / {photos.length}
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
