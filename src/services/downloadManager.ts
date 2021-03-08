import { getToken } from 'utils/common/key';
import { file, getFile } from './fileService';
import HTTPService from './HTTPService';
import { getEndpoint, getFileUrl, getThumbnailUrl } from 'utils/common/apiUtil';
import { getFileExtension } from 'utils/common/utilFunctions';
import CryptoWorker from 'utils/crypto/cryptoWorker';

const ENDPOINT = getEndpoint();


const heic2any = typeof window !== 'undefined' && require('heic2any');
const TYPE_HEIC = 'heic';

class DownloadManager {
    private fileDownloads = new Map<number, Promise<string>>();
    private thumbnailDownloads = new Map<number, Promise<string>>();

    constructor(private token) { }
    public async getPreview(file: file) {
        try {
            const cache = await caches.open('thumbs');
            const cacheResp: Response = await cache.match(file.id.toString());
            if (cacheResp) {
                return URL.createObjectURL(await cacheResp.blob());
            }
            if (!this.thumbnailDownloads.get(file.id)) {
                const download = (async () => {
                    const resp = await HTTPService.get(
                        getThumbnailUrl(file.id),
                        null,
                        { 'X-Auth-Token': this.token },
                        { responseType: 'arraybuffer' }
                    );
                    const worker = await new CryptoWorker();
                    const decrypted: any = await worker.decryptThumbnail(
                        new Uint8Array(resp.data),
                        await worker.fromB64(file.thumbnail.decryptionHeader),
                        file.key
                    );
                    try {
                        await cache.put(
                            file.id.toString(),
                            new Response(new Blob([decrypted]))
                        );
                    } catch (e) {
                        // TODO: handle storage full exception.
                    }

                    return URL.createObjectURL(new Blob([decrypted]));
                })();
                this.thumbnailDownloads.set(file.id, download);
            }
            return await this.thumbnailDownloads.get(file.id);
        } catch (e) {
            console.log('get preview Failed', e);
        }
    }

    getFile = async (file: file) => {
        if (!this.fileDownloads.get(file.id)) {
            const download = (async () => {
                return await getFile(this.token, file);
            })();
            this.fileDownloads.set(file.id, download);
        }
        return await this.fileDownloads.get(file.id);
    };

    private async convertHEIC2JPEG(fileBlob): Promise<Blob> {
        return await heic2any({
            blob: fileBlob,
            toType: 'image/jpeg',
            quality: 1,
        });
    }
}

export default new DownloadManager(getToken());