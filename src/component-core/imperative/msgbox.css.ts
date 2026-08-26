export const msgboxCSS = `
.q-msgbox {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 320px;
    max-width: 420px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 10000;
    overflow: hidden;
}

.q-msgbox__header {
    padding: 16px 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
}

.q-msgbox__body {
    padding: 12px 20px 20px;
    font-size: 14px;
    color: #475569;
    line-height: 1.5;
}

.q-msgbox__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 20px;
    border-top: 1px solid #e2e8f0;
}

.q-msgbox-mask {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
}

.q-btn {
    padding: 6px 16px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background: #fff;
    font-size: 14px;
    cursor: pointer;
    color: #334155;
}

.q-btn--primary {
    background: #3b82f6;
    color: #fff;
    border-color: #3b82f6;
}
`;