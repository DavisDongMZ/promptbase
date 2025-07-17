
import os
import sys
import time
import random
import string
import argparse

import requests

# 默认配置
DEFAULT_API_URL = os.getenv("API_URL", "http://localhost:3000/prompts")
DEFAULT_COUNT = 50000
DEFAULT_WORKERS = 1  # 单线程

def random_string(length: int = 10) -> str:
    """生成随机字母数字字符串，用于 title/body 占位。"""
    chars = string.ascii_letters + string.digits + " "
    return "".join(random.choice(chars) for _ in range(length))

def make_prompt_payload(i: int) -> dict:
    """构造第 i 条 prompt 的 JSON 结构。"""
    return {
        "title": f"示例 Prompt #{i} — {random_string(8)}",
        "body": f"这是第 {i} 个 Prompt 的主体内容，示例文本：{random_string(50)}",
        "tags": ["auto", "bulk", f"batch{i % 10}"]
    }

def bulk_insert(total: int, api_url: str):
    """顺序写入 total 条记录，不并发，不显示进度条。"""
    session = requests.Session()
    success = 0
    failures = 0

    start = time.time()
    for i in range(1, total + 1):
        payload = make_prompt_payload(i)
        try:
            resp = session.post(api_url, json=payload, timeout=5)
            resp.raise_for_status()
            success += 1
        except Exception as e:
            failures += 1
            print(f"[ERROR] Prompt #{i} 创建失败：{e}", file=sys.stderr)

    elapsed = time.time() - start
    print(f"完成：共 {total} 条请求，成功 {success} 条，失败 {failures} 条")
    print(f"耗时：{elapsed:.1f} 秒，平均每条 {(elapsed/total):.3f} 秒")

def main():
    parser = argparse.ArgumentParser(description="批量写入 Prompt 数据（无进度条）")
    parser.add_argument("-n", "--number", type=int, default=DEFAULT_COUNT,
                        help="要创建的 Prompt 总数 (默认 50000)")
    parser.add_argument("--api", type=str, default=DEFAULT_API_URL,
                        help="Prompts API URL (默认 http://localhost:3000/prompts)")
    args = parser.parse_args()

    bulk_insert(args.number, args.api)

if __name__ == "__main__":
    main()
