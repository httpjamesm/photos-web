import React from 'react';
import UploadService from 'services/uploadService';
import { getToken } from 'utils/common/key';
import DropzoneWrapper from './DropzoneWrapper';

function CollectionDropZone({
    children,
    closeModal,
    refetchData,
    collectionAndItsLatestFile,
    setProgressView,
    progressBarProps,
    setBannerErrorCode,
    setUploadErrors,
}) {
    const upload = async (acceptedFiles) => {
        try {
            const token = getToken();
            progressBarProps.setPercentComplete(0);
            setProgressView(true);
            closeModal();
            await UploadService.uploadFiles(
                acceptedFiles,
                collectionAndItsLatestFile,
                token,
                progressBarProps,
                setUploadErrors
            );
            refetchData();
        } catch (err) {
            setBannerErrorCode(err.message);
            setProgressView(false);
        }
    };
    return <DropzoneWrapper children={children} onDropAccepted={upload} />;
}

export default CollectionDropZone;