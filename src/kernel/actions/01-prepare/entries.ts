import { ActionCategory, ActionEntry } from "../../types";
import { CommonParamsEnricherHandler } from "./CommonParamsEnricher";
import { UrlBuildHandler } from "./UrlBuilder";


export const CommonParamsEnricherEntry : ActionEntry = {
    name: 'CommonParamsEnricher',    
    category: ActionCategory.PREPARE, // 4000
    description: '从域配置中获取到的诸如appId等公共参数，添加到上下文中',
    offset: 200, // 同层内的细微排序
    handler: CommonParamsEnricherHandler,
};

export const UrlBuildEntry: ActionEntry= {
    name: 'UrlBuild',
    category: ActionCategory.PREPARE, // 4000
    description: '根据上下文中的配置，生成请求的URL',
    offset: 300, // 同层内的细微排序
    handler: UrlBuildHandler
}