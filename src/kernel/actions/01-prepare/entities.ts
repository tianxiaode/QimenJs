import { ActionCategory, ActionEntry } from "../../types";
import { ContextEnricherHandler } from "./ContextEnricher";
import { CommonParamsEnricherHandler } from "./CommonParamsEnricher";
import { UrlBuildHandler } from "./UrlBuilder";

export const ContextEnricherEntry : ActionEntry = {
    name: 'ContextEnricher',    
    category: ActionCategory.PREPARE, // 4000
    description: '从域配置中获取对应域的配置，添加到上下文中',
    offset: 100, // 同层内的细微排序
    handler: ContextEnricherHandler,
};

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