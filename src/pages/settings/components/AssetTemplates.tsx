import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import companyService from "@/api/services/companyService";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

interface TemplateFormValues {
	name: string;
	description: string;
	verificationFrequency: number;
	checklistItems: string;
}

export function AssetTemplates() {
	const form = useForm<TemplateFormValues>({
		defaultValues: {
			name: "",
			description: "",
			verificationFrequency: 30,
			checklistItems: "",
		},
	});

	const createMutation = useMutation({
		mutationFn: companyService.createAssetTemplate,
		onSuccess: () => {
			toast.success("Template created successfully");
			form.reset();
		},
		onError: () => {
			toast.error("Failed to create template");
		},
	});

	const handleCreate = (values: TemplateFormValues) => {
		const checklistItems = values.checklistItems
			.split("\n")
			.map((item) => item.trim())
			.filter((item) => item.length > 0);

		createMutation.mutate({
			name: values.name,
			description: values.description,
			verificationFrequency: values.verificationFrequency,
			checklistItems,
		});
	};

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				Create templates with verification checklists for different asset types
			</p>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						rules={{ required: "Template name is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Template Name</FormLabel>
								<FormControl>
									<Input placeholder="e.g., Heavy Excavator" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Input placeholder="Brief description of this asset type" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="verificationFrequency"
						rules={{ required: "Frequency is required", min: 1 }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Verification Frequency (days)</FormLabel>
								<FormControl>
									<Input type="number" min={1} {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="checklistItems"
						rules={{ required: "At least one checklist item is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Verification Checklist</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Enter checklist items (one per line)&#10;e.g.:&#10;Check oil level&#10;Inspect hydraulic hoses&#10;Test emergency stop"
										rows={5}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" disabled={createMutation.isPending}>
						{createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
						Create Template
					</Button>
				</form>
			</Form>
		</div>
	);
}
