import type { Event } from "~/db/schema";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "../ui/sheet";
import { EditEventForm } from "./edit-event-form";

interface EditEventSheetProps {
	event:
		| (Event & {
				warrior?: { name: string } | null;
				defender?: { name: string } | null;
				match?: { name: string } | null;
		  })
		| null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function EditEventSheet({
	event,
	open,
	onOpenChange,
	onSuccess,
}: EditEventSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Edit Event</SheetTitle>
					<SheetDescription>
						Update the event details and injury information
					</SheetDescription>
				</SheetHeader>
				<div className="mt-6">
					{event && <EditEventForm event={event} onSuccess={onSuccess} />}
				</div>
			</SheetContent>
		</Sheet>
	);
}
