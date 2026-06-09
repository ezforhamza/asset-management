import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { CoolingRepairFormData } from "@/api/services/repairRequestService";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";
import { cn } from "@/utils";

const SA_PROVINCES = [
	"Eastern Cape",
	"Free State",
	"Gauteng",
	"KwaZulu-Natal",
	"Limpopo",
	"Mpumalanga",
	"Northern Cape",
	"North West",
	"Western Cape",
];

interface CoolingRepairFormProps {
	value: CoolingRepairFormData;
	onChange: (value: CoolingRepairFormData) => void;
}

function CollapsibleCard({
	title,
	defaultOpen = false,
	children,
}: {
	title: string;
	defaultOpen?: boolean;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<div className="border rounded-lg overflow-hidden">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
			>
				<div className="flex items-center gap-3">
					<span className="w-1 h-4 bg-orange-500 rounded-sm shrink-0" />
					<span className="font-semibold text-sm">{title}</span>
				</div>
				{open ? (
					<ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
				) : (
					<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
				)}
			</button>
			{open && <div className="px-4 pb-4 space-y-1">{children}</div>}
		</div>
	);
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	return (
		<Input
			type="time"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onClick={(e) => {
				const input = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
				input.showPicker?.();
			}}
			className="cursor-pointer"
		/>
	);
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
	return (
		<div className="flex gap-1.5 shrink-0">
			<button
				type="button"
				onClick={() => onChange(true)}
				className={cn(
					"px-3 py-1 text-xs rounded-md font-medium transition-colors border",
					value === true
						? "bg-green-500 text-white border-green-500"
						: "bg-transparent text-muted-foreground border-border hover:bg-muted/50",
				)}
			>
				Yes
			</button>
			<button
				type="button"
				onClick={() => onChange(false)}
				className={cn(
					"px-3 py-1 text-xs rounded-md font-medium transition-colors border",
					value === false
						? "bg-red-500 text-white border-red-500"
						: "bg-transparent text-muted-foreground border-border hover:bg-muted/50",
				)}
			>
				No
			</button>
		</div>
	);
}

function QuestionRow({
	label,
	value,
	onChange,
}: {
	label: string;
	value: boolean | null;
	onChange: (v: boolean) => void;
}) {
	return (
		<div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-0">
			<span className="text-sm leading-snug text-foreground flex-1">{label}</span>
			<YesNo value={value} onChange={onChange} />
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
			troubleshooting: { ...value.troubleshooting, [section]: { ...value.troubleshooting[section], [key]: val } },
		});

	return (
		<div className="space-y-2">
			<CollapsibleCard title="Store Details" defaultOpen>
				<div className="space-y-3 pt-1">
					<div className="space-y-1">
						<Label className="text-xs">Sitename *</Label>
						<Input
							value={value.branchName}
							onChange={(e) => set("branchName", e.target.value)}
							placeholder="Site name"
						/>
					</div>
					<div className="space-y-1">
						<Label className="text-xs">Province *</Label>
						<Select value={value.province} onValueChange={(v) => set("province", v)}>
							<SelectTrigger>
								<SelectValue placeholder="Select province" />
							</SelectTrigger>
							<SelectContent>
								{SA_PROVINCES.map((p) => (
									<SelectItem key={p} value={p}>
										{p}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1">
						<Label className="text-xs">Contact Person On-Site *</Label>
						<Input
							value={value.contactPersonOnSite}
							onChange={(e) => set("contactPersonOnSite", e.target.value)}
							placeholder="Contact Person On-Site"
						/>
					</div>
					<div className="space-y-1">
						<Label className="text-xs">Contact Number On-Site</Label>
						<Input
							value={value.contactNumberOnSite}
							onChange={(e) => set("contactNumberOnSite", e.target.value)}
							placeholder="Enter contact number if not auto-filled"
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label className="text-xs">Trading Hours Start *</Label>
							<TimeInput value={value.tradingHoursStart} onChange={(v) => set("tradingHoursStart", v)} />
						</div>
						<div className="space-y-1">
							<Label className="text-xs">Trading Hours End *</Label>
							<TimeInput value={value.tradingHoursEnd} onChange={(v) => set("tradingHoursEnd", v)} />
						</div>
					</div>
				</div>
			</CollapsibleCard>

			<CollapsibleCard title="Problem">
				<div className="space-y-3 pt-1">
					<div className="space-y-1">
						<Label className="text-xs">Describe the problem *</Label>
						<Textarea
							value={value.problem}
							onChange={(e) => set("problem", e.target.value)}
							placeholder="Describe the problem"
							rows={3}
						/>
					</div>
					<div className="space-y-1">
						<Label className="text-xs">Additional Information *</Label>
						<Textarea
							value={value.generalInformation}
							onChange={(e) => set("generalInformation", e.target.value)}
							placeholder="Additional Information"
							rows={3}
						/>
					</div>
				</div>
			</CollapsibleCard>

			<CollapsibleCard title="Technician Attendance">
				<QuestionRow
					label="Must the technician call before attending?"
					value={value.techCallBeforeAttending}
					onChange={(v) => set("techCallBeforeAttending", v)}
				/>
			</CollapsibleCard>

			<CollapsibleCard title="Complaints">
				<QuestionRow
					label="Are the lights working?"
					value={value.complaints.lightsNotWorking}
					onChange={(v) => setComplaint("lightsNotWorking", v)}
				/>
				<QuestionRow
					label="Is the fan turning on?"
					value={value.complaints.fanNotTurning}
					onChange={(v) => setComplaint("fanNotTurning", v)}
				/>
				<QuestionRow
					label="Is the cooler tripping the power?"
					value={value.complaints.coolerTrippingPower}
					onChange={(v) => setComplaint("coolerTrippingPower", v)}
				/>
				<QuestionRow
					label="Is the cooler cooling properly while the compressor is running?"
					value={value.complaints.coolerNotCoolingCompressorRunning}
					onChange={(v) => setComplaint("coolerNotCoolingCompressorRunning", v)}
				/>
				<QuestionRow
					label="Are the doors closing properly?"
					value={value.complaints.doorsNotClosing}
					onChange={(v) => setComplaint("doorsNotClosing", v)}
				/>
				<QuestionRow
					label="Is water leaking from the bottom of the cooler?"
					value={value.complaints.coolerLeakingWaterBottom}
					onChange={(v) => setComplaint("coolerLeakingWaterBottom", v)}
				/>
				<QuestionRow
					label="Is water leaking inside the cooler?"
					value={value.complaints.coolerLeakingWaterInside}
					onChange={(v) => setComplaint("coolerLeakingWaterInside", v)}
				/>
			</CollapsibleCard>

			<CollapsibleCard title="Troubleshooting — Doors not sliding closed">
				<QuestionRow
					label="Is the cooler installed on a level surface?"
					value={value.troubleshooting.doorsNotSlidingClosed.installedOnLevelSurface}
					onChange={(v) => setTroubleshooting("doorsNotSlidingClosed", "installedOnLevelSurface", v)}
				/>
				<QuestionRow
					label="Are the doors moving freely, not off the rail?"
					value={value.troubleshooting.doorsNotSlidingClosed.doorsMovingFreely}
					onChange={(v) => setTroubleshooting("doorsNotSlidingClosed", "doorsMovingFreely", v)}
				/>
			</CollapsibleCard>

			<CollapsibleCard title="Troubleshooting — Not cooling / blowing hot air">
				<QuestionRow
					label="Is there sufficient space (18mm) between the wall and the back of the cooler?"
					value={value.troubleshooting.notCoolingBlowingHotAir.sufficientSpaceBehindCooler}
					onChange={(v) => setTroubleshooting("notCoolingBlowingHotAir", "sufficientSpaceBehindCooler", v)}
				/>
				<QuestionRow
					label="Is any product (crates, merchandise) blocking the airflow front or rear?"
					value={value.troubleshooting.notCoolingBlowingHotAir.productBlockingAirflow}
					onChange={(v) => setTroubleshooting("notCoolingBlowingHotAir", "productBlockingAirflow", v)}
				/>
				<QuestionRow
					label="Is the condenser blocked?"
					value={value.troubleshooting.notCoolingBlowingHotAir.condenserBlocked}
					onChange={(v) => setTroubleshooting("notCoolingBlowingHotAir", "condenserBlocked", v)}
				/>
			</CollapsibleCard>

			<CollapsibleCard title="Troubleshooting — Ice building on evaporator coil">
				<QuestionRow
					label="Are the shelves installed at equal intervals?"
					value={value.troubleshooting.iceBuildingOnEvaporatorCoil.shelvesAtEqualIntervals}
					onChange={(v) => setTroubleshooting("iceBuildingOnEvaporatorCoil", "shelvesAtEqualIntervals", v)}
				/>
				<QuestionRow
					label="Are all shelves installed correctly?"
					value={value.troubleshooting.iceBuildingOnEvaporatorCoil.shelvesWithProtectiveLip}
					onChange={(v) => setTroubleshooting("iceBuildingOnEvaporatorCoil", "shelvesWithProtectiveLip", v)}
				/>
				<QuestionRow
					label="Is the cold air able to flow freely (no product or object blocking the airflow inside the unit)?"
					value={value.troubleshooting.iceBuildingOnEvaporatorCoil.coldAirFlowingFreely}
					onChange={(v) => setTroubleshooting("iceBuildingOnEvaporatorCoil", "coldAirFlowingFreely", v)}
				/>
				<QuestionRow
					label="Is the thermostat set to the recommended temperature?"
					value={value.troubleshooting.iceBuildingOnEvaporatorCoil.customerAdjustedThermostat}
					onChange={(v) => {
						setTroubleshooting("iceBuildingOnEvaporatorCoil", "customerAdjustedThermostat", v);
						if (!v) {
							onChange({
								...value,
								troubleshooting: {
									...value.troubleshooting,
									iceBuildingOnEvaporatorCoil: {
										...value.troubleshooting.iceBuildingOnEvaporatorCoil,
										customerAdjustedThermostat: false,
										canThermostatBeSetTo2: null,
									},
								},
							});
						}
					}}
				/>
				{value.troubleshooting.iceBuildingOnEvaporatorCoil.customerAdjustedThermostat && (
					<QuestionRow
						label="Can the thermostat be set to 2 again?"
						value={value.troubleshooting.iceBuildingOnEvaporatorCoil.canThermostatBeSetTo2 ?? null}
						onChange={(v) => setTroubleshooting("iceBuildingOnEvaporatorCoil", "canThermostatBeSetTo2", v)}
					/>
				)}
			</CollapsibleCard>

			<CollapsibleCard title="Troubleshooting — Cooler tripping power">
				<QuestionRow
					label="Is there adequate power supplied to the cooler (220V)?"
					value={value.troubleshooting.coolerTrippingPower.adequatePowerSupplied}
					onChange={(v) => setTroubleshooting("coolerTrippingPower", "adequatePowerSupplied", v)}
				/>
				<QuestionRow
					label="Is the cooler plugged directly into the wall?"
					value={value.troubleshooting.coolerTrippingPower.pluggedDirectlyIntoWall}
					onChange={(v) => setTroubleshooting("coolerTrippingPower", "pluggedDirectlyIntoWall", v)}
				/>
				<QuestionRow
					label="Is the cooler plugged into a multi-plug shared with other equipment?"
					value={value.troubleshooting.coolerTrippingPower.pluggedIntoMultiPlug}
					onChange={(v) => setTroubleshooting("coolerTrippingPower", "pluggedIntoMultiPlug", v)}
				/>
			</CollapsibleCard>
		</div>
	);
}
