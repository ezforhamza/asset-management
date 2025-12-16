import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";

interface BulkImportModalProps {
	open: boolean;
	onClose: () => void;
}

interface ImportResult {
	imported: number;
	duplicates: number;
	errors: string[];
}

export function BulkImportModal({ open, onClose }: BulkImportModalProps) {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [result, setResult] = useState<ImportResult | null>(null);

	const mutation = useMutation({
		mutationFn: adminService.bulkImportQRCodes,
		onSuccess: (data) => {
			setResult(data);
			queryClient.invalidateQueries({ queryKey: ["admin", "qr-codes"] });
			toast.success(`Imported ${data.imported} QR codes`);
		},
		onError: () => {
			toast.error("Failed to import QR codes");
		},
	});

	const handleClose = () => {
		setFile(null);
		setResult(null);
		onClose();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) setFile(selectedFile);
	};

	const handleImport = () => {
		if (file) mutation.mutate(file);
	};

	// Show result
	if (result) {
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[450px]">
					<DialogHeader>
						<DialogTitle>Import Complete</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
								<p className="text-2xl font-bold text-green-600">{result.imported}</p>
								<p className="text-sm text-muted-foreground">Imported</p>
							</div>
							<div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg text-center">
								<p className="text-2xl font-bold text-orange-600">{result.duplicates}</p>
								<p className="text-sm text-muted-foreground">Duplicates</p>
							</div>
						</div>
						{result.errors.length > 0 && (
							<div className="p-3 bg-destructive/10 rounded-lg">
								<p className="text-sm font-medium text-destructive mb-1">Errors:</p>
								<ul className="text-sm text-muted-foreground list-disc list-inside">
									{result.errors.slice(0, 5).map((err, i) => (
										<li key={i}>{err}</li>
									))}
								</ul>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button onClick={handleClose}>Done</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Bulk Import QR Codes</DialogTitle>
					<DialogDescription>Upload a CSV file with QR codes to import.</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
					<div
						onClick={() => fileInputRef.current?.click()}
						className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-muted-foreground/25 hover:border-primary/50"
					>
						<FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
						<p className="text-sm font-medium">Click to select a CSV file</p>
						<p className="text-xs text-muted-foreground mt-1">or drag & drop</p>
					</div>
					{file && (
						<div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
							<Upload className="h-5 w-5 text-muted-foreground" />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{file.name}</p>
								<p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
							</div>
							<Button variant="ghost" size="icon" onClick={() => setFile(null)}>
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}
					<div className="text-xs text-muted-foreground">
						<p className="font-medium mb-1">CSV Format:</p>
						<code className="block p-2 bg-muted rounded text-xs">qrCode,companyId (optional)</code>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleImport} disabled={!file || mutation.isPending}>
						{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Import
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
