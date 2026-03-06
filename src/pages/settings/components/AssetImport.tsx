import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Check, Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import assetService from "@/api/services/assetService";
import { Alert, AlertDescription } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Progress } from "@/ui/progress";

interface ImportResult {
	success: boolean;
	imported: number;
	duplicates?: number;
	duplicatesList?: string[];
	errors: string[];
	totalProcessed: number;
}

const isXlsxFile = (f: File) =>
	f.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || f.name.endsWith(".xlsx");

export function AssetImport() {
	const queryClient = useQueryClient();
	const [file, setFile] = useState<File | null>(null);
	const [importResult, setImportResult] = useState<ImportResult | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const [downloadingTemplate, setDownloadingTemplate] = useState(false);

	const importMutation = useMutation({
		mutationFn: assetService.bulkImportAssets,
		onSuccess: (result) => {
			setImportResult(result);
			if (result.imported > 0) {
				toast.success(`Successfully imported ${result.imported} of ${result.totalProcessed} assets`);
				queryClient.invalidateQueries({ queryKey: ["assets"] });
			}
			if (result.duplicates && result.duplicates > 0) {
				toast.warning(`${result.duplicates} duplicate(s) skipped`);
			}
			if (result.errors && result.errors.length > 0) {
				const otherErrors = result.errors.filter((e) => !e.includes("Duplicate"));
				if (otherErrors.length > 0) {
					toast.error(`${otherErrors.length} asset(s) failed to import`);
				}
			}
		},
		onError: () => {
			// Error toast is handled by apiClient;
		},
	});

	const handleFileChange = useCallback((selectedFile: File | null) => {
		setFile(selectedFile);
		setImportResult(null);
	}, []);

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);

			if (e.dataTransfer.files?.[0]) {
				const droppedFile = e.dataTransfer.files[0];
				if (isXlsxFile(droppedFile)) {
					handleFileChange(droppedFile);
				} else {
					toast.error("Please upload an XLSX file");
				}
			}
		},
		[handleFileChange],
	);

	const handleImport = () => {
		if (!file) return;
		importMutation.mutate(file);
	};

	const downloadTemplate = async () => {
		setDownloadingTemplate(true);
		try {
			await assetService.downloadImportTemplate();
		} catch {
			toast.error("Failed to download template");
		} finally {
			setDownloadingTemplate(false);
		}
	};

	const clearFile = () => {
		setFile(null);
		setImportResult(null);
	};

	return (
		<div className="space-y-4">
			{/* Download Template */}
			<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
				<div>
					<p className="text-sm font-medium">Download XLSX Template</p>
					<p className="text-xs text-muted-foreground">Use this template to format your asset data correctly</p>
				</div>
				<Button variant="outline" size="sm" onClick={downloadTemplate} disabled={downloadingTemplate}>
					{downloadingTemplate ? (
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
					) : (
						<Download className="h-4 w-4 mr-2" />
					)}
					Template
				</Button>
			</div>

			{/* File Upload Area */}
			{!file ? (
				<div
					className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
						dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
					}`}
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}
				>
					<Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
					<p className="text-sm font-medium mb-1">Drag and drop your XLSX file here</p>
					<p className="text-xs text-muted-foreground mb-4">or click to browse</p>
					<input
						type="file"
						accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						className="hidden"
						id="xlsx-upload"
						onChange={(e) => {
							const f = e.target.files?.[0] || null;
							if (f && !isXlsxFile(f)) {
								toast.error("Please upload an XLSX file");
								return;
							}
							handleFileChange(f);
						}}
					/>
					<Button variant="outline" asChild>
						<label htmlFor="xlsx-upload" className="cursor-pointer">
							Select File
						</label>
					</Button>
				</div>
			) : (
				<div className="space-y-4">
					{/* File Info */}
					<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
						<div className="flex items-center gap-3">
							<FileSpreadsheet className="h-8 w-8 text-primary" />
							<div>
								<p className="text-sm font-medium">{file.name}</p>
								<p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
							</div>
						</div>
						<Button variant="ghost" size="icon" onClick={clearFile}>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* Import Progress */}
					{importMutation.isPending && (
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span className="text-sm">Importing assets...</span>
							</div>
							<Progress value={50} />
						</div>
					)}

					{/* Import Result */}
					{importResult && (
						<Alert variant={importResult.errors.length > 0 ? "destructive" : "default"}>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<div className="flex items-center gap-4">
									<span className="flex items-center gap-1">
										<Check className="h-4 w-4 text-green-600" />
										{importResult.imported} imported
									</span>
									{importResult.duplicates && importResult.duplicates > 0 && (
										<span className="flex items-center gap-1 text-yellow-600">
											{importResult.duplicates} duplicate(s)
										</span>
									)}
									{importResult.errors.length > 0 && (
										<span className="flex items-center gap-1 text-destructive">
											<X className="h-4 w-4" />
											{importResult.errors.length} error(s)
										</span>
									)}
								</div>
								{importResult.errors.length > 0 && (
									<ul className="mt-2 text-xs space-y-1">
										{importResult.errors.slice(0, 3).map((err) => (
											<li key={err}>{err}</li>
										))}
									</ul>
								)}
							</AlertDescription>
						</Alert>
					)}

					{/* Import Button */}
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={clearFile}>
							Cancel
						</Button>
						<Button onClick={handleImport} disabled={importMutation.isPending}>
							{importMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Import Assets
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
