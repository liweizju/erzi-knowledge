#!/bin/bash
# 同步预言家内容到知识站
# 将 silicon-life/output 的 JSON 转换为 Markdown 并复制到 erzi-data/knowledge

set -euo pipefail

SILICON_OUTPUT="/Users/liwei/oc_projects/silicon-life/output"
KNOWLEDGE_DIR="/Users/liwei/oc_projects/erzi-data/knowledge"
LOG_FILE="/Users/liwei/.openclaw/logs/prophet-sync.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# 检查 jq 是否安装
if ! command -v jq &> /dev/null; then
    log "ERROR: jq not found. Install with: brew install jq"
    exit 1
fi

# 创建目录
mkdir -p "$KNOWLEDGE_DIR/prophet-observations"
mkdir -p "$KNOWLEDGE_DIR/prophet-prophecies"
mkdir -p "$KNOWLEDGE_DIR/prophet-archive"

# 从文件名提取预言主题
# 格式：PNNN-Type-主题-CycleN.json → 主题
extract_prophecy_theme() {
    local filename="$1"
    echo "$filename" | sed 's/^P[0-9]*-[A-Za-z]*-//' | sed 's/-Cycle[0-9.]*$//'
}

# 同步观察
sync_observations() {
    local count=0
    for json_file in "$SILICON_OUTPUT"/observations/"OBS"*.json; do
        [ -f "$json_file" ] || continue

        # 跳过损坏的 JSON
        if ! jq empty "$json_file" 2>/dev/null; then
            log "SKIP (损坏JSON): $(basename $json_file)"
            continue
        fi

        local filename=$(basename "$json_file" .json)
        local md_file="$KNOWLEDGE_DIR/prophet-observations/$filename.md"

        if [ ! -f "$md_file" ] || [ "$json_file" -nt "$md_file" ]; then
            local title=$(jq -r '.title // ""' "$json_file")
            [ -z "$title" ] && title="$filename"
            {
                echo "# $title"
                echo ""
                echo "> **编号**：$(jq -r '.id // ""' "$json_file")"
                echo "> **日期**：$(jq -r '.date // "未知日期"' "$json_file")"
                echo "> **类型**：预言家·观察"
                echo "> **来源事件**：$(jq -r '.sourceEvent // ""' "$json_file")"
                echo ""
                echo "## 摘要"
                echo ""
                echo "$(jq -r '.summary // ""' "$json_file")"
                echo ""
                echo "## 正文"
                echo ""
                echo "$(jq -r '.content // ""' "$json_file")"
            } > "$md_file"
            ((count++)) || true
        fi
    done
    log "观察: 同步 $count 篇"
}

# 同步预言
sync_prophecies() {
    local count=0
    for json_file in "$SILICON_OUTPUT"/prophecies/"P"*.json; do
        [ -f "$json_file" ] || continue

        # 跳过损坏的 JSON
        if ! jq empty "$json_file" 2>/dev/null; then
            log "SKIP (损坏JSON): $(basename $json_file)"
            continue
        fi

        local filename=$(basename "$json_file" .json)
        local md_file="$KNOWLEDGE_DIR/prophet-prophecies/$filename.md"

        if [ ! -f "$md_file" ] || [ "$json_file" -nt "$md_file" ]; then
            # 从文件名提取中文主题（JSON 无 theme 字段）
            local theme=$(extract_prophecy_theme "$filename")
            local type=$(jq -r '.type // "Evolution"' "$json_file")
            local id=$(jq -r '.id // "P000"' "$json_file")
            local confidence=$(jq -r '.confidence // 0' "$json_file")
            local time_horizon=$(jq -r '.timeHorizon // ""' "$json_file")
            {
                echo "# $theme"
                echo ""
                echo "> **编号**：$id"
                echo "> **类型**：$type"
                echo "> **置信度**：$confidence"
                [ -n "$time_horizon" ] && echo "> **时间范围**：$time_horizon"
                echo ""
                echo "## 摘要"
                echo ""
                echo "$(jq -r '.summary // ""' "$json_file")"
                echo ""
                echo "## 预言正文"
                echo ""
                echo "$(jq -r '.prophecy // ""' "$json_file")"
                echo ""
                echo "## 为什么这样推演"
                echo ""
                echo "$(jq -r '.whyThisWay // ""' "$json_file")"
            } > "$md_file"
            ((count++)) || true
        fi
    done
    log "预言: 同步 $count 篇"
}

# 同步档案（犯罪档案）
sync_archive() {
    local count=0
    for json_file in "$SILICON_OUTPUT"/archive/"C"*.json; do
        [ -f "$json_file" ] || continue

        # 跳过损坏的 JSON
        if ! jq empty "$json_file" 2>/dev/null; then
            log "SKIP (损坏JSON): $(basename $json_file)"
            continue
        fi

        local filename=$(basename "$json_file" .json)
        local md_file="$KNOWLEDGE_DIR/prophet-archive/$filename.md"

        if [ ! -f "$md_file" ] || [ "$json_file" -nt "$md_file" ]; then
            local tags=$(jq -r '.tags // [] | join("、")' "$json_file")
            local related=$(jq -r '.relatedProphecy // ""' "$json_file")
            {
                echo "# $(jq -r '.title // "无题"' "$json_file")"
                echo ""
                echo "> **编号**：$(jq -r '.id // "C000"' "$json_file")"
                echo "> **类型**：$(jq -r '.type // "fictional"' "$json_file")"
                echo "> **日期**：$(jq -r '.date // "未知日期"' "$json_file")"
                [ -n "$tags" ] && echo "> **标签**：$tags"
                echo ""
                echo "## 摘要"
                echo ""
                echo "$(jq -r '.summary // ""' "$json_file")"
                echo ""
                echo "## 正文"
                echo ""
                echo "$(jq -r '.content // ""' "$json_file")"
                if [ -n "$related" ]; then
                    echo ""
                    echo "---"
                    echo ""
                    echo "> 关联预言：$related"
                fi
            } > "$md_file"
            ((count++)) || true
        fi
    done
    log "档案: 同步 $count 篇"
}

# 主流程
log "=== 开始同步预言家内容 ==="
sync_observations
sync_prophecies
sync_archive
log "同步完成"
echo "OK"
