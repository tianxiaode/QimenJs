import type { II18nManager, IQimenI18nGlobal } from './types';

declare global {
    interface Window {
        __qimen_i18n__?: II18nManager;
        qimenI18n?: IQimenI18nGlobal;
    }
}
