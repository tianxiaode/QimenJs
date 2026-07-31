# 文件调度中心 + 文件事件总线 实施方案

## 一、Context（背景与动机）

当前 [`FileInputComponent.ts`](file:///d:/Workspace/projects/QimenJs/src/component/file-input/FileInputComponent.ts) 是个 ~580 行的"胖组件",混合了 6 类职责:DOM 渲染、文件校验、上传编排、哈希计算、进度/状态同步、事件桥接。存在三个核心问题:

1. **职责耦合**:把"文件上传传输"与"实体存储"通过 `entityKey` 模式耦合在一起。按用户的洞察 —— "文件上传基本都是与实体无关的,只有它的返回数据才可能会和实体相关" —— 上传是传输层关注点,实体关联只是结果的下游消费。
2. **违反项目约定**:`_renderFileList`(L421-481)直接用 `innerHTML` + `document.createElement`,违反"DOM 操作必须走 `CommonPropsAbility`"的约定。
3. **无法复用**:未来规划了拖拽上传区、图片预览上传、下载按钮三个组件,都要重复实现上传/哈希/进度逻辑。

**目标**:抽出 `FileDispatchCenter`(单例,持有状态)+ `FileEventBus`(反馈总线),让 `FileInputComponent` 瘦身为薄组件,并为未来三个文件组件提供统一基座。

**用户确认的关键决策**:
- 总线边界:文件上传与实体解耦,`FileEventBus` 拥有文件生命周期,实体关联下沉为业务消费方职责
- 状态归属:`FileDispatchCenter` 持有 `FileItem[]` 队列(按 `fileKey` 分通道)
- 多消费者:拖拽上传区、图片预览上传、下载按钮均复用调度中心

## 二、架构总览

```
组件(FileInput/DragDrop/...) ──直接调用──▶ FileDispatchCenter (单例,持有状态)
                                              │
                                              ├── 校验(MimeTypeRegistrar)
                                              ├── 哈希(createHashTask)
                                              ├── 上传(HttpClient.upload)
                                              ├── 下载(HttpClient.download + triggerDownload)
                                              │
                                              └──fileEmit──▶ FileEventBus ──fileOn──▶ 组件(反馈,支持多消费者订阅同一 fileKey)
```

**设计裁决**(经 Plan 代理验证):
1. **直接 API + 反馈总线(非对称)**:命令通过 `fileDispatchCenter.addFiles()` 等方法直调(参照 `DragEventBus` 混合模式);反馈走 `FileEventBus` 广播。不定义 `FILE_ACTIONS` 常量组,仅定义 `FILE_FEEDBACK_EVENTS`。理由:中心持有状态,命令直调最简;总线唯一不可替代的价值是让多个消费者感知同一通道状态变化。
2. **ref-counted connect/disconnect**:参照 [`EntityDispatchCenter.connect/disconnect`](file:///d:/Workspace/projects/QimenJs/src/entity/dispatch/EntityDispatchCenter.ts#L118-L158)。`createChannel` 声明配置,`connect`/`disconnect` 引用计数,到 0 销毁通道。
3. **setNodeHtml + 事件委托**:list 节点在模板中声明,渲染走 `setNodeHtml(html, 'list')`(合规);remove 按钮用事件委托(`closest('[data-item-id]')`)替代逐个 `addEventListener`。
4. **移除 entityKey**:破坏性变更,详见第五节。

## 三、新增文件

### 3.1 `src/error/codes.ts`(修改)
追加文件下载错误码:
- `FILE_DOWNLOAD_FAILED = 'FILE_DOWNLOAD_FAILED'`

### 3.2 `src/events/file-events.ts`(新建)
仅反馈事件常量,镜像 [`overlay-events.ts`](file:///d:/Workspace/projects/QimenJs/src/events/overlay-events.ts) 结构:
```ts
export const FILE_FEEDBACK_EVENTS = {
  SELECTED: 'selected', REMOVED: 'removed',
  HASH_START: 'hashStart', HASH_PROGRESS: 'hashProgress', HASH_COMPLETE: 'hashComplete',
  UPLOAD_START: 'uploadStart', UPLOAD_PROGRESS: 'uploadProgress',
  UPLOADED: 'uploaded', UPLOAD_ERROR: 'uploadError', UPLOAD_COMPLETE: 'uploadComplete', CANCELLED: 'cancelled',
  DOWNLOAD_START: 'downloadStart', DOWNLOAD_PROGRESS: 'downloadProgress',
  DOWNLOADED: 'downloaded', DOWNLOAD_ERROR: 'downloadError',
} as const;
```

### 3.3 `src/events/FileEventBus.ts`(新建)
单例总线,完全镜像 [`OverlayEventBus.ts`](file:///d:/Workspace/projects/QimenJs/src/events/OverlayEventBus.ts):
- 私有构造:`this.fileScope = globalEventBus.createEventScope()`;`this.logger = Logger.for('file-bus')`
- 事件编码:`file:${fileKey}:${action}`
- API:`fileEmit(ctx: EventContext)`(从 `ctx.source` 取 fileKey,`ctx.type` 取 action)、`fileOn(fileKey, action, handler): () => void`(解包 `ctx.data`)、`fileOnce`、`getScopeId()`、`dispose()`
- 导出 `fileEventBus = FileEventBus.getInstance()`

### 3.4 `src/events/index.ts`(修改)
追加:`export { FileEventBus, fileEventBus } from './FileEventBus'; export * from './file-events';`

### 3.5 `src/file/types.ts`(新建,从 `src/component/file-input/types.ts` 迁移并扩展)
```ts
export enum FileItemStatus { SELECTED, HASHING, UPLOADING, UPLOADED, ERROR, DOWNLOADING, DOWNLOADED }

export interface FileTransportConfig {
  domain?: string; url: string;
  hashEnabled?: boolean; hashAlgorithm?: string; // 新增,默认 'sha256'
  headers?: Record<string, string>;
}

export interface FileItem {
  id: string;
  file?: File | null;   // 修正:原类型为 File 但 setFormValue 传 null,改为可选
  name: string; size: number; status: FileItemStatus; percent: number;
  hash?: string; result?: any; error?: string;
}

export interface FileChannelConfig {
  transport?: FileTransportConfig;
  accept?: string; multiple?: boolean; maxSize?: number;
  autoUpload?: boolean;   // 默认 true
  concurrency?: number;   // 预留,本期不实现
}

export interface FileChannelState {
  config: FileChannelConfig;
  items: FileItem[];
  refCount: number;
  activeTasks: Map<string, { cancel: (reason?: any) => void }>;
}
```

### 3.6 `src/file/format.ts`(新建)
从 `FileInputComponent` 提取的纯函数工具(未来其他文件组件复用):
- `formatFileSize(bytes): string`(迁自 `_formatSize`,L483-487)
- `formatFileStatus(item): string`(迁自 `_statusText`,L489-504,补充 DOWNLOADING/DOWNLOADED)
- `parseAcceptExts(accept): string[]`(迁自 L60-65)
- `isFileTypeAllowed(file, accept): boolean`(迁自 L67-91,复用 `MimeTypeRegistrar`)

### 3.7 `src/file/FileDispatchCenter.ts`(新建,核心)
单例(参照 [`FloatEngine`](file:///d:/Workspace/projects/QimenJs/src/component-core/engine/FloatEngine.ts) 的 plain singleton 模式,不用 `RegistrarBase`)+ refCount(参照 `EntityDispatchCenter`)。

**字段**:`channels: Map<string, FileChannelState>`、`bus = FileEventBus.getInstance()`、`logger = Logger.for('file-dispatch')`、内部 `fileIdCounter`

**公开 API**:
- `createChannel(fileKey, config): void` — 幂等,不存在则建,存在则合并 config(不重置 items)
- `connect(fileKey): void` / `disconnect(fileKey): void` — refCount 增减,到 0 调 `destroyChannel`
- `addFiles(fileKey, files: File[]): FileItem[]`
- `upload(fileKey): Promise<void>` — 顺序上传所有 SELECTED/ERROR 项
- `cancel(fileKey, itemId): void` — 调 `activeTasks.get(itemId).cancel` + 标记 + emit CANCELLED
- `remove(fileKey, itemId): void`
- `download(fileKey, url, fileName?, options?): Promise<void>`
- `getItems(fileKey): FileItem[]` / `getItem(fileKey, itemId)` / `clear(fileKey)` / `setItems(fileKey, items)`(供 setFormValue 回填)
- `destroyChannel(fileKey): void` / `dispose(): void`

**`addFiles` 流程**:校验类型(`isFileTypeAllowed`)→ 失败 emit `UPLOAD_ERROR`(`FILE_TYPE_MISMATCH`);校验大小 → 失败 emit `UPLOAD_ERROR`(`FILE_SIZE_EXCEEDED`);通过则构建 `FileItem`(id 由 center 生成)push → emit `SELECTED` → 若 `autoUpload !== false` 调 `upload(fileKey)`

**`_uploadSingle` 流程**:
1. 若 `hashEnabled`:`status=HASHING` + emit `HASH_START` → `createHashTask(file, hashAlgorithm ?? 'sha256')` → `onProgress` emit `HASH_PROGRESS`(percent = progress*50) → `await start/result` → `item.hash = hex` + emit `HASH_COMPLETE`;catch:`status=ERROR, error=FILE_HASH_FAILED` + emit `UPLOAD_ERROR` + return
2. 若 `transport`:`status=UPLOADING` + emit `UPLOAD_START` → `new HttpClient(domain).upload(url, formData, ev=>{percent=loaded/total*100; emit UPLOAD_PROGRESS}, {headers})` → `activeTasks.set(itemId, {cancel})` → `await task.context` → `item.result=ctx.data; status=UPLOADED; percent=100` + emit `UPLOADED`;catch:`status=ERROR, error=FILE_UPLOAD_FAILED` + emit `UPLOAD_ERROR`;finally:`activeTasks.delete`
3. 全部完成 → emit `UPLOAD_COMPLETE`(`{ results }`)

**`download` 流程**:emit `DOWNLOAD_START` → `HttpClient.download(url, ev=>emit DOWNLOAD_PROGRESS, options)` → `await task.context` → `triggerDownload(ctx.data, fileName)` + emit `DOWNLOADED`;catch:emit `DOWNLOAD_ERROR`(`FILE_DOWNLOAD_FAILED`)

**复用**:[`createHashTask`](file:///d:/Workspace/projects/QimenJs/src/task/hash-task/factory.ts)、[`HttpClient`](file:///d:/Workspace/projects/QimenJs/src/http/HttpClient.ts#L178-L207)、[`triggerDownload`](file:///d:/Workspace/projects/QimenJs/src/utils/download.ts)、[`EventContextBuilder`](file:///d:/Workspace/projects/QimenJs/src/context)、`MimeTypeRegistrar`、`KernelErrorCode`、`formatFileSize/formatFileStatus/isFileTypeAllowed`(本地 `format.ts`)

### 3.8 `src/file/index.ts`(新建,barrel)
`export * from './types'; export * from './format'; export { FileDispatchCenter, fileDispatchCenter } from './FileDispatchCenter';`

## 四、修改文件

### 4.1 `src/component/file-input/FileInputComponent.ts`(重写,目标 ~180 行)

**保留**:
- `ButtonComponent.replace` 派生结构与 `_super.update` 链式调用
- 隐藏 `<input type=file>` 创建(`_createFileInput`,input 元素本身保留 createElement 合理)
- `onBtnClick` → `input.click()`
- `update(props)` 的 accept/multiple/disabled/maxSize/autoUpload/transport 同步
- `getFormValue/setFormValue/formReset/getEventData`(契约调整见下)

**删除**(全部下沉到 center):
- `_entityKey`、`_initEntityFileListeners`、`_uploadViaEntity`、`_onEntityFileCreated/Progress/Error`(L169-192、275-299、363-393)— 整个 entity 模式
- `_fileItems` 状态字段(改读 center)
- `upload/_uploadSingleFile/_uploadDirect/_bridgeOrEmit/_checkAllUploaded`(L227-409)
- `_handleFiles`(改为 `addFiles` 调用)、`_renderFileList`(改为 setNodeHtml 版)
- `_formatSize/_statusText`(移至 `format.ts`)、`generateFileId/parseAcceptExts/isFileTypeAllowed`(移至 center/format.ts)

**新增/改写**:
- `FileInputProps`:新增 `fileKey: string`(必填),移除 `entityKey`;其余 `transport/eventKey/accept/multiple/maxSize/disabled/autoUpload/text/size` 不变
- 模板 `nodes` 增 `list: {}` 节点声明(让框架创建容器,渲染走 `setNodeHtml`)
- `onAfterInit`:同步 props → `fileDispatchCenter.createChannel(fileKey, {transport,accept,multiple,maxSize,autoUpload})` → `connect(fileKey)` → 订阅 `FILE_FEEDBACK_EVENTS` 全部事件 for `fileKey`(每次回调 `_renderList()`;`UPLOADED/UPLOAD_COMPLETE/UPLOAD_ERROR` 额外 `self.emit(...)` 保留组件 `on` 监听;若 `eventKey` 存在转发到 `bridgeEmit` 兼容)→ unsub 收集到 `_fileUnsubs`
- input change:`fileDispatchCenter.addFiles(fileKey, Array.from(files))`
- `_renderList()`:`_resolveNodeEl('list')` 取节点 → 构建 HTML 字符串(**沿用 CSS 类名** `q-file-input__list/__item/__name/__size/__status/__remove/__progress/__progress-bar`)→ `setNodeHtml(html, 'list')`
- 事件委托:list 节点挂 click 监听,`e.target.closest('.q-file-input__remove')` → 读 `dataset.itemId` → `fileDispatchCenter.remove(fileKey, itemId)`
- `onBeforeDispose`:遍历 `_fileUnsubs` 取消 + 移除委托监听 + `disconnect(fileKey)`
- `get files`:`fileDispatchCenter.getItems(fileKey)`;`get uploadedFiles`:`filter(UPLOADED)`
- `getFormValue()`:`getItems().filter(UPLOADED).map(i => i.result)`(不再假设 `result.id`,实体 id 由业务侧自取)
- `setFormValue(v)`:`fileDispatchCenter.clear(fileKey)` 后 `setItems(fileKey, v.map(...))`(标记为 UPLOADED)
- `formReset()`:`fileDispatchCenter.clear(fileKey)`
- `getEventData()`:`{ files: fileDispatchCenter.getItems(fileKey) }`
- `update(props)`:transport/accept/maxSize/autoUpload 变更时调 `createChannel` 重新合并 config(幂等)

### 4.2 `src/component/file-input/types.ts`
改为 `export * from '@/file/types'` 一行 re-export(过渡,避免外部 import 路径立即失效),后续版本删除。

### 4.3 `src/component/file-input/file-input.css.ts`
保持不变(CSS 类名在重构后 HTML 中沿用)。

## 五、破坏性变更

| 变更 | 影响 | 迁移建议 |
|---|---|---|
| **移除 `FileInputProps.entityKey`** | 用 entityKey 上传的代码 | 改用 `transport: { url }`;实体关联在监听 `UPLOADED` 后由业务自行 `entity.create(result)` |
| `FileItem.file` 改可选 | 类型检查 | 外部读取 `item.file` 处加空值判断 |
| `getFormValue` 不再返回 `result?.id` | 表单取值 | 业务侧自行从 `result` 提取所需字段(或后续加 `valueAccessor` 配置) |

**向后兼容保留**:
- 组件仍 `emit('uploaded'|'uploadProgress'|'uploadError'|'uploadComplete'|'remove')`(订阅 FileEventBus 后转发到自身 emit,外部 `on(...)` 监听不变)
- `eventKey` + `bridgeEmit` 仍生效(转发到 EventBridge)
- `src/component/file-input/types.ts` 保留 re-export 一版

## 六、验证方案

1. **编译**:`pnpm tsc --noEmit` 零错误。重点:`FileItem.file` 可选后所有访问点、`FileDispatchCenter` 单例类型、EventContext 构建完整性
2. **新增单测**:
   - `src/file/__tests__/FileDispatchCenter.test.ts`:mock HttpClient + createHashTask,验证 addFiles 校验/SELECTED emit/upload 流程/cancel/refCount/通道隔离
   - `src/file/__tests__/format.test.ts`:formatFileSize、isFileTypeAllowed 边界
3. **手动场景**:
   - 直传:`new FileInputComponent({ fileKey:'avatars', transport:{url:'/api/upload', hashEnabled:true}, accept:'image/*', multiple:true })` → 选文件 → 看到 hash/progress → 完成
   - 移除文件:点 × → list 更新
   - form 集成:setFormValue 回填 → getFormValue 取值
   - 多组件共享 channel:两个 FileInputComponent 用同一 fileKey → 操作一个,另一个 list 同步(bus 广播)
   - 取消上传:`fileDispatchCenter.cancel(fileKey, itemId)`
   - 下载:`fileDispatchCenter.download(fileKey, '/api/file/1', 'a.txt')`
4. **回归**:`pnpm test` 全量;`rg "FileInputComponent|file-input|entityKey"` 确认无遗漏消费方

## 七、风险与后续

1. **进度节流**:`UPLOAD_PROGRESS` 高频回调可能卡顿。建议 center 内复用 `src/async/throttle`(OverlayDispatchCenter 已用此模式)对进度 emit 节流。
2. **channel 持久化**:`disconnect` 到 0 即销毁 items;若表单 fill 后组件 dispose 再 init 会丢。本期默认行为,文档标注;后续可加显式 `destroyChannel` 与自动延迟清理。
3. **FileListComponent 抽取**:本期 setNodeHtml + 事件委托满足合规,但 list 渲染仍耦合在 FileInputComponent。未来抽 `FileListComponent`(独立组件订阅 FileEventBus)是更干净方向,列为后续工作。
4. **并发上传**:`concurrency` 字段仅占位,本期顺序上传;后续用 p-limit 风格控制。
5. **fileKey 必填**:若用户不传,center 自动生成(`file-${++seq}`)并返回,避免多组件共享 channel 失效。
6. **EntityDispatchCenter 联动**:`ENTITY_UPLOAD_EVENTS` 仍保留(实体侧 mgr 自己的上传能力不受影响),仅 `FileInputComponent` 不再走实体通道。两者职责清晰分离。
