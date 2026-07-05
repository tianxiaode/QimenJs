/**
 * data-processor 包权重测试
 */

import { DataProcessorWeight, getWeightName } from '@/data-processor/weights';

describe('data-processor/weights', () => {
    describe('DataProcessorWeight', () => {
        it('should have correct weight values', () => {
            expect(DataProcessorWeight.PREPARATION).toBe(0);
            expect(DataProcessorWeight.TRANSFORM).toBe(1000);
            expect(DataProcessorWeight.VALIDATION).toBe(2000);
            expect(DataProcessorWeight.ENRICHMENT).toBe(3000);
            expect(DataProcessorWeight.EXCHANGE).toBe(4000);
            expect(DataProcessorWeight.EXTRACT).toBe(5000);
            expect(DataProcessorWeight.ALIGN).toBe(6000);
            expect(DataProcessorWeight.ERROR).toBe(7000);
            expect(DataProcessorWeight.FINALIZE).toBe(8000);
        });

        it('should have weights in ascending order', () => {
            const weights = [
                DataProcessorWeight.PREPARATION,
                DataProcessorWeight.TRANSFORM,
                DataProcessorWeight.VALIDATION,
                DataProcessorWeight.ENRICHMENT,
                DataProcessorWeight.EXCHANGE,
                DataProcessorWeight.EXTRACT,
                DataProcessorWeight.ALIGN,
                DataProcessorWeight.ERROR,
                DataProcessorWeight.FINALIZE,
            ];

            for (let i = 1; i < weights.length; i++) {
                expect(weights[i]).toBeGreaterThan(weights[i - 1]);
            }
        });
    });

    describe('getWeightName', () => {
        it('should return correct name for each weight', () => {
            expect(getWeightName(0)).toBe('PREPARATION');
            expect(getWeightName(1000)).toBe('TRANSFORM');
            expect(getWeightName(2000)).toBe('VALIDATION');
            expect(getWeightName(3000)).toBe('ENRICHMENT');
            expect(getWeightName(4000)).toBe('EXCHANGE');
            expect(getWeightName(5000)).toBe('EXTRACT');
            expect(getWeightName(6000)).toBe('ALIGN');
            expect(getWeightName(7000)).toBe('ERROR');
            expect(getWeightName(8000)).toBe('FINALIZE');
        });

        it('should return UNKNOWN for invalid weight', () => {
            expect(getWeightName(999)).toBe('UNKNOWN');
            expect(getWeightName(-1)).toBe('UNKNOWN');
            expect(getWeightName(10000)).toBe('UNKNOWN');
        });
    });
});
