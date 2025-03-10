import { FluidContainer } from 'components/Container';
import { SelectionBar } from '../../Navbar/SelectionBar';
import React, { useContext } from 'react';
import { Box, IconButton, styled, Tooltip } from '@mui/material';
import { DeduplicateContext } from 'pages/deduplicate';
import { AppContext } from 'pages/_app';
import CloseIcon from '@mui/icons-material/Close';
import BackButton from '@mui/icons-material/ArrowBackOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTrashFilesMessage } from 'utils/ui';
import { t } from 'i18next';
import { formatNumber } from 'utils/number/format';

const VerticalLine = styled('div')`
    position: absolute;
    width: 1px;
    top: 0;
    bottom: 0;
    background: #303030;
`;

const CheckboxText = styled('div')`
    margin-left: 0.5em;
    font-size: 16px;
    margin-right: 0.8em;
`;

interface IProps {
    deleteFileHelper: () => void;
    close: () => void;
    count: number;
    clearSelection: () => void;
}

export default function DeduplicateOptions({
    deleteFileHelper,
    close,
    count,
    clearSelection,
}: IProps) {
    const deduplicateContext = useContext(DeduplicateContext);
    const { setDialogMessage } = useContext(AppContext);

    const trashHandler = () =>
        setDialogMessage(getTrashFilesMessage(deleteFileHelper));

    return (
        <SelectionBar>
            <FluidContainer>
                {count ? (
                    <IconButton onClick={clearSelection}>
                        <CloseIcon />
                    </IconButton>
                ) : (
                    <IconButton onClick={close}>
                        <BackButton />
                    </IconButton>
                )}
                <Box ml={1.5}>
                    {formatNumber(count)} {t('SELECTED')}
                </Box>
            </FluidContainer>
            <input
                type="checkbox"
                style={{
                    width: '1em',
                    height: '1em',
                }}
                value={
                    deduplicateContext.clubSameTimeFilesOnly ? 'true' : 'false'
                }
                onChange={() => {
                    deduplicateContext.setClubSameTimeFilesOnly(
                        !deduplicateContext.clubSameTimeFilesOnly
                    );
                }}></input>
            <CheckboxText>{t('CLUB_BY_CAPTURE_TIME')}</CheckboxText>
            <div>
                <VerticalLine />
            </div>
            <Tooltip title={t('DELETE')}>
                <IconButton onClick={trashHandler}>
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </SelectionBar>
    );
}
