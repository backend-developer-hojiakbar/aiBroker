import React, { useCallback } from 'react';
import { t } from '../utils/translations';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { UploadIcon } from './Icons';

interface FileUploadSectionProps {
  onFileUpload: (files: FileList) => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  onFileUpload,
  acceptedFormats = '.pdf,.doc,.docx,.xls,.xlsx',
  maxSizeMB = 10,
}) => {
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileUpload(e.dataTransfer.files);
      }
    },
    [onFileUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFileUpload(e.target.files);
      }
    },
    [onFileUpload]
  );

  return (
    <Card className="border-2 border-dashed border-border hover:border-brand-primary/50 transition-colors duration-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('elite-legal-intelligence')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-col items-center justify-center p-8 text-center rounded-lg border-2 border-dashed border-border hover:border-brand-primary/50 transition-colors duration-200 cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <div className="p-3 mb-4 rounded-full bg-brand-primary/10 text-brand-primary">
            <UploadIcon className="w-8 h-8" />
          </div>
          <h3 className="mb-1 text-lg font-medium">{t('file-upload')}</h3>
          <p className="mb-4 text-sm text-text-secondary">
            {t('upload-description')}
          </p>
          <p className="text-xs text-text-tertiary">
            {t('supported-formats')}
          </p>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept={acceptedFormats}
            onChange={handleFileInput}
            multiple
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadSection;
