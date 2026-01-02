import { HttpResponseContext, IResponseProcessor } from '../../types';

export const HttpStatusProcessor: IResponseProcessor = async (context: HttpResponseContext) => {
    const { status } = context;

    // 记录状态是否属于“协议成功”
    context.metadata.isHttpSuccess = status >= 200 && status < 300;

    // 即使状态码是 400/500，我们也原样返回 context，
    // 让后面的 JsonParseProcessor 继续解析 Body，
    // 让 RestErrorProcessor 去提取具体的业务错误码。
    return context;
};
