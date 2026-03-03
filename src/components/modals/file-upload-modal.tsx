import React, { useState } from 'react';
import Modal from '../ui/modal';
import Button from '../ui/button';
import Input from '../ui/input';
import { uploadFile } from '../../lib/uploadthing';

const FileUploadModal = ({ isOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            await uploadFile(file);
            onClose(); // Close modal on successful upload
        } catch (err) {
            setError('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-lg font-semibold">Upload File</h2>
            {error && <p className="text-red-500">{error}</p>}
            <Input type="file" onChange={handleFileChange} />
            <div className="mt-4">
                <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                </Button>
            </div>
        </Modal>
    );
};

export default FileUploadModal;