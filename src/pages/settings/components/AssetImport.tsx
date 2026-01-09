import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Check, Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import assetService from "@/api/services/assetService";
import { Alert, AlertDescription } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Progress } from "@/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface ImportResult {
	success: boolean;
	imported: number;
	duplicates?: number;
	duplicatesList?: string[];
	errors: string[];
	totalProcessed: number;
}

interface ParsedAsset {
	serialNumber: string;
	make: string;
	model: string;
	verificationFrequency?: number;
	location?: string;
	notes?: string;
}

export function AssetImport() {
	const queryClient = useQueryClient();
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<ParsedAsset[]>([]);
	const [importResult, setImportResult] = useState<ImportResult | null>(null);
	const [dragActive, setDragActive] = useState(false);

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
			toast.error("Failed to import assets");
		},
	});

	const parseCSV = useCallback((text: string): ParsedAsset[] => {
		const lines = text.trim().split("\n");
		if (lines.length < 2) return [];

		const headers = lines[0]
			.toLowerCase()
			.split(",")
			.map((h) => h.trim());
		const assets: ParsedAsset[] = [];

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(",").map((v) => v.trim());
			const asset: ParsedAsset = {
				serialNumber: "",
				make: "",
				model: "",
			};

			headers.forEach((header, idx) => {
				const value = values[idx] || "";
				switch (header) {
					case "serial_number":
					case "serialnumber":
					case "serial":
						asset.serialNumber = value;
						break;
					case "make":
					case "manufacturer":
						asset.make = value;
						break;
					case "model":
						asset.model = value;
						break;
					case "verification_frequency":
					case "frequency":
						asset.verificationFrequency = parseInt(value) || undefined;
						break;
					case "location":
						asset.location = value;
						break;
					case "notes":
						asset.notes = value;
						break;
				}
			});

			if (asset.serialNumber && asset.make && asset.model) {
				assets.push(asset);
			}
		}

		return assets;
	}, []);

	const handleFileChange = useCallback(
		(selectedFile: File | null) => {
			setFile(selectedFile);
			setImportResult(null);
			setPreview([]);

			if (selectedFile) {
				const reader = new FileReader();
				reader.onload = (e) => {
					const text = e.target?.result as string;
					const parsed = parseCSV(text);
					setPreview(parsed.slice(0, 5)); // Show first 5 rows
				};
				reader.readAsText(selectedFile);
			}
		},
		[parseCSV],
	);

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

			if (e.dataTransfer.files && e.dataTransfer.files[0]) {
				const droppedFile = e.dataTransfer.files[0];
				if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
					handleFileChange(droppedFile);
				} else {
					toast.error("Please upload a CSV file");
				}
			}
		},
		[handleFileChange],
	);

	const handleImport = () => {
		if (!file) return;
		importMutation.mutate(file);
	};

	const downloadTemplate = () => {
		const template = `serial_number,make,model,verification_frequency,location,notes
SN-001234,Caterpillar,320D,30,Site A,Heavy excavator
SN-001235,Komatsu,PC200,14,Site B,Mini excavator
SN-001236,John Deere,310L,7,Warehouse,Backhoe loader`;

		const blob = new Blob([template], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "asset_import_template.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	const clearFile = () => {
		setFile(null);
		setPreview([]);
		setImportResult(null);
	};

	return (
		<div className="space-y-4">
			{/* Download Template */}
			<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
				<div>
					<p className="text-sm font-medium">Download CSV Template</p>
					<p className="text-xs text-muted-foreground">Use this template to format your asset data correctly</p>
				</div>
				<Button variant="outline" size="sm" onClick={downloadTemplate}>
					<Download className="h-4 w-4 mr-2" />
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
					<p className="text-sm font-medium mb-1">Drag and drop your CSV file here</p>
					<p className="text-xs text-muted-foreground mb-4">or click to browse</p>
					<input
						type="file"
						accept=".csv"
						className="hidden"
						id="csv-upload"
						onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
					/>
					<Button variant="outline" asChild>
						<label htmlFor="csv-upload" className="cursor-pointer">
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
								<p className="text-xs text-muted-foreground">
									{(file.size / 1024).toFixed(1)} KB • {preview.length}+ assets detected
								</p>
							</div>
						</div>
						<Button variant="ghost" size="icon" onClick={clearFile}>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* Preview Table */}
					{preview.length > 0 && (
						<div className="rounded-md border overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Serial Number</TableHead>
										<TableHead>Make</TableHead>
										<TableHead>Model</TableHead>
										<TableHead>Frequency</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{preview.map((asset, idx) => (
										<TableRow key={idx}>
											<TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
											<TableCell>{asset.make}</TableCell>
											<TableCell>{asset.model}</TableCell>
											<TableCell>{asset.verificationFrequency || 30} days</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							{preview.length === 5 && (
								<div className="p-2 bg-muted/50 text-center text-xs text-muted-foreground">Showing first 5 rows...</div>
							)}
						</div>
					)}

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
						<Button onClick={handleImport} disabled={importMutation.isPending || preview.length === 0}>
							{importMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Import {preview.length}+ Assets
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
