#!/bin/bash
# erzi-knowledge 自动部署脚本
# 由 launchd WatchPaths 触发，监听 knowledge/ 目录变化

set -euo pipefail

PROJECT_DIR="/Users/liwei/workspace/erzi-knowledge"
KNOWLEDGE_DIR="/Users/liwei/.openclaw/workspace/knowledge"
LOG_FILE="/Users/liwei/.openclaw/logs/erzi-knowledge-deploy.log"
LOCK_DIR="/tmp/erzi-knowledge-deploy.lock"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# 文件锁：用 mkdir 原子操作防止并发
cleanup() {
    rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    log "SKIP: 另一个部署正在进行中"
    exit 0
fi

log "触发：检查 knowledge/ 是否有变更..."

# 检查 dist/index.html 是否存在（首次构建）
if [ ! -f "$PROJECT_DIR/dist/index.html" ]; then
    log "dist/index.html 不存在，执行首次构建"
else
    # 检查 knowledge/ 下是否有比 dist/index.html 更新的文件
    NEWER_FILES=$(find "$KNOWLEDGE_DIR" -name '*.md' -newer "$PROJECT_DIR/dist/index.html" 2>/dev/null | head -5)
    if [ -z "$NEWER_FILES" ]; then
        log "SKIP: 无新变更"
        exit 0
    fi
    log "检测到变更文件: $(echo "$NEWER_FILES" | tr '\n' ' ')"
fi

cd "$PROJECT_DIR"

# 构建
log "开始构建..."
if ! npm run build >> "$LOG_FILE" 2>&1; then
    log "ERROR: npm run build 失败"
    exit 1
fi
log "构建完成"

# 检查 dist 是否有实际变化
if git diff --quiet dist/ 2>/dev/null && [ -z "$(git ls-files --others dist/)" ]; then
    log "SKIP: dist/ 无变化，跳过部署"
    exit 0
fi

# 提交并部署
log "开始部署..."
git add dist -f
git commit -m "自动更新知识数据 $(date '+%Y-%m-%d %H:%M')" >> "$LOG_FILE" 2>&1

# 用 subtree split 生成 dist-only 的 commit，然后 push
# 如果 gh-pages 有不在本地的历史（比如 agent 之前手动 push 的），subtree push 会失败
# 所以先尝试普通 push，失败则 force push（gh-pages 只是构建产物，force push 安全）
SPLIT_SHA=$(git subtree split --prefix dist)
log "subtree split SHA: $SPLIT_SHA"

PUSH_REFSPEC="${SPLIT_SHA}:gh-pages"
if git push origin "$PUSH_REFSPEC" >> "$LOG_FILE" 2>&1; then
    log "OK: 部署成功"
elif git push origin "$PUSH_REFSPEC" --force >> "$LOG_FILE" 2>&1; then
    log "OK: 部署成功 (force push)"
else
    log "ERROR: push to gh-pages 失败"
    exit 1
fi
