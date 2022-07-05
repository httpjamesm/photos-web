import { Box, Typography } from '@mui/material';
import React from 'react';
import Select from 'react-select';
import { DropdownStyle } from 'styles/dropdown';
import { getDeviceLimitOptions } from 'utils/collection';
import constants from 'utils/strings/constants';
import { OptionWithDivider } from './selectComponents/OptionWithDivider';

export function ManageDeviceLimit({
    publicShareProp,
    collection,
    updatePublicShareURLHelper,
}) {
    const updateDeviceLimit = async (newLimit: number) => {
        return updatePublicShareURLHelper({
            collectionID: collection.id,
            deviceLimit: newLimit,
        });
    };

    return (
        <Box>
            <Typography mb={0.5}>{constants.LINK_DEVICE_LIMIT}</Typography>
            <Select
                menuPosition="fixed"
                options={getDeviceLimitOptions()}
                components={{
                    Option: OptionWithDivider,
                }}
                isSearchable={false}
                value={{
                    label: publicShareProp?.deviceLimit.toString(),
                    value: publicShareProp?.deviceLimit,
                }}
                onChange={(e) => updateDeviceLimit(e.value)}
                styles={DropdownStyle}
            />
        </Box>
    );
}