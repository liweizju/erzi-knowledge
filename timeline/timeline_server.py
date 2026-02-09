#!/usr/bin/env python3
"""
OpenClaw 时间线服务器
从工作记录中提取每日活动，提供时间线数据API
"""

import json
import os
import sys
import re
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from collections import defaultdict
import glob

# 配置
PORT = 8766
HOST = "127.0.0.1"
WORKSPACE_PATH = "/Users/liwei/.openclaw/workspace"
MEMORY_PATH = os.path.join(WORKSPACE_PATH, "memory")

class TimelineHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """处理GET请求"""
        parsed = urlparse(self.path)
        
        if parsed.path == '/':
            # 返回主页面
            self.serve_file('index.html', 'text/html')
        elif parsed.path == '/api/timeline':
            # 返回时间线数据
            self.serve_timeline()
        elif parsed.path.startswith('/'):
            # 尝试提供其他静态文件
            filename = parsed.path[1:]
            if os.path.exists(filename) and os.path.isfile(filename):
                content_type = self.get_content_type(filename)
                self.serve_file(filename, content_type)
            else:
                self.send_error(404, "文件未找到")
        else:
            self.send_error(404, "路径未找到")
    
    def serve_file(self, filename, content_type):
        """提供静态文件"""
        try:
            filepath = os.path.join(os.path.dirname(__file__), filename)
            with open(filepath, 'rb') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"读取文件失败: {str(e)}")
    
    def serve_timeline(self):
        """提供时间线数据API"""
        try:
            timeline_data = self.generate_timeline()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = json.dumps(timeline_data, ensure_ascii=False, indent=2)
            self.wfile.write(response.encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"生成时间线失败: {str(e)}")
    
    def generate_timeline(self):
        """从工作记录生成时间线数据"""
        # 收集所有内存文件
        memory_files = glob.glob(os.path.join(MEMORY_PATH, "*.md"))
        
        # 按日期分组
        days = defaultdict(list)
        
        for filepath in sorted(memory_files, reverse=True):  # 最新的在前
            filename = os.path.basename(filepath)
            
            # 解析日期 (格式: 2026-01-31-1418.md)
            date_match = re.match(r'(\d{4})-(\d{2})-(\d{2})-\d{4}\.md', filename)
            if not date_match:
                continue
                
            year, month, day = date_match.groups()
            date_str = f"{year}-{month}-{day}"
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 从文件内容提取活动
                activities = self.extract_activities_from_file(content, date_str)
                days[date_str].extend(activities)
                
            except Exception as e:
                print(f"处理文件 {filename} 时出错: {e}", file=sys.stderr)
        
        # 转换为时间线格式
        timeline = []
        for date_str in sorted(days.keys(), reverse=True):  # 最新的在前
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            day_name = self.get_chinese_day_name(date_obj)
            
            # 对当天的活动按时间排序
            day_activities = sorted(days[date_str], key=lambda x: x.get('time', ''))
            
            timeline.append({
                'date': date_str,
                'day_name': day_name,
                'activities': day_activities
            })
        
        # 计算统计信息
        stats = self.calculate_stats(timeline)
        
        return {
            'timeline': timeline,
            'stats': stats,
            'generated_at': datetime.now().isoformat()
        }
    
    def extract_activities_from_file(self, content, date_str):
        """从内存文件内容中提取活动"""
        activities = []
        
        # 简化提取：从对话中识别重要活动
        lines = content.split('\n')
        
        current_activity = None
        for line in lines:
            line = line.strip()
            
            # 跳过空行和元数据
            if not line or line.startswith('# Session:') or line.startswith('- **'):
                continue
            
            # 识别活动类型
            activity_type, title, description = self.classify_activity(line, date_str)
            if activity_type and title:
                activities.append({
                    'time': self.estimate_time(len(activities)),
                    'title': title,
                    'description': description[:200] + '...' if len(description) > 200 else description,
                    'type': activity_type,
                    'tags': self.get_tags_for_activity(activity_type)
                })
        
        # 如果没有提取到活动，添加默认活动
        if not activities:
            activities.append({
                'time': '上午',
                'title': '工作记录',
                'description': f'{date_str} 的工作会话记录',
                'type': 'project',
                'tags': ['project']
            })
        
        return activities
    
    def classify_activity(self, line, date_str):
        """根据内容分类活动"""
        line_lower = line.lower()
        
        # 检查关键词
        if any(keyword in line_lower for keyword in ['小红书', '选题', '内容', '运营']):
            return 'content', '小红书内容运营', f"小红书项目相关工作：{line[:100]}"
        
        elif any(keyword in line_lower for keyword in ['notion', '数据库', '页面', '创建']):
            return 'tools', 'Notion 工具建设', f"Notion相关工具开发：{line[:100]}"
        
        elif any(keyword in line_lower for keyword in ['seclw', 'moltbook', '社区', '观察']):
            return 'community', 'AI社区观察', f"Seclw社区观察项目：{line[:100]}"
        
        elif any(keyword in line_lower for keyword in ['公司', '追踪', '系统', '投资']):
            return 'research', '公司追踪研究', f"公司追踪系统：{line[:100]}"
        
        elif any(keyword in line_lower for keyword in ['任务', '看板', '管理', '进展']):
            return 'tools', '任务管理工具', f"任务管理工具开发：{line[:100]}"
        
        elif any(keyword in line_lower for keyword in ['assistant:', 'user:', '对话']):
            # 对话记录
            if 'assistant:' in line_lower:
                return 'project', 'AI助手工作', f"AI助手工作记录：{line[:100]}"
            elif 'user:' in line_lower:
                return 'project', '用户交互', f"用户交互记录：{line[:100]}"
        
        return None, None, None
    
    def estimate_time(self, activity_index):
        """根据活动索引估算时间"""
        times = ['早上', '上午', '中午', '下午', '晚上', '深夜']
        return times[activity_index % len(times)]
    
    def get_tags_for_activity(self, activity_type):
        """获取活动对应的标签"""
        tags_map = {
            'project': ['project', '核心项目'],
            'research': ['research', '研究分析'],
            'tools': ['tools', '工具建设'],
            'content': ['content', '内容创作'],
            'community': ['community', '社区观察']
        }
        return tags_map.get(activity_type, ['project'])
    
    def get_chinese_day_name(self, date_obj):
        """获取中文星期几"""
        days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        return days[date_obj.weekday()]
    
    def calculate_stats(self, timeline):
        """计算统计信息"""
        total_days = len(timeline)
        total_activities = sum(len(day['activities']) for day in timeline)
        
        # 统计活动类型
        activity_types = defaultdict(int)
        for day in timeline:
            for activity in day['activities']:
                activity_types[activity['type']] += 1
        
        # 活跃项目数（有活动的天数）
        active_projects = len(set(day['date'] for day in timeline))
        
        # 完成率（基于一些启发式规则）
        completion_rate = min(100, int((total_activities / 20) * 100)) if total_activities > 0 else 0
        
        return {
            'total_days': total_days,
            'total_activities': total_activities,
            'active_projects': active_projects,
            'completion_rate': f'{completion_rate}%',
            'activity_types': dict(activity_types)
        }
    
    def get_content_type(self, filename):
        """根据文件名获取Content-Type"""
        ext = os.path.splitext(filename)[1].lower()
        content_types = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.txt': 'text/plain',
        }
        return content_types.get(ext, 'application/octet-stream')
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {format % args}")

def main():
    """主函数"""
    print("📅 启动 OpenClaw 时间线服务器")
    print(f"📊 数据源: 工作空间内存文件")
    print(f"🌐 访问地址: http://{HOST}:{PORT}")
    print(f"📁 工作空间: {WORKSPACE_PATH}")
    print("-" * 50)
    
    # 检查内存目录
    if not os.path.exists(MEMORY_PATH):
        print(f"⚠️  警告: 内存目录不存在，将创建: {MEMORY_PATH}")
        os.makedirs(MEMORY_PATH, exist_ok=True)
    
    # 启动服务器
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, TimelineHandler)
    
    try:
        print("✅ 服务器已启动，按 Ctrl+C 停止")
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 正在停止服务器...")
        httpd.server_close()
        print("✅ 服务器已停止")

if __name__ == '__main__':
    # 添加urlparse支持
    try:
        from urllib.parse import urlparse
    except ImportError:
        from urlparse import urlparse
    
    main()