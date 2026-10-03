export type ModalityType = 'document' | 'image' | 'video' | 'audio' | 'text';
export type SelectedEvidenceFiles = Partial<Record<ModalityType, File>>;

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  detectedType?: string;
  expectedType?: string;
  acceptedFormats?: string;
}

export const MODALITY_CONFIGS: Record<ModalityType, {
  label: string;
  accept: string;
  extensions: string[];
  acceptedDescription: string;
}> = {
  document: {
    label: 'DOCUMENT',
    accept: '.pdf,.doc,.docx,.txt,.json,.csv,.xml,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/json',
    extensions: ['pdf', 'doc', 'docx', 'txt', 'json', 'csv', 'xml', 'rtf'],
    acceptedDescription: 'PDF, DOCX, DOC, TXT, or JSON documents',
  },
  image: {
    label: 'IMAGE',
    accept: 'image/*,.png,.jpg,.jpeg,.webp,.tiff,.bmp,.gif',
    extensions: ['png', 'jpg', 'jpeg', 'webp', 'tiff', 'tif', 'bmp', 'gif'],
    acceptedDescription: 'RAW, PNG, JPG, WEBP, or TIFF images',
  },
  video: {
    label: 'VIDEO',
    accept: 'video/*,.mp4,.mov,.webm,.avi,.mkv,.h264',
    extensions: ['mp4', 'mov', 'webm', 'avi', 'mkv', 'h264'],
    acceptedDescription: 'MP4, MOV, WEBM, or MKV video streams',
  },
  audio: {
    label: 'AUDIO',
    accept: 'audio/*,.mp3,.wav,.flac,.aac,.m4a,.ogg',
    extensions: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'],
    acceptedDescription: 'WAV, FLAC, MP3, or AAC acoustic recordings',
  },
  text: {
    label: 'TEXT',
    accept: '.txt,.json,.md,.csv,.log,text/plain,application/json',
    extensions: ['txt', 'json', 'md', 'csv', 'log'],
    acceptedDescription: 'TXT, JSON, MD, or CSV transcripts',
  },
};

export function validateModalityFile(modality: ModalityType, file: File): ValidationResult {
  const fileName = file.name || '';
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
  const mimeType = (file.type || '').toLowerCase();

  // Helper to detect what the user actually provided
  const isImage = mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'tiff', 'tif', 'bmp', 'gif', 'svg', 'heic'].includes(fileExt);
  const isVideo = mimeType.startsWith('video/') || ['mp4', 'mov', 'webm', 'avi', 'mkv', 'h264', 'flv', 'wmv'].includes(fileExt);
  const isAudio = mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma'].includes(fileExt);
  const isDocument = mimeType === 'application/pdf' || 
    mimeType.includes('officedocument') || 
    mimeType.includes('msword') || 
    ['pdf', 'doc', 'docx', 'rtf', 'odt'].includes(fileExt);
  const isText = mimeType.startsWith('text/') || mimeType === 'application/json' || ['txt', 'json', 'md', 'csv', 'log', 'xml'].includes(fileExt);

  let detectedType = 'Unknown file';
  if (isImage) detectedType = 'Image';
  else if (isVideo) detectedType = 'Video';
  else if (isAudio) detectedType = 'Audio';
  else if (isDocument) detectedType = 'Document (PDF/DOCX)';
  else if (isText) detectedType = 'Text/Transcript';

  const config = MODALITY_CONFIGS[modality];

  if (modality === 'document') {
    // Explicit requested test: if user tries to upload an image by clicking document
    if (isImage) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Cannot upload an Image ("${fileName}") to the DOCUMENT enclave. Expected document formats (${config.acceptedDescription}). Please upload to the IMAGE stream instead.`,
        detectedType: 'Image',
        expectedType: 'Document',
        acceptedFormats: config.acceptedDescription,
      };
    }

    if (isVideo) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Cannot upload a Video ("${fileName}") to the DOCUMENT enclave. Expected document formats (${config.acceptedDescription}). Please upload to the VIDEO stream instead.`,
        detectedType: 'Video',
        expectedType: 'Document',
        acceptedFormats: config.acceptedDescription,
      };
    }

    if (isAudio) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Cannot upload an Audio file ("${fileName}") to the DOCUMENT enclave. Expected document formats (${config.acceptedDescription}). Please upload to the AUDIO stream instead.`,
        detectedType: 'Audio',
        expectedType: 'Document',
        acceptedFormats: config.acceptedDescription,
      };
    }

    if (!config.extensions.includes(fileExt) && !isDocument && !isText) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Invalid file format ("${fileName}"). Document field requires: ${config.acceptedDescription}.`,
        detectedType,
        expectedType: 'Document',
        acceptedFormats: config.acceptedDescription,
      };
    }

    return { isValid: true };
  }

  if (modality === 'image') {
    if (isDocument || isText) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Cannot upload a Document ("${fileName}") to the IMAGE stream. Expected image formats (${config.acceptedDescription}). Please upload to the DOCUMENT stream.`,
        detectedType: 'Document',
        expectedType: 'Image',
        acceptedFormats: config.acceptedDescription,
      };
    }

    if (isVideo) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Cannot upload a Video ("${fileName}") to the IMAGE stream. Please upload to the VIDEO stream.`,
        detectedType: 'Video',
        expectedType: 'Image',
        acceptedFormats: config.acceptedDescription,
      };
    }

    if (isAudio) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Cannot upload an Audio recording ("${fileName}") to the IMAGE stream. Please upload to the AUDIO stream.`,
        detectedType: 'Audio',
        expectedType: 'Image',
        acceptedFormats: config.acceptedDescription,
      };
    }

    if (!isImage && !config.extensions.includes(fileExt)) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: "${fileName}" is not a recognized image format. Expected: ${config.acceptedDescription}.`,
        detectedType,
        expectedType: 'Image',
        acceptedFormats: config.acceptedDescription,
      };
    }

    return { isValid: true };
  }

  if (modality === 'video') {
    if (isImage) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Cannot upload a static Image ("${fileName}") to the VIDEO stream. Please upload to the IMAGE stream.`,
        detectedType: 'Image',
        expectedType: 'Video',
        acceptedFormats: config.acceptedDescription,
      };
    }

    if (isDocument || isText) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Cannot upload a Document ("${fileName}") to the VIDEO stream. Please upload to the DOCUMENT stream.`,
        detectedType: 'Document',
        expectedType: 'Video',
        acceptedFormats: config.acceptedDescription,
      };
    }

    if (!isVideo && !config.extensions.includes(fileExt)) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: "${fileName}" is not a recognized video format. Expected: ${config.acceptedDescription}.`,
        detectedType,
        expectedType: 'Video',
        acceptedFormats: config.acceptedDescription,
      };
    }

    return { isValid: true };
  }

  if (modality === 'audio') {
    if (isImage) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Cannot upload an Image ("${fileName}") to the AUDIO stream. Please upload to the IMAGE stream.`,
        detectedType: 'Image',
        expectedType: 'Audio',
        acceptedFormats: config.acceptedDescription,
      };
    }

    if (isDocument) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Cannot upload a Document ("${fileName}") to the AUDIO stream. Please upload to the DOCUMENT stream.`,
        detectedType: 'Document',
        expectedType: 'Audio',
        acceptedFormats: config.acceptedDescription,
      };
    }

    if (!isAudio && !config.extensions.includes(fileExt)) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: "${fileName}" is not a recognized acoustic recording. Expected: ${config.acceptedDescription}.`,
        detectedType,
        expectedType: 'Audio',
        acceptedFormats: config.acceptedDescription,
      };
    }

    return { isValid: true };
  }

  if (modality === 'text') {
    if (isImage || isVideo || isAudio) {
      return {
        isValid: false,
        errorMessage: `Field Validation Error: Cannot upload binary media ("${fileName}") to the TEXT stream. Expected: ${config.acceptedDescription}.`,
        detectedType,
        expectedType: 'Text',
        acceptedFormats: config.acceptedDescription,
      };
    }

    return { isValid: true };
  }

  return { isValid: true };
}
