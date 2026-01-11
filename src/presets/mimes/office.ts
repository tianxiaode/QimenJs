// @presets/office.ts
import { MimeTypeRegistrar } from '@orbitjs/registry';

export function useOfficePresets() {
    // Microsoft Word
    MimeTypeRegistrar.register('doc', 'application/msword');
    MimeTypeRegistrar.register('docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    MimeTypeRegistrar.register('dot', 'application/msword');
    MimeTypeRegistrar.register('dotx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.template');

    // Microsoft Excel
    MimeTypeRegistrar.register('xls', 'application/vnd.ms-excel');
    MimeTypeRegistrar.register('xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    MimeTypeRegistrar.register('xlsm', 'application/vnd.ms-excel.sheet.macroEnabled.12');
    MimeTypeRegistrar.register('xlsb', 'application/vnd.ms-excel.sheet.binary.macroEnabled.12');
    MimeTypeRegistrar.register('xlt', 'application/vnd.ms-excel');
    MimeTypeRegistrar.register('xltx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.template');

    // Microsoft PowerPoint
    MimeTypeRegistrar.register('ppt', 'application/vnd.ms-powerpoint');
    MimeTypeRegistrar.register('pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    MimeTypeRegistrar.register('pot', 'application/vnd.ms-powerpoint');
    MimeTypeRegistrar.register('potx', 'application/vnd.openxmlformats-officedocument.presentationml.template');
    MimeTypeRegistrar.register('pps', 'application/vnd.ms-powerpoint');
    MimeTypeRegistrar.register('ppsx', 'application/vnd.openxmlformats-officedocument.presentationml.slideshow');

    // OpenDocument Formats
    MimeTypeRegistrar.register('odt', 'application/vnd.oasis.opendocument.text');
    MimeTypeRegistrar.register('ott', 'application/vnd.oasis.opendocument.text-template');
    MimeTypeRegistrar.register('ods', 'application/vnd.oasis.opendocument.spreadsheet');
    MimeTypeRegistrar.register('ots', 'application/vnd.oasis.opendocument.spreadsheet-template');
    MimeTypeRegistrar.register('odp', 'application/vnd.oasis.opendocument.presentation');
    MimeTypeRegistrar.register('otp', 'application/vnd.oasis.opendocument.presentation-template');

    // PDF
    MimeTypeRegistrar.register('pdf', 'application/pdf');

    // Other common office formats
    MimeTypeRegistrar.register('rtf', 'application/rtf');
    MimeTypeRegistrar.register('txt', 'text/plain');
    MimeTypeRegistrar.register('csv', 'text/csv');
    MimeTypeRegistrar.register('tsv', 'text/tab-separated-values');
    MimeTypeRegistrar.register('pages', 'application/vnd.apple.pages');
    MimeTypeRegistrar.register('numbers', 'application/vnd.apple.numbers');
    MimeTypeRegistrar.register('key', 'application/vnd.apple.keynote');
    
    // registeritional office and document formats
    MimeTypeRegistrar.register('epub', 'application/epub+zip');
    MimeTypeRegistrar.register('mobi', 'application/x-mobipocket-ebook');
    MimeTypeRegistrar.register('azw', 'application/vnd.amazon.ebook');
    MimeTypeRegistrar.register('azw3', 'application/vnd.amazon.ebook');
    
    // Microsoft Visio
    MimeTypeRegistrar.register('vsd', 'application/vnd.visio');
    MimeTypeRegistrar.register('vsdx', 'application/vnd.visio2013');
    
    // Microsoft Access
    MimeTypeRegistrar.register('mdb', 'application/vnd.ms-access');
    MimeTypeRegistrar.register('accdb', 'application/msaccess');
    
    // Microsoft Project
    MimeTypeRegistrar.register('mpp', 'application/vnd.ms-project');
    MimeTypeRegistrar.register('mpt', 'application/vnd.ms-project');
    
    // Text and markup formats
    MimeTypeRegistrar.register('xml', 'application/xml');
    MimeTypeRegistrar.register('json', 'application/json');
    MimeTypeRegistrar.register('html', 'text/html');
    MimeTypeRegistrar.register('htm', 'text/html');
    MimeTypeRegistrar.register('md', 'text/markdown');
    MimeTypeRegistrar.register('tex', 'application/x-tex');
}