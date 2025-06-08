/* eslint-disable @next/next/no-img-element */
import { isImage, isVideo } from "@/lib/utils";
import { FileAttachment } from "./FileAttachment";
import { useImageExists } from "@/hooks/use-image-exists";

interface AttachmentPreviewProps {
  attachment: {
    type: string;
    filename: string;
    originalName: string;
  };
}

export function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
    const src = `${process.env.NEXT_PUBLIC_API_URL}/api/attachments/${attachment.filename}` || "/placeholder.svg";
    const validSrc = useImageExists(src)

    if (isImage(attachment.type)) {
        return <img src={validSrc} alt="Attachment" className="max-w-[250px] rounded object-cover" />;
    }

    if (isVideo(attachment.type)) {
        return <video src={validSrc} controls className="rounded" />;
    }

    return <FileAttachment attachment={attachment} />;
}
