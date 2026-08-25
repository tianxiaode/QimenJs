/**
 * 文件魔数验证
 *
 * 通过读取文件头（magic bytes）来验证文件类型，
 * 防止通过修改扩展名绕过类型校验。
 */

/** 魔数签名定义 */
export interface MagicByteEntry {
    /** 文件扩展名 */
    ext: string;
    /** 魔数字节序列（十六进制字符串，如 '89504E47'） */
    hex: string;
    /** 需要读取的字节偏移量 */
    offset?: number;
}

/** 常用文件魔数签名表 */
export const MAGIC_BYTES: MagicByteEntry[] = [
    { ext: 'jpg', hex: 'FFD8FF' },
    { ext: 'jpeg', hex: 'FFD8FF' },
    { ext: 'png', hex: '89504E47' },
    { ext: 'gif', hex: '47494638' },
    { ext: 'webp', hex: '52494646' },
    { ext: 'bmp', hex: '424D' },
    { ext: 'ico', hex: '00000100' },
    { ext: 'tiff', hex: '49492A00' },
    { ext: 'pdf', hex: '25504446' },
    { ext: 'zip', hex: '504B0304' },
    { ext: 'rar', hex: '52617221' },
    { ext: '7z', hex: '377ABCAF271C' },
    { ext: 'gz', hex: '1F8B08' },
    { ext: 'bz2', hex: '425A68' },
    { ext: 'mp3', hex: '494433' },
    { ext: 'wav', hex: '52494646' },
    { ext: 'flac', hex: '664C6143' },
    { ext: 'ogg', hex: '4F676753' },
    { ext: 'mp4', hex: '0000001C66747970' },
    { ext: 'avi', hex: '52494646' },
    { ext: 'mov', hex: '0000001C6D6F6F76' },
    { ext: 'webm', hex: '1A45DFA3' },
    { ext: 'mkv', hex: '1A45DFA3' },
    { ext: 'doc', hex: 'D0CF11E0' },
    { ext: 'xls', hex: 'D0CF11E0' },
    { ext: 'ppt', hex: 'D0CF11E0' },
    { ext: 'docx', hex: '504B0304' },
    { ext: 'xlsx', hex: '504B0304' },
    { ext: 'pptx', hex: '504B0304' },
    { ext: 'rtf', hex: '7B5C7274' },
];

/** 按扩展名分组的魔数映射（初始化后填充） */
let extToMagic: Map<string, string[]> | null = null;

function buildExtMap(): Map<string, string[]> {
    const map = new Map<string, string[]>();
    for (const entry of MAGIC_BYTES) {
        const list = map.get(entry.ext) || [];
        if (!list.includes(entry.hex)) list.push(entry.hex);
        map.set(entry.ext, list);
    }
    return map;
}

/**
 * 读取文件前 N 字节（最大 16 字节）
 */
export async function getFileMagicBytes(file: File, bytesToRead = 16): Promise<Uint8Array> {
    const blob = file.slice(0, bytesToRead);
    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
}

/**
 * 将 Uint8Array 转为大写十六进制字符串
 */
export function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join('');
}

/**
 * 通过魔数检测文件类型
 *
 * @returns 匹配的扩展名数组，未匹配返回空数组
 */
export function detectFileType(magicBytes: Uint8Array): string[] {
    const hex = bytesToHex(magicBytes);
    const result: string[] = [];
    for (const entry of MAGIC_BYTES) {
        const offset = entry.offset ?? 0;
        const target = hex.slice(offset * 2, offset * 2 + entry.hex.length);
        if (target === entry.hex.toUpperCase()) {
            if (!result.includes(entry.ext)) result.push(entry.ext);
        }
    }
    return result;
}

/**
 * 验证文件的魔数是否匹配预期的扩展名列表
 *
 * @param file - 待验证文件
 * @param expectedExts - 预期的扩展名列表（如 ['jpg', 'png']）
 * @returns 是否匹配
 */
export async function validateFileMagic(file: File, expectedExts: string[]): Promise<boolean> {
    if (!extToMagic) extToMagic = buildExtMap();

    const normalizedExts = expectedExts.map(e => e.toLowerCase().replace(/^\./, ''));
    let maxBytes = 0;
    for (const ext of normalizedExts) {
        const sigs = extToMagic.get(ext);
        if (sigs) {
            for (const hex of sigs) {
                const byteLen = hex.length / 2;
                if (byteLen > maxBytes) maxBytes = byteLen;
            }
        }
    }

    if (maxBytes === 0) return true;

    const magicBytes = await getFileMagicBytes(file, maxBytes);
    const hex = bytesToHex(magicBytes);

    for (const ext of normalizedExts) {
        const sigs = extToMagic.get(ext);
        if (!sigs) continue;
        for (const sig of sigs) {
            if (hex.startsWith(sig.toUpperCase())) return true;
        }
    }

    return false;
}