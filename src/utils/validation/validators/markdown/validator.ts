// src/utils/validation/validators/markdown-validator.ts
import { ValidationErrorCode, ValidationResult, createValidationSuccess, createValidationFailure } from '../../core';
import { validateString } from './string-validator';

/**
 * Markdown验证选项
 */
export interface MarkdownValidationOptions {
  /** 是否为必填字段 */
  required?: boolean;
  /** 允许为空值（null/undefined） */
  nullable?: boolean;
  /** 是否允许空Markdown内容 */
  allowEmpty?: boolean;
  /** 最大长度限制 */
  maxLength?: number;
  /** 最小长度限制 */
  minLength?: number;
  /** 是否验证Markdown语法 */
  validateSyntax?: boolean;
  /** 允许的HTML标签（如果Markdown包含HTML） */
  allowedHTMLTags?: string[];
  /** 禁止的HTML标签 */
  disallowedHTMLTags?: string[];
  /** 是否允许图片 */
  allowImages?: boolean;
  /** 是否允许链接 */
  allowLinks?: boolean;
  /** 是否允许代码块 */
  allowCodeBlocks?: boolean;
  /** 是否允许表格 */
  allowTables?: boolean;
  /** 自定义验证函数 */
  custom?: (markdown: string) => ValidationResult | Promise<ValidationResult>;
}

/**
 * 验证Markdown字符串
 */
export async function validateMarkdown(
  value: any,
  options: MarkdownValidationOptions = {}
): Promise<ValidationResult> {
  const defaultOptions: MarkdownValidationOptions = {
    required: false,
    nullable: false,
    allowEmpty: true,
    validateSyntax: true,
    allowImages: true,
    allowLinks: true,
    allowCodeBlocks: true,
    allowTables: true,
    ...options,
  };

  // 1. 先验证基本字符串
  const stringResult = validateString(value, {
    required: defaultOptions.required,
    nullable: defaultOptions.nullable,
    minLength: defaultOptions.minLength,
    maxLength: defaultOptions.maxLength,
  });

  if (!stringResult.isValid) {
    return stringResult;
  }

  // 2. 如果是空值且允许，直接返回
  if (value == null && (defaultOptions.nullable || !defaultOptions.required)) {
    return createValidationSuccess();
  }

  const markdown = value as string;

  // 3. 空内容检查
  if (!defaultOptions.allowEmpty && markdown.trim() === '') {
    return createValidationFailure(ValidationErrorCode.EMPTY_NOT_ALLOWED, {
      value: markdown,
      options: defaultOptions,
    });
  }

  // 4. 基本Markdown语法检查（简化版）
  if (defaultOptions.validateSyntax) {
    const syntaxErrors = await validateMarkdownSyntax(markdown, defaultOptions);
    if (syntaxErrors.length > 0) {
      return createValidationFailure(ValidationErrorCode.MARKDOWN_SYNTAX_ERROR, {
        value: markdown,
        options: defaultOptions,
        errors: syntaxErrors,
      });
    }
  }

  // 5. 自定义验证
  if (defaultOptions.custom) {
    const customResult = await defaultOptions.custom(markdown);
    if (!customResult.isValid) {
      return customResult;
    }
  }

  return createValidationSuccess();
}

/**
 * 验证Markdown语法（简化实现）
 */
async function validateMarkdownSyntax(
  markdown: string,
  options: MarkdownValidationOptions
): Promise<string[]> {
  const errors: string[] = [];

  // 检查不允许的HTML标签
  if (options.disallowedHTMLTags && options.disallowedHTMLTags.length > 0) {
    const disallowedPattern = new RegExp(
      `<\\s*(${options.disallowedHTMLTags.join('|')})(\\s|>|$)`,
      'gi'
    );
    const matches = markdown.match(disallowedPattern);
    if (matches) {
      errors.push(`包含禁止的HTML标签: ${matches.join(', ')}`);
    }
  }

  // 检查图片是否允许
  if (!options.allowImages) {
    const imagePattern = /!\[.*?\]\(.*?\)/g;
    const matches = markdown.match(imagePattern);
    if (matches) {
      errors.push(`Markdown中包含图片，但配置不允许: ${matches.join(', ')}`);
    }
  }

  // 检查链接是否允许
  if (!options.allowLinks) {
    const linkPattern = /(?!!)\[.*?\]\(.*?\)/g;
    const matches = markdown.match(linkPattern);
    if (matches) {
      errors.push(`Markdown中包含链接，但配置不允许: ${matches.join(', ')}`);
    }
  }

  // 检查代码块是否允许
  if (!options.allowCodeBlocks) {
    const codeBlockPattern = /```[\s\S]*?```/g;
    const matches = markdown.match(codeBlockPattern);
    if (matches) {
      errors.push(`Markdown中包含代码块，但配置不允许: ${matches.join(', ')}`);
    }
  }

  // 检查表格是否允许
  if (!options.allowTables) {
    const tablePattern = /\|.*?\|.*?\n\|[-:|]+\|.*?\n(\|.*?\|.*?\n)*/g;
    const matches = markdown.match(tablePattern);
    if (matches) {
      errors.push(`Markdown中包含表格，但配置不允许: ${matches.join(', ')}`);
    }
  }

  // 可以添加更多语法检查...

  return errors;
}

/**
 * 断言Markdown字符串
 */
export async function assertMarkdown(
  value: any,
  options: MarkdownValidationOptions = {}
): Promise<string> {
  const result = await validateMarkdown(value, options);
  
  if (!result.isValid) {
    throw new Error(JSON.stringify(result.errors));
  }
  
  return value as string;
}

/**
 * 验证Markdown并返回HTML（可选功能）
 */
export async function validateAndRenderMarkdown(
  markdown: string,
  options: MarkdownValidationOptions = {}
): Promise<ValidationResult & { html?: string }> {
  const validationResult = await validateMarkdown(markdown, options);
  
  if (!validationResult.isValid) {
    return validationResult;
  }

  try {
    // 这里可以使用marked、markdown-it等库将Markdown转换为HTML
    // import { marked } from 'marked';
    // const html = marked.parse(markdown);
    
    // 简化示例
    const html = `<div>${markdown.replace(/\n/g, '<br>')}</div>`;
    
    return {
      isValid: true,
      errors: [],
      html,
    };
  } catch (error) {
    return createValidationFailure(ValidationErrorCode.MARKDOWN_RENDER_ERROR, {
      markdown,
      options,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}