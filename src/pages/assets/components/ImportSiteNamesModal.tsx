import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileUp, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import siteNameService from "@/api/services/siteNameService";
import { downloadFailedImportFile } from "@/utils/download-failed-import";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";

interface ImportSiteNamesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ImportSiteNamesModal({ open, onOpenChange }: ImportSiteNamesModalProps) {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const [downloadingTemplate, setDownloadingTemplate] = useState(false);

	const importMutation = useMutation({
		mutationFn: (file: File) => siteNameService.bulkImportSiteNames(file),
		onSuccess: (data) => {
			if (data.imported > 0) {
				toast.success(`Successfully imported ${data.imported} of ${data.totalProcessed} site names`);
			}

			if (data.duplicates && data.duplicates > 0) {
				const dupes = data.duplicatesList?.join(", ") || "";
				toast.warning(`${data.duplicates} duplicate(s) skipped${dupes ? `: ${dupes}` : ""}`);
			}

			if (data.imported === 0 && data.totalProcessed > 0 && !data.failedFile) {
				toast.error("No site names were imported. Please check your XLSX file.");
			}

			if (data.failedFile && data.failedCount && data.failedCount > 0) {
				toast.error(`${data.failedCount} of ${data.totalProcessed} entries failed to import`);
				downloadFailedImportFile(data.failedFile, "failed-sitenames.xlsx");
			}

			queryClient.invalidateQueries({ queryKey: ["site-names"] });
			handleClose();
		},
		onError: (error: any) => {
			const responseData = error?.response?.data;
			if (responseData?.failedCount !== undefined || responseData?.totalProcessed !== undefined) {
				const imported = responseData.imported ?? 0;
				const failed = responseData.failedCount ?? 0;
				const total = responseData.totalProcessed ?? failed;
				toast.error(`${imported} of ${total} imported — ${failed} failed`);
				if (responseData.failedFile) {
					downloadFailedImportFile(responseData.failedFile, "failed-sitenames.xlsx");
				}
			} else {
				toast.error("Failed to import site names. Please try again.");
			}
		},
	});

	const handleClose = () => {
		setSelectedFile(null);
		onOpenChange(false);
	};

	const isXlsxFile = (file: File) =>
		file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.endsWith(".xlsx");

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (!isXlsxFile(file)) {
				toast.error("Please select an XLSX file");
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
			if (!isXlsxFile(file)) {
				toast.error("Please select an XLSX file");
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

	const handleDownloadTemplate = async () => {
		setDownloadingTemplate(true);
		try {
			await siteNameService.downloadImportTemplate();
		} catch {
			toast.error("Failed to download template");
		} finally {
			setDownloadingTemplate(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Import Site Names</DialogTitle>
					<DialogDescription>Upload an XLSX file to bulk import site names</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Download Template */}
					<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
						<div>
							<p className="text-sm font-medium">Download XLSX Template</p>
							<p className="text-xs text-muted-foreground">Use the template to format your data correctly</p>
						</div>
						<Button variant="outline" size="sm" onClick={handleDownloadTemplate} disabled={downloadingTemplate}>
							{downloadingTemplate ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Download className="h-4 w-4 mr-2" />
							)}
							Template
						</Button>
					</div>

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
							accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
								<p className="text-sm text-muted-foreground">Drag and drop an XLSX file here, or click to browse</p>
							</div>
						)}
					</div>

					{/* XLSX Format Info */}
					<div className="rounded-md bg-muted/50 p-3 text-sm">
						<p className="font-medium mb-1">XLSX Format</p>
						<p className="text-muted-foreground text-xs">
							<strong>Required:</strong> site_name
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleImport} disabled={!selectedFile || importMutation.isPending}>
						{importMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Import Site Names
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
