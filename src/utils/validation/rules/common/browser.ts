import { CommonRule } from "../../core";

export interface FormDataRule extends CommonRule{
    type: "formData";
} 

export interface URLSearchParamsRule extends CommonRule{
    type: "urlSearchParams";
} 

export interface FileRule extends CommonRule{
    type: "file";
} 

export interface BlobRule extends CommonRule{
    type: "blob";
} 

