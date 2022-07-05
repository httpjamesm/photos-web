import React from 'react';
import { Box, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { FlexWrapper, FluidContainer } from 'components/Container';
import CollectionSort from 'components/Collections/AllCollections/CollectionSort';
import constants from 'utils/strings/constants';
import Close from '@mui/icons-material/Close';

export default function AllCollectionsHeader({
    onClose,
    collectionCount,
    collectionSortBy,
    setCollectionSortBy,
}) {
    return (
        <DialogTitle>
            <FlexWrapper>
                <FluidContainer mr={1.5}>
                    <Box>
                        <Typography variant="h3">
                            {constants.ALL_ALBUMS}
                        </Typography>
                        <Typography variant="body2" color={'text.secondary'}>
                            {`${collectionCount} ${constants.ALBUMS}`}
                        </Typography>
                    </Box>
                </FluidContainer>
                <Stack direction="row" spacing={1.5}>
                    <CollectionSort
                        activeSortBy={collectionSortBy}
                        setCollectionSortBy={setCollectionSortBy}
                    />
                    <IconButton
                        onClick={onClose}
                        sx={{
                            background: (theme) => theme.palette.fill.dark,
                        }}>
                        <Close />
                    </IconButton>
                </Stack>
            </FlexWrapper>
        </DialogTitle>
    );
}