import { Checkbox } from "@/ui/checkbox";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Separator } from "@/ui/separator";
import { Textarea } from "@/ui/textarea";
import type { CoolingRepairFormData } from "@/api/services/repairRequestService";

interface CoolingRepairFormProps {
	value: CoolingRepairFormData;
	onChange: (value: CoolingRepairFormData) => void;
}

function BooleanCheckbox({
	label,
	checked,
	onCheckedChange,
}: {
	label: string;
	checked: boolean;
	onCheckedChange: (v: boolean) => void;
}) {
	return (
		<div className="flex items-start gap-2">
			<Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(!!v)} className="mt-0.5 shrink-0" />
			<span className="text-sm leading-snug">{label}</span>
		</div>
	);
}

export function CoolingRepairForm({ value, onChange }: CoolingRepairFormProps) {
	const set = <K extends keyof CoolingRepairFormData>(key: K, val: CoolingRepairFormData[K]) =>
		onChange({ ...value, [key]: val });

	const setComplaint = (key: keyof CoolingRepairFormData["complaints"], val: boolean) =>
		onChange({ ...value, complaints: { ...value.complaints, [key]: val } });

	const setTroubleshooting = <S extends keyof CoolingRepairFormData["troubleshooting"]>(
		section: S,
		key: keyof CoolingRepairFormData["troubleshooting"][S],
		val: boolean,
	) =>
		onChange({
			...value,
			troubleshooting: {
				...value.troubleshooting,
				[section]: { ...value.troubleshooting[section], [key]: val },
			},
		});

	return (
		<div className="space-y-5">
			<Separator />
			<p className="text-sm font-semibold text-foreground">Cooling Equipment Repair Form</p>

			{/* Top-level fields */}
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1">
					<Label>Branch Name *</Label>
					<Input
						value={value.branchName}
						onChange={(e) => set("branchName", e.target.value)}
						placeholder="Branch name"
					/>
				</div>
				<div className="space-y-1">
					<Label>Invoice Number *</Label>
					<Input
						value={value.invoiceNumber}
						onChange={(e) => set("invoiceNumber", e.target.value)}
						placeholder="INV-..."
					/>
				</div>
				<div className="space-y-1">
					<Label>Province *</Label>
					<Input value={value.province} onChange={(e) => set("province", e.target.value)} placeholder="Province" />
				</div>
				<div className="space-y-1">
					<Label>Contact Person On Site *</Label>
					<Input
						value={value.contactPersonOnSite}
						onChange={(e) => set("contactPersonOnSite", e.target.value)}
						placeholder="Full name"
					/>
				</div>
				<div className="space-y-1">
					<Label>Contact Number On Site *</Label>
					<Input
						value={value.contactNumberOnSite}
						onChange={(e) => set("contactNumberOnSite", e.target.value)}
						placeholder="Phone number"
					/>
				</div>
				<div className="space-y-1">
					<Label>Trading Hours *</Label>
					<div className="flex items-center gap-2">
						<Input
							type="time"
							value={value.tradingHoursStart}
							onChange={(e) => set("tradingHoursStart", e.target.value)}
							className="flex-1"
						/>
						<span className="text-sm text-muted-foreground">to</span>
						<Input
							type="time"
							value={value.tradingHoursEnd}
							onChange={(e) => set("tradingHoursEnd", e.target.value)}
							className="flex-1"
						/>
					</div>
				</div>
			</div>

			<div className="space-y-1">
				<Label>Problem Description *</Label>
				<Textarea
					value={value.problem}
					onChange={(e) => set("problem", e.target.value)}
					placeholder="Describe the problem..."
					rows={2}
				/>
			</div>
			<div className="space-y-1">
				<Label>General Information *</Label>
				<Textarea
					value={value.generalInformation}
					onChange={(e) => set("generalInformation", e.target.value)}
					placeholder="Any additional information about the unit or store..."
					rows={2}
				/>
			</div>

			<BooleanCheckbox
				label="Tech must call before attending the site"
				checked={value.techCallBeforeAttending}
				onCheckedChange={(v) => set("techCallBeforeAttending", v)}
			/>

			{/* Complaints */}
			<div className="space-y-2">
				<p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Complaints</p>
				<div className="space-y-2 pl-1">
					<BooleanCheckbox
						label="Lights not working"
						checked={value.complaints.lightsNotWorking}
						onCheckedChange={(v) => setComplaint("lightsNotWorking", v)}
					/>
					<BooleanCheckbox
						label="Fan not turning"
						checked={value.complaints.fanNotTurning}
						onCheckedChange={(v) => setComplaint("fanNotTurning", v)}
					/>
					<BooleanCheckbox
						label="Cooler tripping the power"
						checked={value.complaints.coolerTrippingPower}
						onCheckedChange={(v) => setComplaint("coolerTrippingPower", v)}
					/>
					<BooleanCheckbox
						label="Cooler not cooling, but the compressor is running"
						checked={value.complaints.coolerNotCoolingCompressorRunning}
						onCheckedChange={(v) => setComplaint("coolerNotCoolingCompressorRunning", v)}
					/>
					<BooleanCheckbox
						label="Doors not closing"
						checked={value.complaints.doorsNotClosing}
						onCheckedChange={(v) => setComplaint("doorsNotClosing", v)}
					/>
					<BooleanCheckbox
						label="Cooler leaking WATER on the bottom"
						checked={value.complaints.coolerLeakingWaterBottom}
						onCheckedChange={(v) => setComplaint("coolerLeakingWaterBottom", v)}
					/>
					<BooleanCheckbox
						label="Cooler leaking WATER on the inside"
						checked={value.complaints.coolerLeakingWaterInside}
						onCheckedChange={(v) => setComplaint("coolerLeakingWaterInside", v)}
					/>
				</div>
			</div>

			{/* Troubleshooting */}
			<div className="space-y-4">
				<p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Troubleshooting</p>

				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground">Doors Not Sliding Closed</p>
					<div className="space-y-2 pl-1">
						<BooleanCheckbox
							label="Cooler is installed on a level surface"
							checked={value.troubleshooting.doorsNotSlidingClosed.installedOnLevelSurface}
							onCheckedChange={(v) => setTroubleshooting("doorsNotSlidingClosed", "installedOnLevelSurface", v)}
						/>
						<BooleanCheckbox
							label="Doors are moving freely (not off the rail)"
							checked={value.troubleshooting.doorsNotSlidingClosed.doorsMovingFreely}
							onCheckedChange={(v) => setTroubleshooting("doorsNotSlidingClosed", "doorsMovingFreely", v)}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground">Not Cooling / Blowing Hot Air</p>
					<div className="space-y-2 pl-1">
						<BooleanCheckbox
							label="Sufficient space (18mm) between wall and back of cooler"
							checked={value.troubleshooting.notCoolingBlowingHotAir.sufficientSpaceBehindCooler}
							onCheckedChange={(v) => setTroubleshooting("notCoolingBlowingHotAir", "sufficientSpaceBehindCooler", v)}
						/>
						<BooleanCheckbox
							label="Product (crates, merchandise) blocking airflow front or rear"
							checked={value.troubleshooting.notCoolingBlowingHotAir.productBlockingAirflow}
							onCheckedChange={(v) => setTroubleshooting("notCoolingBlowingHotAir", "productBlockingAirflow", v)}
						/>
						<BooleanCheckbox
							label="Condenser is blocked / not cleaned in last 3–6 months"
							checked={value.troubleshooting.notCoolingBlowingHotAir.condenserBlocked}
							onCheckedChange={(v) => setTroubleshooting("notCoolingBlowingHotAir", "condenserBlocked", v)}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground">Ice Building on Evaporator Coil</p>
					<div className="space-y-2 pl-1">
						<BooleanCheckbox
							label="Shelves installed at equal intervals"
							checked={value.troubleshooting.iceBuildingOnEvaporatorCoil.shelvesAtEqualIntervals}
							onCheckedChange={(v) => setTroubleshooting("iceBuildingOnEvaporatorCoil", "shelvesAtEqualIntervals", v)}
						/>
						<BooleanCheckbox
							label="Shelves installed with protective lip towards back of cooler"
							checked={value.troubleshooting.iceBuildingOnEvaporatorCoil.shelvesWithProtectiveLip}
							onCheckedChange={(v) => setTroubleshooting("iceBuildingOnEvaporatorCoil", "shelvesWithProtectiveLip", v)}
						/>
						<BooleanCheckbox
							label="Cold air able to flow freely (no blister packs / 6-pack plastic blocking)"
							checked={value.troubleshooting.iceBuildingOnEvaporatorCoil.coldAirFlowingFreely}
							onCheckedChange={(v) => setTroubleshooting("iceBuildingOnEvaporatorCoil", "coldAirFlowingFreely", v)}
						/>
						<BooleanCheckbox
							label="Customer adjusted thermostat — can it be set to 2 again?"
							checked={value.troubleshooting.iceBuildingOnEvaporatorCoil.customerAdjustedThermostat}
							onCheckedChange={(v) =>
								setTroubleshooting("iceBuildingOnEvaporatorCoil", "customerAdjustedThermostat", v)
							}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground">Cooler Tripping Power</p>
					<div className="space-y-2 pl-1">
						<BooleanCheckbox
							label="Adequate power supplied (220V per manual)"
							checked={value.troubleshooting.coolerTrippingPower.adequatePowerSupplied}
							onCheckedChange={(v) => setTroubleshooting("coolerTrippingPower", "adequatePowerSupplied", v)}
						/>
						<BooleanCheckbox
							label="Cooler plugged directly into wall"
							checked={value.troubleshooting.coolerTrippingPower.pluggedDirectlyIntoWall}
							onCheckedChange={(v) => setTroubleshooting("coolerTrippingPower", "pluggedDirectlyIntoWall", v)}
						/>
						<BooleanCheckbox
							label="Cooler plugged into multi-plug shared with other equipment"
							checked={value.troubleshooting.coolerTrippingPower.pluggedIntoMultiPlug}
							onCheckedChange={(v) => setTroubleshooting("coolerTrippingPower", "pluggedIntoMultiPlug", v)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
