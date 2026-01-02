import { IUrlProcessor, RequestOptions } from '../../types';

export const QueryParamsProcessor: IUrlProcessor = (url: string, options: RequestOptions) => {
    const queryParams = options.queryParams || {};
    const queryParamsString = Object.keys(queryParams)
        .map(key => `${key}=${queryParams[key]}`)
        .join('&');
    return `${url}${queryParamsString ? `?${queryParamsString}` : ''}`;
};
