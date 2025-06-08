import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadFile, getFileIcon } from "@/lib/utils";

interface FileAttachmentProps {
    attachment: {
        type: string;
        filename: string;
        originalName: string;
    };
}

export function FileAttachment({ attachment }: FileAttachmentProps) {
    return (
        <div className="flex items-center gap-2 p-2 bg-secondary-foreground rounded">
            {getFileIcon(attachment.type)}
            <Tooltip>
                <TooltipTrigger asChild>
                <span className="text-sm truncate">{attachment.originalName}</span>
                </TooltipTrigger>
                <TooltipContent side="top">{attachment.originalName}</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadFile(attachment.filename, attachment.originalName)}
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Download</TooltipContent>
            </Tooltip>
        </div>
    );
}
