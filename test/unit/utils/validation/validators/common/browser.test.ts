import { validateFormDate, validateURLSearchParams, validateBlob, validateFile, ValidationErrorCode } from "@/utils";


describe('validateFormData', () => {
    it('should return null for valid FormData instance', () => {
        if (typeof FormData === 'undefined') {
            // Skip test in environments without FormData
            return;
        }
        const formData = new FormData();
        const result = validateFormDate(formData, {});
        expect(result).toBeNull();
    });

    it('should return type mismatch error for non-FormData values', () => {
        const testValues = [
            'string',
            123,
            {},
            [],
            null,
            undefined,
            new Blob(),
            new File([''], 'test.txt')
        ];

        testValues.forEach(value => {
            const result = validateFormDate(value, {});
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result![0].params?.expectedType).toBe('FormData');
        });
    });
});

describe('validateURLSearchParams', () => {
    it('should return null for valid URLSearchParams instance', () => {
        if (typeof URLSearchParams === 'undefined') {
            // Skip test in environments without URLSearchParams
            return;
        }
        const params = new URLSearchParams();
        const result = validateURLSearchParams(params, {});
        expect(result).toBeNull();
    });

    it('should return type mismatch error for non-URLSearchParams values', () => {
        const testValues = [
            'string',
            {},
            [],
            new FormData(),
            new Blob()
        ];

        testValues.forEach(value => {
            const result = validateURLSearchParams(value, {});
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result![0].params?.expectedType).toBe('URLSearchParams');
        });
    });
});

describe('validateBlob', () => {
    it('should return null for valid Blob instance', () => {
        if (typeof Blob === 'undefined') {
            // Skip test in environments without Blob
            return;
        }
        const blob = new Blob(['hello'], { type: 'text/plain' });
        const result = validateBlob(blob, {});
        expect(result).toBeNull();
    });

    it('should return type mismatch error for non-Blob values', () => {
        const testValues = [
            'string',
            {},
            [],
            123,
            new FormData(),
            new URLSearchParams()
        ];

        testValues.forEach(value => {
            const result = validateBlob(value, {});
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result![0].params?.expectedType).toBe('Blob');
        });
    });
});

describe('validateFile', () => {
    it('should return null for valid File instance', () => {
        if (typeof File === 'undefined') {
            // Skip test in environments without File
            return;
        }
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const result = validateFile(file, {});
        expect(result).toBeNull();
    });

    it('should return type mismatch error for non-File values', () => {
        const testValues = [
            'string',
            {},
            [],
            new Blob(['content'], { type: 'text/plain' }),
            new FormData()
        ];

        testValues.forEach(value => {
            const result = validateFile(value, {});
            expect(result).not.toBeNull();
            expect(result![0].code).toBe(ValidationErrorCode.TYPE_MISMATCH);
            expect(result![0].params?.expectedType).toBe('File');
        });
    });
});