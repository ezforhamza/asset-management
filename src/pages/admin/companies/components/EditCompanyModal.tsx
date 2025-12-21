import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Company } from "#/entity";
import adminService from "@/api/services/adminService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

interface EditCompanyModalProps {
	company: Company | null;
	open: boolean;
	onClose: () => void;
}

interface FormValues {
	companyName: string;
	contactEmail: string;
}

export function EditCompanyModal({ company, open, onClose }: EditCompanyModalProps) {
	const queryClient = useQueryClient();

	const form = useForm<FormValues>({
		defaultValues: {
			companyName: "",
			contactEmail: "",
		},
	});

	useEffect(() => {
		if (company) {
			form.reset({
				companyName: company.companyName || "",
				contactEmail: company.contactEmail || "",
			});
		}
	}, [company, form]);

	const mutation = useMutation({
		mutationFn: (data: FormValues) => adminService.updateCompany(company!._id, data),
		onSuccess: () => {
			toast.success("Company updated successfully");
			queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
			onClose();
		},
		onError: () => {
			toast.error("Failed to update company");
		},
	});

	const handleSubmit = (values: FormValues) => {
		mutation.mutate(values);
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Company</DialogTitle>
					<DialogDescription>Update company information.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="companyName"
							rules={{ required: "Company name is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Company Name *</FormLabel>
									<FormControl>
										<Input placeholder="Enter company name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="contactEmail"
							rules={{
								required: "Email is required",
								pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contact Email *</FormLabel>
									<FormControl>
										<Input type="email" placeholder="admin@company.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Save Changes
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
