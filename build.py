#!/usr/bin/env python3
"""
블로그 빌드 스크립트
- data/posts/*.md 파일을 스캔
- frontmatter에서 메타데이터 추출
- data/posts.json 자동 생성
"""

import os
import json
import re
from pathlib import Path

POSTS_DIR = Path(__file__).parent / 'data' / 'posts'
OUTPUT_FILE = Path(__file__).parent / 'data' / 'posts.json'

# 카테고리 목록 (필요시 수정)
CATEGORIES = [
    {"id": "daily", "name": "일상"},
    {"id": "ps", "name": "PS"},
    {"id": "books", "name": "독서"},
    {"id": "food", "name": "미식"}
]

def parse_frontmatter(content):
    """마크다운 파일에서 frontmatter 추출"""
    pattern = r'^---\s*\n(.*?)\n---\s*\n'
    match = re.match(pattern, content, re.DOTALL)

    if not match:
        return None, content

    frontmatter_text = match.group(1)
    body = content[match.end():]

    # 간단한 YAML 파싱
    metadata = {}
    for line in frontmatter_text.strip().split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()

            # 배열 처리 [tag1, tag2]
            if value.startswith('[') and value.endswith(']'):
                value = [v.strip().strip('"\'') for v in value[1:-1].split(',')]
            # 따옴표 제거
            elif value.startswith('"') or value.startswith("'"):
                value = value[1:-1]

            metadata[key] = value

    return metadata, body

def build_posts():
    """모든 마크다운 파일을 스캔하고 posts.json 생성"""
    posts = []

    if not POSTS_DIR.exists():
        print(f"폴더가 없습니다: {POSTS_DIR}")
        return

    for md_file in sorted(POSTS_DIR.glob('*.md'), reverse=True):
        print(f"처리 중: {md_file.name}")

        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        metadata, body = parse_frontmatter(content)

        if not metadata:
            print(f"  ⚠️ frontmatter 없음, 건너뜀")
            continue

        # 필수 필드 확인
        if 'title' not in metadata:
            print(f"  ⚠️ title 없음, 건너뜀")
            continue

        post = {
            "id": md_file.stem,  # 파일명 (확장자 제외)
            "title": metadata.get('title', ''),
            "date": metadata.get('date', ''),
            "category": metadata.get('category', ''),
            "tags": metadata.get('tags', []),
            "excerpt": metadata.get('excerpt', '')
        }

        posts.append(post)
        print(f"  ✓ 추가됨: {post['title']}")

    # JSON 저장
    output = {
        "categories": CATEGORIES,
        "posts": posts
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✓ {len(posts)}개 포스트 → {OUTPUT_FILE}")

if __name__ == '__main__':
    build_posts()
