import React, { useState, ChangeEvent } from 'react';
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

const FilePrep: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'success' | 'error'>('success'); // Added status type
  const [inferredTypes, setInferredTypes] = useState<Record<
    string,
    string
  > | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage('Please select a file first.');
      setStatusType('error'); // Set to 'error'
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    const pollTaskStatus = (taskId: string) => {
      const intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`/api/task-status/${taskId}/`);
          const { status, inferred_types, error } = response.data;

          if (status === 'SUCCESS') {
            setInferredTypes(inferred_types);
            setStatusMessage('Data processing completed.');
            clearInterval(intervalId);
            setIsUploading(false);
          } else if (status === 'FAILURE') {
            setStatusMessage(`Data processing failed: ${error}`);
            clearInterval(intervalId);
            setIsUploading(false);
          } else {
            setStatusMessage(`Task status: ${status}`);
          }
        } catch (error) {
          console.error('Error querying task status:', error);
          setStatusMessage('Error querying task status.');
          clearInterval(intervalId);
          setIsUploading(false);
        }
      }, 2000); // Poll every 2 seconds
    };

    try {
      setIsUploading(true);
      setStatusMessage('');
      setUploadProgress(0);

      const response = await axios.post('/api/upload-file/', formData, {
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
      setStatusMessage('File uploaded successfully, processing data...');
      setStatusType('success');

      pollTaskStatus(task_id);
    } catch (error: any) {
      setStatusMessage(
        `Upload failed: ${error.response?.data?.error || error.message}`
      );
      setStatusType('error'); // Set to 'error'
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant='h4' gutterBottom>
        Data Morpher
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button variant='contained' component='label'>
          Choose File
          <input
            type='file'
            accept='.csv, .xlsx, .xls'
            onChange={handleFileChange}
            hidden
          />
        </Button>
        <Typography variant='body1' sx={{ ml: 2 }}>
          {selectedFile ? selectedFile.name : 'No file selected'}
        </Typography>
      </Box>
      <Button
        variant='contained'
        color='primary'
        onClick={handleUpload}
        disabled={isUploading || !selectedFile}
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
      {statusMessage && (
        <Typography
          variant='body1'
          color={statusType === 'error' ? 'error' : 'success.main'}
          sx={{ mt: 2 }}
        >
          {statusMessage}
        </Typography>
      )}

      {inferredTypes && (
        <Box sx={{ mt: 4 }}>
          <Typography variant='h5' gutterBottom>
            Inferred Data Types
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Column Name</TableCell>
                  <TableCell>Data Type</TableCell>
                  <TableCell>Modify Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(inferredTypes).map(([column, dtype]) => (
                  <TableRow key={column}>
                    <TableCell>{column}</TableCell>
                    <TableCell>{dtype}</TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel id={`select-label-${column}`}>
                          Type
                        </InputLabel>
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
      )}
    </Box>
  );
};

export default FilePrep;
