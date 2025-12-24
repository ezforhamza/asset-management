import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Company } from "#/entity";
import qrService from "@/api/services/qrService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface CreateQRModalProps {
	open: boolean;
	onClose: () => void;
	companies: Company[];
}

interface FormValues {
	qrCode: string;
	companyId?: string;
}

export function CreateQRModal({ open, onClose, companies }: CreateQRModalProps) {
	const queryClient = useQueryClient();

	const form = useForm<FormValues>({
		defaultValues: {
			qrCode: "",
			companyId: "none",
		},
	});

	const mutation = useMutation({
		mutationFn: (data: FormValues) =>
			qrService.createQRCode({
				qrCode: data.qrCode.trim(),
				companyId: data.companyId === "none" ? undefined : data.companyId,
			}),
		onSuccess: () => {
			toast.success("QR code created successfully");
			queryClient.invalidateQueries({ queryKey: ["qr"] });
			form.reset();
			onClose();
		},
	});

	const handleSubmit = (values: FormValues) => {
		mutation.mutate(values);
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create QR Code</DialogTitle>
					<DialogDescription>Create a new QR code. Optionally allocate it to a company.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="qrCode"
							rules={{
								required: "QR code is required",
								validate: (value) => value.trim().length > 0 || "QR code cannot be empty or whitespace only",
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>QR Code *</FormLabel>
									<FormControl>
										<Input placeholder="QR-2024-001" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="companyId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Company (Optional)</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select company to allocate" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="none">No Company (Available)</SelectItem>
											{companies.map((company) => (
												<SelectItem key={company._id} value={company._id}>
													{company.companyName}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
								Cancel
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? "Creating..." : "Create QR Code"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
