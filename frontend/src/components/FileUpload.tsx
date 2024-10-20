import React, { useState } from 'react';
import axios from 'axios';

interface InferredTypes {
  [key: string]: string;
}

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [inferredTypes, setInferredTypes] = useState<InferredTypes | null>(
    null
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      const allowedExtensions = ['.csv', '.xls', '.xlsx'];
      const ext = selectedFile.name
        .substring(selectedFile.name.lastIndexOf('.'))
        .toLowerCase();
      const maxFileSize = 50 * 1024 * 1024; // 50MB

      if (!allowedExtensions.includes(ext)) {
        alert('Unsupported file type. Please upload a CSV or Excel file.');
        return;
      }

      if (selectedFile.size > maxFileSize) {
        alert('File too large. Please upload a file smaller than 50MB.');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadProgress(0);
    setStatusMessage('Uploading file...');

    axios
      .post('api/upload-file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          setUploadProgress(percentCompleted);
        },
      })
      .then((response) => {
        const { task_id } = response.data;
        setStatusMessage('File uploaded successfully. Processing data...');
        // Poll task status
        pollTaskStatus(task_id);
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          setStatusMessage(`Error: ${error.response.data.error}`);
        } else {
          setStatusMessage('File upload failed. Please try again.');
        }
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  const pollTaskStatus = (taskId: string) => {
    const intervalId = setInterval(() => {
      axios
        .get(`/api/task-status/${taskId}/`)
        .then((response) => {
          const { status, inferred_types, error } = response.data;
          if (status === 'SUCCESS') {
            setInferredTypes(inferred_types);
            setStatusMessage('Data processing completed.');
            clearInterval(intervalId);
          } else if (status === 'FAILURE') {
            setStatusMessage(`Data processing failed: ${error}`);
            clearInterval(intervalId);
          } else {
            setStatusMessage(`Task status: ${status}`);
          }
        })
        .catch((error) => {
          console.error('Error fetching task status:', error);
          setStatusMessage('Error fetching task status.');
          clearInterval(intervalId);
        });
    }, 2000); // Poll every 2 seconds
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Upload Data File</h1>
      <input
        type='file'
        accept='.csv, .xlsx, .xls'
        onChange={handleFileChange}
      />
      <button
        onClick={handleUpload}
        style={{ marginLeft: '10px' }}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload and Process'}
      </button>
      {uploadProgress > 0 && <p>Upload Progress: {uploadProgress}%</p>}
      {statusMessage && <p>{statusMessage}</p>}

      {inferredTypes && (
        <div style={{ marginTop: '20px' }}>
          <h2>Inferred Data Types</h2>
          <table cellPadding='5'>
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Data Type</th>
                <th>Modify Type</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(inferredTypes).map(([column, dtype]) => (
                <tr key={column}>
                  <td>{column}</td>
                  <td>{dtype}</td>
                  <td>
                    <select defaultValue={dtype}>
                      <option value='Complex'>Complex</option>
                      <option value='Date'>Date</option>
                      <option value='Int'>Int</option>
                      <option value='Float'>Float</option>
                      <option value='Text'>Text</option>
                      <option value='TimeDelta'>TimeDelta</option>
                      <option value='Bool'>Bool</option>
                      <option value='Category'>Category</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
