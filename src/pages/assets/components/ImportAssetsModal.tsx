import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import assetService from "@/api/services/assetService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";

interface ImportAssetsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ImportAssetsModal({ open, onOpenChange }: ImportAssetsModalProps) {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [dragActive, setDragActive] = useState(false);

	const importMutation = useMutation({
		mutationFn: (file: File) => assetService.bulkImportAssets(file),
		onSuccess: (data) => {
			// Show success message for imported assets
			if (data.imported > 0) {
				toast.success(`Successfully imported ${data.imported} of ${data.totalProcessed} assets`);
			}

			// Show duplicates warning
			if (data.duplicates && data.duplicates > 0) {
				const duplicateSerials = data.duplicatesList?.join(", ") || "";
				toast.warning(`${data.duplicates} duplicate(s) skipped${duplicateSerials ? `: ${duplicateSerials}` : ""}`);
			}

			// Show other errors (database errors, validation errors, etc.)
			const otherErrors = data.errors?.filter((err) => !err.includes("Duplicate serial number")) || [];
			if (otherErrors.length > 0) {
				// Count unique error types for user-friendly message
				const dbErrors = otherErrors.filter((e) => e.includes("Database error")).length;
				const validationErrors = otherErrors.length - dbErrors;

				if (dbErrors > 0) {
					toast.error(`${dbErrors} asset(s) failed due to database conflict`);
				}
				if (validationErrors > 0) {
					toast.error(`${validationErrors} asset(s) failed validation`);
				}
			}

			// If nothing was imported and there were issues
			if (data.imported === 0 && data.totalProcessed > 0) {
				toast.error("No assets were imported. Please check your CSV file.");
			}

			queryClient.invalidateQueries({ queryKey: ["assets"] });
			handleClose();
		},
		onError: () => {
			toast.error("Failed to import assets. Please try again.");
		},
	});

	const handleClose = () => {
		setSelectedFile(null);
		onOpenChange(false);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
				toast.error("Please select a CSV file");
				return;
			}
			setSelectedFile(file);
		}
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		const file = e.dataTransfer.files?.[0];
		if (file) {
			if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
				toast.error("Please select a CSV file");
				return;
			}
			setSelectedFile(file);
		}
	};

	const handleImport = () => {
		if (!selectedFile) {
			toast.error("Please select a file first");
			return;
		}
		importMutation.mutate(selectedFile);
	};

	const handleRemoveFile = () => {
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Import Assets</DialogTitle>
					<DialogDescription>Upload a CSV file to bulk import assets</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* File Drop Zone */}
					<div
						className={`
							relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
							${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
							${selectedFile ? "bg-muted/50" : "hover:border-muted-foreground/50"}
						`}
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						onDrop={handleDrop}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept=".csv"
							onChange={handleFileSelect}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>

						{selectedFile ? (
							<div className="flex items-center justify-center gap-3">
								<FileUp className="h-8 w-8 text-primary" />
								<div className="text-left">
									<p className="font-medium">{selectedFile.name}</p>
									<p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 ml-2"
									onClick={(e) => {
										e.stopPropagation();
										handleRemoveFile();
									}}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						) : (
							<div className="space-y-2">
								<Upload className="h-10 w-10 mx-auto text-muted-foreground" />
								<p className="text-sm text-muted-foreground">Drag and drop a CSV file here, or click to browse</p>
							</div>
						)}
					</div>

					{/* CSV Format Info */}
					<div className="rounded-md bg-muted/50 p-3 text-sm">
						<p className="font-medium mb-1">CSV Format</p>
						<p className="text-muted-foreground text-xs">
							<strong>Required:</strong> serial_number, make, model, category
						</p>
						<p className="text-muted-foreground text-xs">
							<strong>Optional:</strong> condition, verification_frequency, location, notes, channel, site_name, client,
							geofence_threshold
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleImport} disabled={!selectedFile || importMutation.isPending}>
						{importMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Import Assets
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
