import React, { useContext, useEffect, useState } from 'react';
import constants from 'utils/strings/constants';
import { formatDateTime } from 'utils/time';
import { RenderFileName } from './RenderFileName';
import { ExifData } from './ExifData';
import { RenderCreationTime } from './RenderCreationTime';
import { RenderInfoItem } from './RenderInfoItem';
import DialogTitleWithCloseButton from 'components/DialogBox/TitleWithCloseButton';
import { Dialog, DialogContent, Link, styled, Typography } from '@mui/material';
import { AppContext } from 'pages/_app';
import { Location, Metadata } from 'types/upload';
import Photoswipe from 'photoswipe';
import { getEXIFLocation } from 'services/upload/exifService';
import { RenderCaption } from './RenderCaption';

const FileInfoDialog = styled(Dialog)(({ theme }) => ({
    zIndex: 1501,
    '& .MuiDialog-container': {
        alignItems: 'flex-start',
    },
    '& .MuiDialog-paper': {
        padding: theme.spacing(2),
    },
}));

interface Iprops {
    shouldDisableEdits: boolean;
    showInfo: boolean;
    handleCloseInfo: () => void;
    items: any[];
    photoSwipe: Photoswipe<Photoswipe.Options>;
    metadata: Metadata;
    exif: any;
    scheduleUpdate: () => void;
    refreshPhotoswipe: () => void;
}

export function FileInfo({
    shouldDisableEdits,
    showInfo,
    handleCloseInfo,
    items,
    photoSwipe,
    metadata,
    exif,
    scheduleUpdate,
    refreshPhotoswipe,
}: Iprops) {
    const appContext = useContext(AppContext);
    const [location, setLocation] = useState<Location>(null);

    useEffect(() => {
        if (!location && metadata) {
            if (metadata.longitude || metadata.longitude === 0) {
                setLocation({
                    latitude: metadata.latitude,
                    longitude: metadata.longitude,
                });
            }
        }
    }, [metadata]);

    useEffect(() => {
        if (!location && exif) {
            const exifLocation = getEXIFLocation(exif);
            if (exifLocation.latitude || exifLocation.latitude === 0) {
                setLocation(exifLocation);
            }
        }
    }, [exif]);

    return (
        <FileInfoDialog
            open={showInfo}
            onClose={handleCloseInfo}
            fullScreen={appContext.isMobile}>
            <DialogTitleWithCloseButton onClose={handleCloseInfo}>
                {constants.INFO}
            </DialogTitleWithCloseButton>
            <DialogContent>
                <Typography variant="subtitle" mb={1}>
                    {constants.METADATA}
                </Typography>
                <RenderCaption
                    shouldDisableEdits={shouldDisableEdits}
                    file={items[photoSwipe?.getCurrentIndex()]}
                    scheduleUpdate={scheduleUpdate}
                    refreshPhotoswipe={refreshPhotoswipe}
                />
                {metadata?.title && (
                    <RenderFileName
                        shouldDisableEdits={shouldDisableEdits}
                        file={items[photoSwipe?.getCurrentIndex()]}
                        scheduleUpdate={scheduleUpdate}
                    />
                )}
                {metadata?.creationTime && (
                    <RenderCreationTime
                        shouldDisableEdits={shouldDisableEdits}
                        file={items[photoSwipe?.getCurrentIndex()]}
                        scheduleUpdate={scheduleUpdate}
                    />
                )}
                {metadata?.modificationTime &&
                    RenderInfoItem(
                        constants.UPDATED_ON,
                        formatDateTime(metadata.modificationTime / 1000)
                    )}
                {location &&
                    RenderInfoItem(
                        constants.LOCATION,
                        <Link
                            href={`https://www.openstreetmap.org/?mlat=${metadata.latitude}&mlon=${metadata.longitude}#map=15/${metadata.latitude}/${metadata.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            {constants.SHOW_MAP}
                        </Link>
                    )}
                {exif && (
                    <>
                        <ExifData exif={exif} />
                    </>
                )}
            </DialogContent>
        </FileInfoDialog>
    );
}