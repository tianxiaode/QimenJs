// @presets/office.ts
import { MimeTypeRegistrar } from '../../registry/registrars/MimeTypeRegistrar';

export function useOfficePresets() {
    const registrar = MimeTypeRegistrar.getInstance();
    
    // Microsoft Word
    registrar.register({
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'dot': 'application/msword',
        'dotx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',

        // Microsoft Excel
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xlsm': 'application/vnd.ms-excel.sheet.macroEnabled.12',
        'xlsb': 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
        'xlt': 'application/vnd.ms-excel',
        'xltx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',

        // Microsoft PowerPoint
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'pot': 'application/vnd.ms-powerpoint',
        'potx': 'application/vnd.openxmlformats-officedocument.presentationml.template',
        'pps': 'application/vnd.ms-powerpoint',
        'ppsx': 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',

        // OpenDocument Formats
        'odt': 'application/vnd.oasis.opendocument.text',
        'ott': 'application/vnd.oasis.opendocument.text-template',
        'ods': 'application/vnd.oasis.opendocument.spreadsheet',
        'ots': 'application/vnd.oasis.opendocument.spreadsheet-template',
        'odp': 'application/vnd.oasis.opendocument.presentation',
        'otp': 'application/vnd.oasis.opendocument.presentation-template',

        // PDF
        'pdf': 'application/pdf',

        // Other common office formats
        'rtf': 'application/rtf',
        'txt': 'text/plain',
        'csv': 'text/csv',
        'tsv': 'text/tab-separated-values',
        'pages': 'application/vnd.apple.pages',
        'numbers': 'application/vnd.apple.numbers',
        'key': 'application/vnd.apple.keynote',
        
        // registeritional office and document formats
        'epub': 'application/epub+zip',
        'mobi': 'application/x-mobipocket-ebook',
        'azw': 'application/vnd.amazon.ebook',
        'azw3': 'application/vnd.amazon.ebook',
        
        // Microsoft Visio
        'vsd': 'application/vnd.visio',
        'vsdx': 'application/vnd.visio2013',
        
        // Microsoft Access
        'mdb': 'application/vnd.ms-access',
        'accdb': 'application/msaccess',
        
        // Microsoft Project
        'mpp': 'application/vnd.ms-project',
        'mpt': 'application/vnd.ms-project',
        
        // Text and markup formats
        'xml': 'application/xml',
        'json': 'application/json',
        'html': 'text/html',
        'htm': 'text/html',
        'md': 'text/markdown',
        'tex': 'application/x-tex'
    });
}