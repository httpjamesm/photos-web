import React, { useContext, useEffect, useState } from 'react';

import { t } from 'i18next';

import { clearData, getData, LS_KEYS } from 'utils/storage/localStorage';
import { useRouter } from 'next/router';
import { PAGES } from 'constants/pages';
import { SESSION_KEYS, getKey } from 'utils/storage/sessionStorage';
import {
    decryptAndStoreToken,
    generateAndSaveIntermediateKeyAttributes,
    saveKeyInSessionStore,
} from 'utils/crypto';
import { logoutUser } from 'services/userService';
import { isFirstLogin } from 'utils/storage';
import { AppContext } from 'pages/_app';
import { logError } from 'utils/sentry';
import { KeyAttributes, User } from 'types/user';
import FormContainer from 'components/Form/FormContainer';
import FormPaper from 'components/Form/FormPaper';
import FormPaperTitle from 'components/Form/FormPaper/Title';
import FormPaperFooter from 'components/Form/FormPaper/Footer';
import LinkButton from 'components/pages/gallery/LinkButton';
import isElectron from 'is-electron';
import safeStorageService from 'services/electron/safeStorage';
import VerticallyCentered from 'components/Container';
import EnteSpinner from 'components/EnteSpinner';
import VerifyMasterPasswordForm, {
    VerifyMasterPasswordFormProps,
} from 'components/VerifyMasterPasswordForm';
import { APPS, getAppName } from 'constants/apps';

export default function Credentials() {
    const router = useRouter();
    const [keyAttributes, setKeyAttributes] = useState<KeyAttributes>();
    const appContext = useContext(AppContext);
    const [user, setUser] = useState<User>();

    useEffect(() => {
        router.prefetch(PAGES.GALLERY);
        const main = async () => {
            const user = getData(LS_KEYS.USER);
            setUser(user);
            const keyAttributes = getData(LS_KEYS.KEY_ATTRIBUTES);
            let key = getKey(SESSION_KEYS.ENCRYPTION_KEY);
            if (!key && isElectron()) {
                key = await safeStorageService.getEncryptionKey();
                if (key) {
                    await saveKeyInSessionStore(
                        SESSION_KEYS.ENCRYPTION_KEY,
                        key,
                        true
                    );
                }
            }
            if (
                (!user?.token && !user?.encryptedToken) ||
                (keyAttributes && !keyAttributes.memLimit)
            ) {
                clearData();
                router.push(PAGES.ROOT);
            } else if (!keyAttributes) {
                router.push(PAGES.GENERATE);
            } else if (key) {
                router.push(PAGES.GALLERY);
            } else {
                setKeyAttributes(keyAttributes);
            }
        };
        main();
        appContext.showNavBar(true);
    }, []);

    const useMasterPassword: VerifyMasterPasswordFormProps['callback'] = async (
        key,
        passphrase
    ) => {
        try {
            if (isFirstLogin()) {
                await generateAndSaveIntermediateKeyAttributes(
                    passphrase,
                    keyAttributes,
                    key
                );
            }
            await saveKeyInSessionStore(SESSION_KEYS.ENCRYPTION_KEY, key);
            await decryptAndStoreToken(key);
            const redirectURL = appContext.redirectURL;
            appContext.setRedirectURL(null);
            const appName = getAppName();
            if (appName === APPS.AUTH) {
                router.push(PAGES.AUTH);
            } else {
                router.push(redirectURL ?? PAGES.GALLERY);
            }
        } catch (e) {
            logError(e, 'useMasterPassword failed');
        }
    };

    const redirectToRecoverPage = () => router.push(PAGES.RECOVER);

    if (!keyAttributes) {
        return (
            <VerticallyCentered>
                <EnteSpinner />
            </VerticallyCentered>
        );
    }

    return (
        <FormContainer>
            <FormPaper style={{ minWidth: '320px' }}>
                <FormPaperTitle>{t('PASSWORD')}</FormPaperTitle>

                <VerifyMasterPasswordForm
                    buttonText={t('VERIFY_PASSPHRASE')}
                    callback={useMasterPassword}
                    user={user}
                    keyAttributes={keyAttributes}
                />
                <FormPaperFooter style={{ justifyContent: 'space-between' }}>
                    <LinkButton onClick={redirectToRecoverPage}>
                        {t('FORGOT_PASSWORD')}
                    </LinkButton>
                    <LinkButton onClick={logoutUser}>
                        {t('CHANGE_EMAIL')}
                    </LinkButton>
                </FormPaperFooter>
            </FormPaper>
        </FormContainer>
    );
}
