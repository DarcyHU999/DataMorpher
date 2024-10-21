import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';
import axios from 'axios';

// Type Definitions
interface InferredTypes {
  [key: string]: string;
}

type StatusType = 'success' | 'error';

// Sub-Components

/**
 * FileSelector Component
 * Handles file selection UI and logic.
 */
const FileSelector: React.FC<{
  selectedFile: File | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}> = ({ selectedFile, onFileChange }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Button variant='contained' component='label'>
      Choose File
      <input
        type='file'
        accept='.csv, .xlsx, .xls'
        onChange={onFileChange}
        hidden
      />
    </Button>
    <Typography variant='body1' sx={{ ml: 2 }}>
      {selectedFile ? selectedFile.name : 'No file selected'}
    </Typography>
  </Box>
);

/**
 * UploadButton Component
 * Handles the upload button and displays upload progress.
 */
const UploadButton: React.FC<{
  onUpload: () => void;
  isUploading: boolean;
  uploadProgress: number;
  disabled: boolean;
}> = ({ onUpload, isUploading, uploadProgress, disabled }) => (
  <>
    <Button
      variant='contained'
      color='primary'
      onClick={onUpload}
      disabled={disabled}
    >
      {isUploading ? 'Uploading...' : 'Upload and Process'}
    </Button>
    {isUploading && (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress variant='determinate' value={uploadProgress} />
        <Typography variant='body2' color='textSecondary'>
          Upload Progress: {uploadProgress}%
        </Typography>
      </Box>
    )}
  </>
);

/**
 * StatusMessage Component
 * Displays status messages based on the operation outcome.
 */
const StatusMessage: React.FC<{
  message: string;
  type: StatusType;
}> = ({ message, type }) => (
  <Typography
    variant='body1'
    color={type === 'error' ? 'error' : 'success.main'}
    sx={{ mt: 2 }}
  >
    {message}
  </Typography>
);

/**
 * InferredTypesTable Component
 * Displays the table of inferred data types.
 */
const InferredTypesTable: React.FC<{
  inferredTypes: InferredTypes;
}> = ({ inferredTypes }) => (
  <Box sx={{ mt: 4 }}>
    <Typography variant='h5' gutterBottom>
      Inferred Data Types
    </Typography>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Column Name</TableCell>
            <TableCell>Inferred Data Type</TableCell>
            <TableCell>Manually Modify Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(inferredTypes).map(([column, dtype]) => (
            <TableRow key={column}>
              <TableCell>{column}</TableCell>
              <TableCell>{dtype}</TableCell>
              <TableCell>
                <FormControl fullWidth>
                  <InputLabel id={`select-label-${column}`}>Type</InputLabel>
                  <Select
                    labelId={`select-label-${column}`}
                    defaultValue={dtype}
                    label='Type'
                  >
                    <MenuItem value='Complex'>Complex</MenuItem>
                    <MenuItem value='Date'>Date</MenuItem>
                    <MenuItem value='Int'>Int</MenuItem>
                    <MenuItem value='Float'>Float</MenuItem>
                    <MenuItem value='Text'>Text</MenuItem>
                    <MenuItem value='TimeDelta'>TimeDelta</MenuItem>
                    <MenuItem value='Bool'>Bool</MenuItem>
                    <MenuItem value='Category'>Category</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

/**
 * FilePrep Component
 * Main component handling file upload and processing.
 */
const FilePrep: React.FC = () => {
  // State Variables
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<StatusType>('success');
  const [inferredTypes, setInferredTypes] = useState<InferredTypes | null>(
    null
  );

  // Handle File Selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle File Upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage('Please select a file first.');
      setStatusType('error');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setIsUploading(true);
      setStatusMessage('Uploading file...');
      setUploadProgress(0);
      setInferredTypes(null); // Reset inferred types on new upload

      const response = await axios.post('api/upload-file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      const { task_id } = response.data;
      setStatusMessage('File uploaded successfully. Processing data...');
      setStatusType('success');

      // Start polling task status
      pollTaskStatus(task_id);
    } catch (error: any) {
      setStatusMessage(
        `Upload failed: ${error.response?.data?.error || error.message}`
      );
      setStatusType('error');
      setIsUploading(false);
    }
  };

  /**
   * PollTaskStatus Function
   * Polls the server for task status until completion or failure.
   */
  const pollTaskStatus = (taskId: string) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`/api/task-status/${taskId}/`);
        const { status, inferred_types, error } = response.data;

        if (status === 'SUCCESS') {
          setInferredTypes(inferred_types);
          setStatusMessage('Data processing completed.');
          setStatusType('success');
          clearInterval(intervalId);
          setIsUploading(false);
        } else if (status === 'FAILURE') {
          setStatusMessage(`Data processing failed: ${error}`);
          setStatusType('error');
          clearInterval(intervalId);
          setIsUploading(false);
        } else {
          setStatusMessage(`Task status: ${status}`);
        }
      } catch (error) {
        console.error('Error fetching task status:', error);
        setStatusMessage('Error fetching task status.');
        setStatusType('error');
        clearInterval(intervalId);
        setIsUploading(false);
      }
    }, 2000); // Poll every 2 seconds
  };

  // Cleanup on Unmount
  useEffect(() => {
    return () => {
      // Cleanup logic if needed (e.g., clear intervals)
    };
  }, []);

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant='h4' gutterBottom>
        Data Morpher
      </Typography>

      {/* File Selection */}
      <FileSelector
        selectedFile={selectedFile}
        onFileChange={handleFileChange}
      />

      {/* Upload Button and Progress */}
      <UploadButton
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        disabled={isUploading || !selectedFile}
      />

      {/* Status Message */}
      {statusMessage && (
        <StatusMessage message={statusMessage} type={statusType} />
      )}

      {/* Inferred Types Table */}
      {inferredTypes && <InferredTypesTable inferredTypes={inferredTypes} />}
    </Box>
  );
};

export default FilePrep;
