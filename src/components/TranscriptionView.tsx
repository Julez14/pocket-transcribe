import React, { useState, useRef } from "react";
import {
  Download,
  Share2,
  Pencil,
  Save,
  Copy,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { createDownloadableFile, revokeObjectURL } from "../utils/formatters";

interface TranscriptionViewProps {
  transcript: string;
  onUpdateTranscript: (newTranscript: string) => void;
  onStartOver: () => void;
}

type DownloadFormat = "txt" | "docx" | "pdf";

const TranscriptionView: React.FC<TranscriptionViewProps> = ({
  transcript,
  onUpdateTranscript,
  onStartOver,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcript);
  const [isCopied, setIsCopied] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createPDFBlob = (text: string): Blob => {
    // Simple PDF creation using basic PDF structure
    const date = new Date().toLocaleDateString();
    const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${text.length + 200}
>>
stream
BT
/F1 12 Tf
50 742 Td
(Meeting Transcript - ${date}) Tj
0 -30 Td
`;

    const pdfFooter = `
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000063 00000 n 
0000000120 00000 n 
0000000279 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${pdfHeader.length + text.length + 100}
%%EOF`;

    // Convert text to PDF-safe format and add line breaks
    const lines = text.split("\n");
    let pdfContent = pdfHeader;
    let yPosition = 0;

    lines.forEach((line) => {
      if (yPosition > 650) {
        // Simple page break logic
        pdfContent += "ET\nendstream\nendobj\n"; // End current page
        yPosition = 0;
      }
      const safeLine = line.replace(/[()\\]/g, "\\$&"); // Escape special chars
      pdfContent += `(${safeLine}) Tj\n0 -15 Td\n`;
      yPosition += 15;
    });

    pdfContent += pdfFooter;

    return new Blob([pdfContent], { type: "application/pdf" });
  };

  const createDOCXBlob = (text: string): Blob => {
    const date = new Date().toLocaleDateString();

    // Create a simple DOCX structure (simplified XML)
    const docContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="24"/>
        </w:rPr>
        <w:t>Meeting Transcript</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:i/>
          <w:sz w:val="20"/>
        </w:rPr>
        <w:t>Date: ${date}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:spacing w:after="200"/>
      </w:pPr>
    </w:p>`;

    // Convert text to DOCX paragraphs
    const paragraphs = text
      .split("\n")
      .map((line) => {
        const escapedLine = line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `    <w:p>
      <w:r>
        <w:t>${escapedLine}</w:t>
      </w:r>
    </w:p>`;
      })
      .join("\n");

    const docXML =
      docContent +
      paragraphs +
      `
  </w:body>
</w:document>`;

    // For a proper DOCX, we'd need to create a ZIP with multiple XML files
    // This is a simplified version that some word processors can read
    return new Blob([docXML], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  };

  const handleDownload = (format: DownloadFormat = "txt") => {
    const text = isEditing ? editedText : transcript;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");

    let blob: Blob;
    let filename: string;

    switch (format) {
      case "pdf":
        blob = createPDFBlob(text);
        filename = `transcript-${timestamp}.pdf`;
        break;
      case "docx":
        blob = createDOCXBlob(text);
        filename = `transcript-${timestamp}.docx`;
        break;
      default:
        blob = new Blob([text], { type: "text/plain" });
        filename = `transcript-${timestamp}.txt`;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    setShowDownloadOptions(false);
  };

  const handleShare = async () => {
    const text = isEditing ? editedText : transcript;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Meeting Transcript",
          text: text,
        });
      } else {
        // Fallback if Web Share API is not available
        handleCopyToClipboard();
      }
    } catch (error) {
      console.error("Error sharing transcript:", error);
    }
  };

  const handleCopyToClipboard = async () => {
    const text = isEditing ? editedText : transcript;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleSave = () => {
    onUpdateTranscript(editedText);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Your Transcript
          </h2>
          <div className="flex space-x-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                aria-label="Save edits"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </button>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                aria-label="Edit transcript"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              placeholder="Your transcript text..."
            />
          ) : (
            <div className="min-h-[200px] p-3 bg-gray-50 rounded-md text-gray-800 whitespace-pre-wrap">
              {transcript}
            </div>
          )}
        </div>

        <div className="flex p-4 gap-2 border-t bg-gray-50">
          <div className="flex-1 relative">
            <div className="flex">
              <button
                onClick={() => handleDownload("txt")}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-l-md hover:bg-blue-700 transition-colors min-h-[40px]"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                className="px-2 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors border-l border-blue-500 min-h-[40px]"
                aria-label="More download options"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showDownloadOptions ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {showDownloadOptions && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <button
                  onClick={() => handleDownload("txt")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100 flex items-center justify-between"
                >
                  <span>Download as TXT</span>
                  <span className="text-xs text-gray-500">Default</span>
                </button>
                <button
                  onClick={() => handleDownload("docx")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100"
                >
                  Download as DOCX
                </button>
                <button
                  onClick={() => handleDownload("pdf")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  Download as PDF
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors min-h-[40px] whitespace-nowrap"
          >
            <Share2 className="w-4 h-4" />
            {navigator.share ? "Share" : "Copy"}
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors min-h-[40px] whitespace-nowrap"
          >
            <Copy className="w-4 h-4" />
            {isCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDownloadOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDownloadOptions(false)}
        />
      )}

      <button
        onClick={onStartOver}
        className="flex items-center justify-center gap-1 mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mx-auto min-h-[40px]"
      >
        <RotateCcw className="w-4 h-4" />
        Record Another
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your audio and transcript data are only stored in your browser's memory
        and will be deleted when you close or refresh this page.
      </p>
    </div>
  );
};

export default TranscriptionView;
