// @presets/office.ts
import { MimeTypeRegistrar } from '@orbitjs/registry';

export function useOfficePresets() {
    // Microsoft Word
    MimeTypeRegistrar.add('doc', 'application/msword');
    MimeTypeRegistrar.add('docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    MimeTypeRegistrar.add('dot', 'application/msword');
    MimeTypeRegistrar.add('dotx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.template');

    // Microsoft Excel
    MimeTypeRegistrar.add('xls', 'application/vnd.ms-excel');
    MimeTypeRegistrar.add('xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    MimeTypeRegistrar.add('xlsm', 'application/vnd.ms-excel.sheet.macroEnabled.12');
    MimeTypeRegistrar.add('xlsb', 'application/vnd.ms-excel.sheet.binary.macroEnabled.12');
    MimeTypeRegistrar.add('xlt', 'application/vnd.ms-excel');
    MimeTypeRegistrar.add('xltx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.template');

    // Microsoft PowerPoint
    MimeTypeRegistrar.add('ppt', 'application/vnd.ms-powerpoint');
    MimeTypeRegistrar.add('pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    MimeTypeRegistrar.add('pot', 'application/vnd.ms-powerpoint');
    MimeTypeRegistrar.add('potx', 'application/vnd.openxmlformats-officedocument.presentationml.template');
    MimeTypeRegistrar.add('pps', 'application/vnd.ms-powerpoint');
    MimeTypeRegistrar.add('ppsx', 'application/vnd.openxmlformats-officedocument.presentationml.slideshow');

    // OpenDocument Formats
    MimeTypeRegistrar.add('odt', 'application/vnd.oasis.opendocument.text');
    MimeTypeRegistrar.add('ott', 'application/vnd.oasis.opendocument.text-template');
    MimeTypeRegistrar.add('ods', 'application/vnd.oasis.opendocument.spreadsheet');
    MimeTypeRegistrar.add('ots', 'application/vnd.oasis.opendocument.spreadsheet-template');
    MimeTypeRegistrar.add('odp', 'application/vnd.oasis.opendocument.presentation');
    MimeTypeRegistrar.add('otp', 'application/vnd.oasis.opendocument.presentation-template');

    // PDF
    MimeTypeRegistrar.add('pdf', 'application/pdf');

    // Other common office formats
    MimeTypeRegistrar.add('rtf', 'application/rtf');
    MimeTypeRegistrar.add('txt', 'text/plain');
    MimeTypeRegistrar.add('csv', 'text/csv');
    MimeTypeRegistrar.add('tsv', 'text/tab-separated-values');
    MimeTypeRegistrar.add('pages', 'application/vnd.apple.pages');
    MimeTypeRegistrar.add('numbers', 'application/vnd.apple.numbers');
    MimeTypeRegistrar.add('key', 'application/vnd.apple.keynote');
    
    // Additional office and document formats
    MimeTypeRegistrar.add('epub', 'application/epub+zip');
    MimeTypeRegistrar.add('mobi', 'application/x-mobipocket-ebook');
    MimeTypeRegistrar.add('azw', 'application/vnd.amazon.ebook');
    MimeTypeRegistrar.add('azw3', 'application/vnd.amazon.ebook');
    
    // Microsoft Visio
    MimeTypeRegistrar.add('vsd', 'application/vnd.visio');
    MimeTypeRegistrar.add('vsdx', 'application/vnd.visio2013');
    
    // Microsoft Access
    MimeTypeRegistrar.add('mdb', 'application/vnd.ms-access');
    MimeTypeRegistrar.add('accdb', 'application/msaccess');
    
    // Microsoft Project
    MimeTypeRegistrar.add('mpp', 'application/vnd.ms-project');
    MimeTypeRegistrar.add('mpt', 'application/vnd.ms-project');
    
    // Text and markup formats
    MimeTypeRegistrar.add('xml', 'application/xml');
    MimeTypeRegistrar.add('json', 'application/json');
    MimeTypeRegistrar.add('html', 'text/html');
    MimeTypeRegistrar.add('htm', 'text/html');
    MimeTypeRegistrar.add('md', 'text/markdown');
    MimeTypeRegistrar.add('tex', 'application/x-tex');
}