import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import companyService from "@/api/services/companyService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Textarea } from "@/ui/textarea";

interface AssetTemplate {
	_id: string;
	name: string;
	description: string;
	verificationFrequency: number;
	checklistItems: string[];
	assetCount: number;
}

interface TemplateFormValues {
	name: string;
	description: string;
	verificationFrequency: number;
	checklistItems: string;
}

export function AssetTemplates() {
	const queryClient = useQueryClient();
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [deleteTemplate, setDeleteTemplate] = useState<AssetTemplate | null>(null);

	const { data: templates, isLoading } = useQuery({
		queryKey: ["asset-templates"],
		queryFn: companyService.getAssetTemplates,
	});

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
			queryClient.invalidateQueries({ queryKey: ["asset-templates"] });
			setCreateModalOpen(false);
			form.reset();
		},
		onError: () => {
			toast.error("Failed to create template");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: companyService.deleteAssetTemplate,
		onSuccess: () => {
			toast.success("Template deleted");
			queryClient.invalidateQueries({ queryKey: ["asset-templates"] });
			setDeleteTemplate(null);
		},
		onError: () => {
			toast.error("Failed to delete template");
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

	const templateList = templates || [];

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<CheckSquare className="h-5 w-5" />
								Asset Templates
							</CardTitle>
							<CardDescription>Create templates with verification checklists for different asset types</CardDescription>
						</div>
						<Button onClick={() => setCreateModalOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							New Template
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-20 w-full" />
							))}
						</div>
					) : templateList.length === 0 ? (
						<div className="text-center py-8">
							<CheckSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
							<p className="text-muted-foreground">No templates created yet</p>
							<p className="text-sm text-muted-foreground">Create a template to standardize verification checklists</p>
						</div>
					) : (
						<div className="space-y-3">
							{templateList.map((template) => (
								<div key={template._id} className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<h4 className="font-medium">{template.name}</h4>
											<Badge variant="outline">{template.verificationFrequency} days</Badge>
										</div>
										<p className="text-sm text-muted-foreground mb-2">{template.description}</p>
										<div className="flex flex-wrap gap-1">
											{template.checklistItems.slice(0, 3).map((item, idx) => (
												<Badge key={idx} variant="secondary" className="text-xs">
													{item}
												</Badge>
											))}
											{template.checklistItems.length > 3 && (
												<Badge variant="secondary" className="text-xs">
													+{template.checklistItems.length - 3} more
												</Badge>
											)}
										</div>
									</div>
									<div className="flex items-center gap-4">
										<div className="text-right">
											<p className="text-sm font-medium">{template.assetCount}</p>
											<p className="text-xs text-muted-foreground">assets</p>
										</div>
										<Button variant="ghost" size="icon" onClick={() => setDeleteTemplate(template)}>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create Template Modal */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Create Asset Template</DialogTitle>
						<DialogDescription>Define a template with verification checklist for a type of asset</DialogDescription>
					</DialogHeader>
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
											<Input
												type="number"
												min={1}
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value))}
											/>
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

							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
									Cancel
								</Button>
								<Button type="submit" disabled={createMutation.isPending}>
									{createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
									Create Template
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Modal */}
			<Dialog open={!!deleteTemplate} onOpenChange={() => setDeleteTemplate(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Template</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{deleteTemplate?.name}"? This will not affect existing assets.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteTemplate(null)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => deleteTemplate && deleteMutation.mutate(deleteTemplate._id)}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							Delete Template
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
